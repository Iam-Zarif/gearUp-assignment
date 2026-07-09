import { UserRole } from "../../../generated/prisma/enums";

export type TRegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  role: Exclude<UserRole, "ADMIN">;
};

export type TLoginPayload = {
  email: string;
  password: string;
};

export type TUpdateProfilePayload = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  profilePhoto?: string;
  oldPassword?: string;
  newPassword?: string;
};