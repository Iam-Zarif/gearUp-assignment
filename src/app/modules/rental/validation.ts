import { z } from "zod";

const createRentalValidationSchema = z.object({
  body: z.object({
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    items: z
      .array(
        z.object({
          gearItemId: z.string().min(1, "Gear item id is required"),
          quantity: z.number().int().positive("Quantity must be positive"),
        })
      )
      .min(1, "At least one gear item is required"),
  }),
});

const updateRentalStatusValidationSchema = z.object({
  body: z.object({
    status: z.enum(["CONFIRMED", "PICKED_UP", "RETURNED", "CANCELLED"]),
  }),
});

export const RentalValidation = {
  createRentalValidationSchema,
  updateRentalStatusValidationSchema,
};