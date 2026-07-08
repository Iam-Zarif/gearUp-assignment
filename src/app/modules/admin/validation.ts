import { z } from "zod";
import { UserStatus } from "../../../generated/prisma/client";

const updateUserStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum([UserStatus.ACTIVE, UserStatus.SUSPENDED]),
  }),
});

export const AdminValidation = {
  updateUserStatusValidationSchema,
};