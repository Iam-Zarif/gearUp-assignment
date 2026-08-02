import { z } from "zod";

const createCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required"),
    description: z.string().optional(),
    imageUrl: z.url("Category image URL must be valid").optional(),
  }),
});

const updateCategoryValidationSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Category name is required").optional(),
    description: z.string().optional(),
    imageUrl: z.url("Category image URL must be valid").optional(),
  }),
});

export const CategoryValidation = {
  createCategoryValidationSchema,
  updateCategoryValidationSchema,
};
