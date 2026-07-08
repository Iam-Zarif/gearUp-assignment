import { RentalStatus } from "../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import { prisma } from "../../helpers/prisma";
import { TCreateReviewPayload } from "./interface";

const reviewIncludeOptions = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  gearItem: {
    include: {
      category: true,
    },
  },
  rentalOrder: true,
};

const createReview = async (
  customerId: string,
  payload: TCreateReviewPayload
) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: {
      id: payload.rentalOrderId,
    },
    include: {
      items: true,
    },
  });

  if (!rentalOrder) {
    throw new AppError(404, "Rental order not found");
  }

  if (rentalOrder.customerId !== customerId) {
    throw new AppError(403, "You can review only your own rental order");
  }

  if (rentalOrder.status !== RentalStatus.RETURNED) {
    throw new AppError(400, "You can review only after returning the gear");
  }

  const isGearInRentalOrder = rentalOrder.items.some(
    (item) => item.gearItemId === payload.gearItemId
  );

  if (!isGearInRentalOrder) {
    throw new AppError(400, "This gear item is not part of this rental order");
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      customerId_gearItemId_rentalOrderId: {
        customerId,
        gearItemId: payload.gearItemId,
        rentalOrderId: payload.rentalOrderId,
      },
    },
  });

  if (existingReview) {
    throw new AppError(409, "You have already reviewed this gear item");
  }

  const result = await prisma.review.create({
    data: {
      customerId,
      gearItemId: payload.gearItemId,
      rentalOrderId: payload.rentalOrderId,
      rating: payload.rating,
      comment: payload.comment,
    },
    include: reviewIncludeOptions,
  });

  return result;
};

export const ReviewServices = {
  createReview,
};