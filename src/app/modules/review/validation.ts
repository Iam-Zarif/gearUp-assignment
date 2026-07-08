import { z } from "zod";
import { MAX_REVIEW_RATING, MIN_REVIEW_RATING } from "./constant";

const createReviewValidationSchema = z.object({
  body: z.object({
    gearItemId: z.string().min(1, "Gear item id is required"),
    rentalOrderId: z.string().min(1, "Rental order id is required"),
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(MIN_REVIEW_RATING, "Rating must be at least 1")
      .max(MAX_REVIEW_RATING, "Rating cannot be more than 5"),
    comment: z.string().optional(),
  }),
});

export const ReviewValidation = {
  createReviewValidationSchema,
};