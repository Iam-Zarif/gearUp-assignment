import { prisma } from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import { TCreateRentalPayload, TUpdateRentalStatusPayload } from "./interface";
import { rentalIncludeOptions, RentalUtils } from "./utlis";


const createRental = async (
  customerId: string,
  payload: TCreateRentalPayload
) => {
  const startDate = new Date(payload.startDate);
  const endDate = new Date(payload.endDate);

  RentalUtils.validateRentalDates(startDate, endDate);

  const gearItemIds = payload.items.map((item) => item.gearItemId);

  const gearItems = await prisma.gearItem.findMany({
    where: {
      id: {
        in: gearItemIds,
      },
    },
  });

  if (gearItems.length !== gearItemIds.length) {
    throw new AppError(404, "One or more gear items not found");
  }

  const providerIds = [...new Set(gearItems.map((gear) => gear.providerId))];

  if (providerIds.length > 1) {
    throw new AppError(
      400,
      "All gear items in one rental must be from same provider"
    );
  }

  const rentalDays = RentalUtils.calculateRentalDays(startDate, endDate);

  let totalAmount = 0;

  const orderItemsData = payload.items.map((item) => {
    const gearItem = gearItems.find((gear) => gear.id === item.gearItemId);

    if (!gearItem) {
      throw new AppError(404, "Gear item not found");
    }

    RentalUtils.validateGearAvailability(gearItem, item.quantity);

    const pricePerDay = Number(gearItem.pricePerDay);
    const subtotal = pricePerDay * item.quantity * rentalDays;

    totalAmount += subtotal;

    return {
      gearItemId: gearItem.id,
      providerId: gearItem.providerId,
      quantity: item.quantity,
      pricePerDay,
      subtotal,
    };
  });

  const result = await prisma.$transaction(async (transactionClient) => {
    const rentalOrder = await transactionClient.rentalOrder.create({
      data: {
        customerId,
        startDate,
        endDate,
        totalAmount,
        items: {
          create: orderItemsData,
        },
      },
      include: rentalIncludeOptions,
    });

    for (const item of payload.items) {
      await transactionClient.gearItem.update({
        where: {
          id: item.gearItemId,
        },
        data: {
          availableQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    return rentalOrder;
  });

  return result;
};

const getMyRentals = async (customerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: {
      customerId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: rentalIncludeOptions,
  });

  return result;
};

const getSingleRental = async (id: string, userId: string) => {
  const result = await prisma.rentalOrder.findUnique({
    where: {
      id,
    },
    include: rentalIncludeOptions,
  });

  if (!result) {
    throw new AppError(404, "Rental order not found");
  }

  const isCustomer = result.customerId === userId;
  const isProvider = result.items.some((item) => item.providerId === userId);

  if (!isCustomer && !isProvider) {
    throw new AppError(403, "You are not allowed to view this rental order");
  }

  return result;
};

const getProviderOrders = async (providerId: string) => {
  const result = await prisma.rentalOrder.findMany({
    where: {
      items: {
        some: {
          providerId,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: rentalIncludeOptions,
  });

  return result;
};

const updateProviderOrderStatus = async (
  id: string,
  providerId: string,
  payload: TUpdateRentalStatusPayload
) => {
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: {
      id,
    },
    include: {
      items: true,
    },
  });

  if (!rentalOrder) {
    throw new AppError(404, "Rental order not found");
  }

  const isProviderOrder = rentalOrder.items.some(
    (item) => item.providerId === providerId
  );

  if (!isProviderOrder) {
    throw new AppError(403, "You can update only your own rental orders");
  }

  const nextStatus = payload.status;

  RentalUtils.validateProviderStatusTransition(rentalOrder.status, nextStatus);

  const itemStatus = RentalUtils.mapRentalStatusToItemStatus(nextStatus);

  const result = await prisma.$transaction(async (transactionClient) => {
    const updatedOrder = await transactionClient.rentalOrder.update({
      where: {
        id,
      },
      data: {
        status: nextStatus,
      },
      include: rentalIncludeOptions,
    });

    await transactionClient.rentalOrderItem.updateMany({
      where: {
        rentalOrderId: id,
        providerId,
      },
      data: {
        status: itemStatus,
      },
    });

    if (nextStatus === "CANCELLED" || nextStatus === "RETURNED") {
      for (const item of rentalOrder.items) {
        await transactionClient.gearItem.update({
          where: {
            id: item.gearItemId,
          },
          data: {
            availableQuantity: {
              increment: item.quantity,
            },
          },
        });
      }
    }

    return updatedOrder;
  });

  return result;
};

export const RentalServices = {
  createRental,
  getMyRentals,
  getSingleRental,
  getProviderOrders,
  updateProviderOrderStatus,
};