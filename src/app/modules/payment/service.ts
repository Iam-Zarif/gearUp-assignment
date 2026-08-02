import {
  PaymentProvider,
  PaymentStatus,
} from "../../../generated/prisma/client";
import config from "../../config";
import AppError from "../../errors/AppError";
import { prisma } from "../../helpers/prisma";
import { stripe } from "../../helpers/stripe";
import { STRIPE_CURRENCY, STRIPE_PAYMENT_METHOD } from "./constant";
import { TConfirmPaymentPayload, TCreatePaymentPayload } from "./interface";
import { paymentIncludeOptions, PaymentUtils } from "./utils";

const createPaymentSession = async (
  customerId: string,
  payload: TCreatePaymentPayload
) => {
  return prisma.$transaction(async (transactionClient) => {
    await transactionClient.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`payment:${payload.rentalOrderId}`}))`;

    const rentalOrder = await transactionClient.rentalOrder.findUnique({
      where: {
        id: payload.rentalOrderId,
      },
      include: {
        customer: true,
        payment: true,
      },
    });

    if (!rentalOrder) {
      throw new AppError(404, "Rental order not found");
    }

    const amount = PaymentUtils.validateRentalOrderForPayment(
      rentalOrder,
      customerId
    );

    if (rentalOrder.payment?.transactionId) {
      const existingSession = await stripe.checkout.sessions.retrieve(
        rentalOrder.payment.transactionId
      );

      if (existingSession.status === "open" && existingSession.url) {
        const payment = await transactionClient.payment.findUniqueOrThrow({
          where: { id: rentalOrder.payment.id },
          include: paymentIncludeOptions,
        });

        return {
          payment,
          sessionId: existingSession.id,
          checkoutUrl: existingSession.url,
        };
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: rentalOrder.customer.email,
      line_items: [
        {
          price_data: {
            currency: STRIPE_CURRENCY,
            product_data: {
              name: "GearUp Rental Order",
              description: `Rental order id: ${rentalOrder.id}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        rentalOrderId: rentalOrder.id,
        customerId,
      },
      success_url: `${config.stripe.success_url}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: config.stripe.cancel_url,
    });

    const paymentData = {
      transactionId: session.id,
      amount,
      provider: PaymentProvider.STRIPE,
      method: STRIPE_PAYMENT_METHOD,
      status: PaymentStatus.PENDING,
      paidAt: null,
    };

    const payment = rentalOrder.payment
      ? await transactionClient.payment.update({
          where: { id: rentalOrder.payment.id },
          data: paymentData,
          include: paymentIncludeOptions,
        })
      : await transactionClient.payment.create({
          data: {
            rentalOrderId: rentalOrder.id,
            customerId,
            ...paymentData,
          },
          include: paymentIncludeOptions,
        });

    return {
      payment,
      sessionId: session.id,
      checkoutUrl: session.url,
    };
  }, { timeout: 15000 });
};

const confirmPayment = async (
  customerId: string,
  payload: TConfirmPaymentPayload
) => {
  const session = await stripe.checkout.sessions.retrieve(payload.sessionId);

  const payment = await prisma.payment.findUnique({
    where: {
      transactionId: payload.sessionId,
    },
    include: {
      rentalOrder: true,
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found");
  }

  PaymentUtils.validatePaymentOwnership(
    payment.customerId,
    customerId,
    "You can confirm only your own payment"
  );

  if (payment.status === PaymentStatus.COMPLETED) {
    return PaymentUtils.getPaymentDetails(payment.id);
  }

  if (session.payment_status !== "paid") {
    return PaymentUtils.getPaymentDetails(payment.id);
  }

  const result = await PaymentUtils.markPaymentAsCompleted(
    payment.id,
    payment.rentalOrderId
  );

  return result;
};

const getMyPayments = async (customerId: string, query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const where = { customerId };
  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: paymentIncludeOptions,
    }),
    prisma.payment.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
};

const getSinglePayment = async (id: string, customerId: string) => {
  const result = await prisma.payment.findUnique({
    where: {
      id,
    },
    include: paymentIncludeOptions,
  });

  if (!result) {
    throw new AppError(404, "Payment not found");
  }

  PaymentUtils.validatePaymentOwnership(
    result.customerId,
    customerId,
    "You can view only your own payment"
  );

  return result;
};

const handleSuccessPayment = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  const payment = await prisma.payment.findUnique({
    where: {
      transactionId: sessionId,
    },
  });

  if (!payment) {
    throw new AppError(404, "Payment record not found");
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return PaymentUtils.getPaymentDetails(payment.id);
  }

  if (session.payment_status !== "paid") {
    return PaymentUtils.getPaymentDetails(payment.id);
  }

  const result = await PaymentUtils.markPaymentAsCompleted(
    payment.id,
    payment.rentalOrderId
  );

  return result;
};

export const PaymentServices = {
  createPaymentSession,
  confirmPayment,
  getMyPayments,
  getSinglePayment,
  handleSuccessPayment,
};
