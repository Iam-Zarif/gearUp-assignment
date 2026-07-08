import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { RentalController } from "./controller";
import { RentalValidation } from "./validation";

const rentalRouter = Router();
const providerOrderRouter = Router();

rentalRouter.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(RentalValidation.createRentalValidationSchema),
  RentalController.createRental
);

rentalRouter.get("/", auth(UserRole.CUSTOMER), RentalController.getMyRentals);

rentalRouter.get(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER),
  RentalController.getSingleRental
);

providerOrderRouter.get(
  "/",
  auth(UserRole.PROVIDER),
  RentalController.getProviderOrders
);

providerOrderRouter.patch(
  "/:id",
  auth(UserRole.PROVIDER),
  validateRequest(RentalValidation.updateRentalStatusValidationSchema),
  RentalController.updateProviderOrderStatus
);

export const RentalRoutes = rentalRouter;
export const ProviderOrderRoutes = providerOrderRouter;