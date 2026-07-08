import { UserStatus } from "../../../generated/prisma/client";

export type TAdminQuery = Record<string, unknown>;

export type TUpdateUserStatusPayload = {
  status: UserStatus;
};