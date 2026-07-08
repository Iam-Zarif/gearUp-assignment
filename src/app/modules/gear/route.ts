import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { GearController } from "./controller";
import { GearValidation } from "./validation";

const gearRouter = Router();
const providerGearRouter = Router();

gearRouter.get("/", GearController.getAllGear);
gearRouter.get("/:id", GearController.getSingleGear);

providerGearRouter.post(
  "/",
  auth(UserRole.PROVIDER),
  validateRequest(GearValidation.createGearValidationSchema),
  GearController.createGear
);

providerGearRouter.put(
  "/:id",
  auth(UserRole.PROVIDER),
  validateRequest(GearValidation.updateGearValidationSchema),
  GearController.updateGear
);

providerGearRouter.delete(
  "/:id",
  auth(UserRole.PROVIDER),
  GearController.deleteGear
);

export const GearRoutes = gearRouter;
export const ProviderGearRoutes = providerGearRouter;