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

const getPaginationOptions = (query: Record<string, unknown>) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

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

const getAllUsers = async (query: Record<string, unknown> = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      select: userSelectOptions,
    }),
    prisma.user.count(),
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

const getAllGear = async (query: Record<string, unknown> = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);

  const [data, total] = await Promise.all([
    prisma.gearItem.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
      include: {
        category: true,
        provider: {
          select: userSelectOptions,
        },
      },
    }),
    prisma.gearItem.count(),
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

const getAllRentals = async (query: Record<string, unknown> = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);

  const [data, total] = await Promise.all([
    prisma.rentalOrder.findMany({
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
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
    }),
    prisma.rentalOrder.count(),
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

const getAllPayments = async (query: Record<string, unknown> = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        customer: { select: userSelectOptions },
        rentalOrder: true,
      },
    }),
    prisma.payment.count(),
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

const getAllReviews = async (query: Record<string, unknown> = {}) => {
  const { page, limit, skip } = getPaginationOptions(query);

  const [data, total] = await Promise.all([
    prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        customer: { select: userSelectOptions },
        gearItem: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
    prisma.review.count(),
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

export const AdminServices = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
  getAllPayments,
  getAllReviews,
};
