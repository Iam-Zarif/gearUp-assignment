import { z } from "zod";

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    address: z.string().optional(),
    profilePhoto: z.string().optional(),
    role: z.enum(["CUSTOMER", "PROVIDER"]),
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
};