import { z } from "zod";

const hasSequentialPattern = (password: string) => {
  const lowerPassword = password.toLowerCase();

  const sequences = [
    "abcdefghijklmnopqrstuvwxyz",
    "0123456789",
    "qwertyuiop",
    "asdfghjkl",
    "zxcvbnm",
  ];

  for (const sequence of sequences) {
    for (let i = 0; i <= sequence.length - 3; i++) {
      const forward = sequence.slice(i, i + 3);
      const backward = forward.split("").reverse().join("");

      if (lowerPassword.includes(forward) || lowerPassword.includes(backward)) {
        return true;
      }
    }
  }

  const mixedSerialPattern = /(?:[a-z]\d){3,}|(?:\d[a-z]){3,}/i;

  return mixedSerialPattern.test(password);
};

const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
  .refine(
    (password) => !hasSequentialPattern(password),
    "Password cannot contain sequential characters or numbers",
  );

const registerValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name is required"),
      email: z.email("Invalid email address"),
      password: strongPasswordSchema,
      phone: z.string().optional(),
      address: z.string().optional(),
      profilePhoto: z.string().optional(),
      role: z.enum(["CUSTOMER", "PROVIDER"]),
    })
    .strict(),
});

const loginValidationSchema = z.object({
  body: z
    .object({
      email: z.email("Invalid email address"),
      password: z.string().min(1, "Password is required"),
    })
    .strict(),
});

const updateProfileValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name cannot be empty").optional(),
      email: z.email("Invalid email address").optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
      profilePhoto: z.string().optional(),
      oldPassword: z.string().min(1, "Old password is required").optional(),
      newPassword: strongPasswordSchema.optional(),
    })
    .strict()
    .superRefine((data, ctx) => {
      if (data.newPassword && !data.oldPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["oldPassword"],
          message: "Old password is required to update password",
        });
      }

      if (data.oldPassword && !data.newPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["newPassword"],
          message: "New password is required to update password",
        });
      }
    }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  updateProfileValidationSchema,
};
