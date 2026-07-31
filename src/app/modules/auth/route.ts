import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AuthController } from "./controller";
import { AuthValidation } from "./validation";

const router = Router();

router.post(
  "/register",
  validateRequest(AuthValidation.registerValidationSchema),
  AuthController.registerUser
);

router.post(
  "/login",
  validateRequest(AuthValidation.loginValidationSchema),
  AuthController.loginUser
);

router.get(
  "/me",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  AuthController.getMe
);

router.patch(
  "/me",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  validateRequest(AuthValidation.updateProfileValidationSchema),
  AuthController.updateProfile
);

router.post(
  "/logout",
  auth(UserRole.CUSTOMER, UserRole.PROVIDER, UserRole.ADMIN),
  AuthController.logoutUser
);

export const AuthRoutes = router;