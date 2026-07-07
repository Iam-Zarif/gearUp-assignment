import bcrypt from "bcrypt";
import { UserRole, UserStatus } from "../../../generated/prisma/client";
import config from "../../config";
import AppError from "../../errors/AppError";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import { prisma } from "../../helpers/prisma";
import excludeField from "../../utils/excludeField";

type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  role: Exclude<UserRole, "ADMIN">;
};

type TLoginPayload = {
  email: string;
  password: string;
};

const registerUser = async (payload: TRegisterPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    throw new AppError(409, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds
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
    user.password
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
    config.jwt.access_expires_in
  );

  const refreshToken = jwtHelpers.createToken(
    jwtPayload,
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in
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

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
};