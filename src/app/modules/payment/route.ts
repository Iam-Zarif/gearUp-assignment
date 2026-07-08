import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { PaymentController } from "./controller";
import { PaymentValidation } from "./validation";

const router = Router();

router.get("/success", PaymentController.handleSuccessPayment);
router.get("/cancel", PaymentController.handleCancelPayment);

router.post(
  "/create",
  auth(UserRole.CUSTOMER),
  validateRequest(PaymentValidation.createPaymentValidationSchema),
  PaymentController.createPaymentSession
);

router.post(
  "/confirm",
  auth(UserRole.CUSTOMER),
  validateRequest(PaymentValidation.confirmPaymentValidationSchema),
  PaymentController.confirmPayment
);

router.get("/", auth(UserRole.CUSTOMER), PaymentController.getMyPayments);

router.get("/:id", auth(UserRole.CUSTOMER), PaymentController.getSinglePayment);

export const PaymentRoutes = router;