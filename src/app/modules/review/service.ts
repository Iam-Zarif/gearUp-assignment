import { RentalStatus, UserRole } from "../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import { prisma } from "../../helpers/prisma";
import { TCreateReviewPayload, TUpdateReviewPayload } from "./interface";

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
  payload: TCreateReviewPayload,
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
    (item) => item.gearItemId === payload.gearItemId,
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

const getAllReviews = async (
  gearItemId?: string,
  query: Record<string, unknown> = {}
) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  const where = {
    ...(gearItemId && { gearItemId }),
  };

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: reviewIncludeOptions,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
  };
};

const getSingleReview = async (id: string) => {
  const result = await prisma.review.findUnique({
    where: {
      id,
    },
    include: reviewIncludeOptions,
  });

  if (!result) {
    throw new AppError(404, "Review not found");
  }

  return result;
};

const updateReview = async (
  id: string,
  customerId: string,
  payload: TUpdateReviewPayload,
) => {
  const review = await prisma.review.findUnique({
    where: {
      id,
    },
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  if (review.customerId !== customerId) {
    throw new AppError(403, "You can update only your own review");
  }

  const result = await prisma.review.update({
    where: {
      id,
    },
    data: payload,
    include: reviewIncludeOptions,
  });

  return result;
};

const deleteReview = async (id: string, userId: string, role: UserRole) => {
  const review = await prisma.review.findUnique({
    where: {
      id,
    },
  });

  if (!review) {
    throw new AppError(404, "Review not found");
  }

  if (role !== UserRole.ADMIN && review.customerId !== userId) {
    throw new AppError(403, "You can delete only your own review");
  }

  const result = await prisma.review.delete({
    where: {
      id,
    },
  });

  return result;
};

export const ReviewServices = {
  createReview,
  getSingleReview,
  updateReview,
  deleteReview,
  getAllReviews,
};
