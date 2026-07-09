import bcrypt from "bcrypt";
import { UserStatus } from "../../../generated/prisma/client";
import config from "../../config";
import AppError from "../../errors/AppError";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { prisma } from "../../helpers/prisma";
import excludeField from "../../utils/excludeField";
import {
  TLoginPayload,
  TRegisterPayload,
  TUpdateProfilePayload,
} from "./interface";

const registerUser = async (payload: TRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
      phone: payload.phone,
    },
  });

  if (existingUser) {
    throw new AppError(409, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds,
  );

  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  return excludeField(user, ["password"]);
};

const loginUser = async (payload: TLoginPayload) => {
  const user = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (user.status === UserStatus.SUSPENDED) {
    throw new AppError(403, "This user is suspended");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(401, "Password does not match");
  }

  const jwtPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return {
    accessToken,
    refreshToken,
    user: excludeField(user, ["password"]),
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
  });

  return excludeField(user, ["password"]);
};

const updateProfile = async (
  userId: string,
  payload: TUpdateProfilePayload,
) => {
  if (Object.keys(payload).length === 0) {
    throw new AppError(400, "No profile data provided to update");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new AppError(404, "User not found");
  }

  const updateData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    profilePhoto?: string;
    password?: string;
  } = {};

  if (payload.name !== undefined) updateData.name = payload.name;
  if (payload.phone !== undefined) updateData.phone = payload.phone;
  if (payload.address !== undefined) updateData.address = payload.address;
  if (payload.profilePhoto !== undefined)
    updateData.profilePhoto = payload.profilePhoto;

  if (payload.email !== undefined) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new AppError(409, "User already exists with this email");
    }

    updateData.email = payload.email;
  }

  if (payload.oldPassword && payload.newPassword) {
    const isPasswordMatched = await bcrypt.compare(
      payload.oldPassword,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new AppError(401, "Old password does not match");
    }

    const hashedPassword = await bcrypt.hash(
      payload.newPassword,
      config.bcrypt_salt_rounds,
    );

    updateData.password = hashedPassword;
  }

  if (Object.keys(updateData).length === 0) {
    throw new AppError(400, "No valid profile data provided to update");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: updateData,
  });

  return excludeField(updatedUser, ["password"]);
};

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
};
