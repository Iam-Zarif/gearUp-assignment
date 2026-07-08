import { Prisma, UserStatus } from "../../../generated/prisma/client";
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

export const AdminServices = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};