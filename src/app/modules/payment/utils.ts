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

const validateRentalOrderForPayment = (
  rentalOrder: {
    customerId: string;
    status: RentalStatus;
    totalAmount: Prisma.Decimal;
    payment: {
      status: PaymentStatus;
    } | null;
  },
  customerId: string
) => {
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
    const paymentUpdate = await transactionClient.payment.updateMany({
      where: {
        id: paymentId,
        status: PaymentStatus.PENDING,
      },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    if (paymentUpdate.count === 0) {
      return transactionClient.payment.findUniqueOrThrow({
        where: { id: paymentId },
        include: paymentIncludeOptions,
      });
    }

    const rentalUpdate = await transactionClient.rentalOrder.updateMany({
      where: {
        id: rentalOrderId,
        status: {
          in: [RentalStatus.PLACED, RentalStatus.CONFIRMED],
        },
      },
      data: {
        status: RentalStatus.PAID,
      },
    });

    if (rentalUpdate.count !== 1) {
      throw new AppError(409, "Rental order can no longer be marked as paid");
    }

    return transactionClient.payment.findUniqueOrThrow({
      where: { id: paymentId },
      include: paymentIncludeOptions,
    });
  });

  return result;
};

const getPaymentDetails = async (paymentId: string) => {
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
  getPaymentDetails,
};
