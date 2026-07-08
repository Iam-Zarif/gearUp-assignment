import AppError from "../../errors/AppError";
import { prisma } from "../../helpers/prisma";
import { TCreateGearPayload, TGearQuery, TUpdateGearPayload } from "./interface";
import { GearUtils } from "./utils";

const gearIncludeOptions = {
  category: true,
  provider: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  },
};

const createGear = async (providerId: string, payload: TCreateGearPayload) => {
  const category = await prisma.category.findUnique({
    where: {
      id: payload.categoryId,
    },
  });

  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const result = await prisma.gearItem.create({
    data: {
      providerId,
      categoryId: payload.categoryId,
      name: payload.name,
      brand: payload.brand,
      description: payload.description,
      pricePerDay: payload.pricePerDay,
      stockQuantity: payload.stockQuantity,
      availableQuantity: payload.availableQuantity ?? payload.stockQuantity,
      imageUrl: payload.imageUrl,
      specifications: payload.specifications,
    },
    include: gearIncludeOptions,
  });

  return result;
};

const getAllGear = async (query: TGearQuery) => {
  const whereConditions = GearUtils.buildGearWhereConditions(query);
  const orderBy = GearUtils.buildGearOrderBy(query);
  const { page, limit, skip } = GearUtils.getPaginationOptions(query);

  const [result, total] = await Promise.all([
    prisma.gearItem.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy,
      include: gearIncludeOptions,
    }),

    prisma.gearItem.count({
      where: whereConditions,
    }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: result,
  };
};

const getSingleGear = async (id: string) => {
  const result = await prisma.gearItem.findUnique({
    where: {
      id,
    },
    include: {
      ...gearIncludeOptions,
      reviews: true,
    },
  });

  if (!result) {
    throw new AppError(404, "Gear item not found");
  }

  return result;
};

const updateGear = async (
  id: string,
  providerId: string,
  payload: TUpdateGearPayload
) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: {
      id,
    },
  });

  if (!gearItem) {
    throw new AppError(404, "Gear item not found");
  }

  if (gearItem.providerId !== providerId) {
    throw new AppError(403, "You can update only your own gear item");
  }

  if (payload.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: payload.categoryId,
      },
    });

    if (!category) {
      throw new AppError(404, "Category not found");
    }
  }

  const finalStockQuantity = payload.stockQuantity ?? gearItem.stockQuantity;
  const finalAvailableQuantity =
    payload.availableQuantity ?? gearItem.availableQuantity;

  if (finalAvailableQuantity > finalStockQuantity) {
    throw new AppError(
      400,
      "Available quantity cannot be greater than stock quantity"
    );
  }

  const result = await prisma.gearItem.update({
    where: {
      id,
    },
    data: payload,
    include: gearIncludeOptions,
  });

  return result;
};

const deleteGear = async (id: string, providerId: string) => {
  const gearItem = await prisma.gearItem.findUnique({
    where: {
      id,
    },
  });

  if (!gearItem) {
    throw new AppError(404, "Gear item not found");
  }

  if (gearItem.providerId !== providerId) {
    throw new AppError(403, "You can delete only your own gear item");
  }

  const rentalItemCount = await prisma.rentalOrderItem.count({
    where: {
      gearItemId: id,
    },
  });

  if (rentalItemCount > 0) {
    throw new AppError(
      400,
      "Cannot delete gear item because it is already used in rental orders"
    );
  }

  const result = await prisma.gearItem.delete({
    where: {
      id,
    },
  });

  return result;
};

export const GearServices = {
  createGear,
  getAllGear,
  getSingleGear,
  updateGear,
  deleteGear,
};