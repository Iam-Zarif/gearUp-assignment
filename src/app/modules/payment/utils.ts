import {
  PaymentStatus,
  Prisma,
  RentalStatus,
} from "../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import { prisma } from "../../helpers/prisma";

export const paymentIncludeOptions = {
  rentalOrder: {
    include: {
      items: {
        include: {
          gearItem: true,
        },
      },
    },
  },
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  },
} satisfies Prisma.PaymentInclude;

const validatePaymentOwnership = (
  paymentCustomerId: string,
  requestUserId: string,
  message: string
) => {
  if (paymentCustomerId !== requestUserId) {
    throw new AppError(403, message);
  }
};

const validateRentalOrderForPayment = (rentalOrder: {
  customerId: string;
  status: RentalStatus;
  totalAmount: Prisma.Decimal;
  payment: {
    status: PaymentStatus;
  } | null;
}, customerId: string) => {
  if (rentalOrder.customerId !== customerId) {
    throw new AppError(403, "You can pay only for your own rental order");
  }

  if (rentalOrder.status !== RentalStatus.CONFIRMED) {
    throw new AppError(400, "Only confirmed rental orders can be paid");
  }

  if (rentalOrder.payment?.status === PaymentStatus.COMPLETED) {
    throw new AppError(400, "Payment already completed for this rental order");
  }

  const amount = Number(rentalOrder.totalAmount);

  if (amount <= 0) {
    throw new AppError(400, "Invalid payment amount");
  }

  return amount;
};

const markPaymentAsCompleted = async (
  paymentId: string,
  rentalOrderId: string
) => {
  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedPayment = await transactionClient.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
      include: paymentIncludeOptions,
    });

    await transactionClient.rentalOrder.update({
      where: {
        id: rentalOrderId,
      },
      data: {
        status: RentalStatus.PAID,
      },
    });

    return updatedPayment;
  });

  return result;
};

const markPaymentAsFailed = async (paymentId: string) => {
  const result = await prisma.payment.update({
    where: {
      id: paymentId,
    },
    data: {
      status: PaymentStatus.FAILED,
    },
    include: paymentIncludeOptions,
  });

  return result;
};

const getCompletedPayment = async (paymentId: string) => {
  const result = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: paymentIncludeOptions,
  });

  return result;
};

export const PaymentUtils = {
  validatePaymentOwnership,
  validateRentalOrderForPayment,
  markPaymentAsCompleted,
  markPaymentAsFailed,
  getCompletedPayment,
};