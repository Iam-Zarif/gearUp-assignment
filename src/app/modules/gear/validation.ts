import { z } from "zod";

const createGearValidationSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, "Category id is required"),
    name: z.string().min(1, "Gear name is required"),
    brand: z.string().optional(),
    description: z.string().optional(),
    pricePerDay: z.number().positive("Price per day must be positive"),
    stockQuantity: z.number().int().positive("Stock quantity must be positive"),
    availableQuantity: z.number().int().min(0).optional(),
    imageUrl: z.string().optional(),
    specifications: z.record(z.string(), z.unknown()).optional(),
  }),
});

const updateGearValidationSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1, "Category id is required").optional(),
    name: z.string().min(1, "Gear name is required").optional(),
    brand: z.string().optional(),
    description: z.string().optional(),
    pricePerDay: z.number().positive("Price per day must be positive").optional(),
    stockQuantity: z.number().int().positive("Stock quantity must be positive").optional(),
    availableQuantity: z.number().int().min(0).optional(),
    imageUrl: z.string().optional(),
    specifications: z.record(z.string(), z.unknown()).optional(),
    status: z.enum(["AVAILABLE", "UNAVAILABLE"]).optional(),
  }),
});

export const GearValidation = {
  createGearValidationSchema,
  updateGearValidationSchema,
};