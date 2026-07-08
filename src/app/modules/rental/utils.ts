import {
  GearStatus,
  RentalItemStatus,
  RentalStatus,
} from "../../../generated/prisma/client";
import AppError from "../../errors/AppError";

export const rentalIncludeOptions = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
    },
  },
  items: {
    include: {
      gearItem: {
        include: {
          category: true,
        },
      },
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          address: true,
        },
      },
    },
  },
  payment: true,
};

const calculateRentalDays = (startDate: Date, endDate: Date) => {
  const differenceInTime = endDate.getTime() - startDate.getTime();
  const differenceInDays = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24));

  return differenceInDays || 1;
};

const validateRentalDates = (startDate: Date, endDate: Date) => {
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new AppError(400, "Invalid rental date");
  }

  if (endDate < startDate) {
    throw new AppError(400, "End date cannot be before start date");
  }
};

const validateGearAvailability = (
  gearItem: {
    name: string;
    status: GearStatus;
    availableQuantity: number;
  },
  requestedQuantity: number
) => {
  if (gearItem.status !== GearStatus.AVAILABLE) {
    throw new AppError(400, `${gearItem.name} is not available`);
  }

  if (gearItem.availableQuantity < requestedQuantity) {
    throw new AppError(400, `Not enough stock for ${gearItem.name}`);
  }
};

const validateProviderStatusTransition = (
  currentStatus: RentalStatus,
  nextStatus: RentalStatus
) => {
  if (
    nextStatus === RentalStatus.CONFIRMED &&
    currentStatus !== RentalStatus.PLACED
  ) {
    throw new AppError(400, "Only placed orders can be confirmed");
  }

  if (
    nextStatus === RentalStatus.PICKED_UP &&
    currentStatus !== RentalStatus.PAID
  ) {
    throw new AppError(400, "Only paid orders can be marked as picked up");
  }

  if (
    nextStatus === RentalStatus.RETURNED &&
    currentStatus !== RentalStatus.PICKED_UP
  ) {
    throw new AppError(400, "Only picked up orders can be marked as returned");
  }

  if (
    nextStatus === RentalStatus.CANCELLED &&
    currentStatus !== RentalStatus.PLACED &&
    currentStatus !== RentalStatus.CONFIRMED
  ) {
    throw new AppError(400, "Only placed or confirmed orders can be cancelled");
  }
};

const mapRentalStatusToItemStatus = (
  status: RentalStatus
): RentalItemStatus => {
  switch (status) {
    case RentalStatus.CONFIRMED:
      return RentalItemStatus.CONFIRMED;

    case RentalStatus.PICKED_UP:
      return RentalItemStatus.PICKED_UP;

    case RentalStatus.RETURNED:
      return RentalItemStatus.RETURNED;

    case RentalStatus.CANCELLED:
      return RentalItemStatus.CANCELLED;

    default:
      throw new AppError(400, "Invalid provider rental status");
  }
};

export const RentalUtils = {
  calculateRentalDays,
  validateRentalDates,
  validateGearAvailability,
  validateProviderStatusTransition,
  mapRentalStatusToItemStatus,
};