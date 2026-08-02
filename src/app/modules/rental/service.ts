import { prisma } from "../../helpers/prisma";
import AppError from "../../errors/AppError";
import { PaymentProvider, PaymentStatus } from "../../../generated/prisma/client";
import { TCreateRentalPayload, TUpdateRentalStatusPayload } from "./interface";
import { rentalIncludeOptions, RentalUtils } from "./utils";


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
    for (const item of orderItemsData) {
      const reservation = await transactionClient.gearItem.updateMany({
        where: {
          id: item.gearItemId,
          status: "AVAILABLE",
          availableQuantity: {
            gte: item.quantity,
          },
        },
        data: {
          availableQuantity: {
            decrement: item.quantity,
          },
        },
      });

      if (reservation.count !== 1) {
        throw new AppError(409, "This equipment is no longer available in the requested quantity");
      }
    }

    const rentalOrder = await transactionClient.rentalOrder.create({
      data: {
        customerId,
        startDate,
        endDate,
        totalAmount,
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            customerId,
            amount: totalAmount,
            provider: PaymentProvider.STRIPE,
            status: PaymentStatus.PENDING,
          },
        },
      },
      include: rentalIncludeOptions,
    });

    return rentalOrder;
  });

  return result;
};

const getMyRentals = async (customerId: string, query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const where = { customerId };
  const [data, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: rentalIncludeOptions,
    }),
    prisma.rentalOrder.count({ where }),
  ]);

  return { data, meta: { page, limit, total, totalPage: Math.ceil(total / limit) } };
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

  if (
    nextStatus === "RETURNED" &&
    new Date(rentalOrder.endDate).setHours(0, 0, 0, 0) >
      new Date().setHours(0, 0, 0, 0)
  ) {
    throw new AppError(400, "Equipment can be marked returned on or after the rental end date");
  }

  const itemStatus = RentalUtils.mapRentalStatusToItemStatus(nextStatus);

  const result = await prisma.$transaction(async (transactionClient) => {
    const statusUpdate = await transactionClient.rentalOrder.updateMany({
      where: {
        id,
        status: rentalOrder.status,
      },
      data: {
        status: nextStatus,
      },
    });

    if (statusUpdate.count !== 1) {
      throw new AppError(409, "This rental order was updated by another request. Refresh and try again");
    }

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
      for (const item of rentalOrder.items.filter((item) => item.providerId === providerId)) {
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

    return transactionClient.rentalOrder.findUniqueOrThrow({
      where: { id },
      include: rentalIncludeOptions,
    });
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
