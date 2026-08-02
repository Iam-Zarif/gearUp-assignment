import {
  GearStatus,
  PaymentStatus,
  Prisma,
  UserRole,
  UserStatus,
} from "../../../generated/prisma/client";
import AppError from "../../errors/AppError";
import { prisma } from "../../helpers/prisma";
import { TUpdateUserStatusPayload } from "./interface";

const userSelectOptions = {
  id: true,
  name: true,
  email: true,
  phone: true,
  address: true,
  profilePhoto: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

const getAllUsers = async () => {
  const result = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: userSelectOptions,
  });

  return result;
};

const getDashboardStats = async () => {
  const [users, providers, customers, categories, gear, activeGear, rentals, completedPayments] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: UserRole.PROVIDER } }),
      prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      prisma.category.count(),
      prisma.gearItem.count(),
      prisma.gearItem.count({ where: { status: GearStatus.AVAILABLE } }),
      prisma.rentalOrder.count(),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
    ]);

  return {
    users,
    providers,
    customers,
    categories,
    gear,
    activeGear,
    rentals,
    revenue: completedPayments._sum.amount?.toString() ?? "0",
  };
};

const updateUserStatus = async (
  id: string,
  adminId: string,
  payload: TUpdateUserStatusPayload
) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.id === adminId && payload.status === UserStatus.SUSPENDED) {
    throw new AppError(400, "You cannot suspend your own account");
  }

  const result = await prisma.user.update({
    where: {
      id,
    },
    data: {
      status: payload.status,
    },
    select: userSelectOptions,
  });

  return result;
};

const getAllGear = async () => {
  const result = await prisma.gearItem.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      category: true,
      provider: {
        select: userSelectOptions,
      },
    },
  });

  return result;
};

const getAllRentals = async () => {
  const result = await prisma.rentalOrder.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      customer: {
        select: userSelectOptions,
      },
      items: {
        include: {
          gearItem: true,
          provider: {
            select: userSelectOptions,
          },
        },
      },
      payment: true,
    },
  });

  return result;
};

const getAllPayments = async () => {
  return prisma.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: userSelectOptions },
      rentalOrder: true,
    },
  });
};

const getAllReviews = async () => {
  return prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: userSelectOptions },
      gearItem: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const AdminServices = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
  getAllPayments,
  getAllReviews,
};
