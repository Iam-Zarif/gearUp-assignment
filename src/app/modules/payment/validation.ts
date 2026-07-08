import { z } from "zod";

const createPaymentValidationSchema = z.object({
  body: z.object({
    rentalOrderId: z.string().min(1, "Rental order id is required"),
  }),
});

const confirmPaymentValidationSchema = z.object({
  body: z.object({
    sessionId: z.string().min(1, "Stripe session id is required"),
  }),
});

export const PaymentValidation = {
  createPaymentValidationSchema,
  confirmPaymentValidationSchema,
};