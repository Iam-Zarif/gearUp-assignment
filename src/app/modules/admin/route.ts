import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { AdminController } from "./controller";
import { AdminValidation } from "./validation";

const router = Router();

router.get("/stats", auth(UserRole.ADMIN), AdminController.getDashboardStats);

router.get("/users", auth(UserRole.ADMIN), AdminController.getAllUsers);

router.patch(
  "/users/:id",
  auth(UserRole.ADMIN),
  validateRequest(AdminValidation.updateUserStatusValidationSchema),
  AdminController.updateUserStatus,
);

router.get("/gear", auth(UserRole.ADMIN), AdminController.getAllGear);

router.get("/rentals", auth(UserRole.ADMIN), AdminController.getAllRentals);

router.get("/payments", auth(UserRole.ADMIN), AdminController.getAllPayments);

router.get("/reviews", auth(UserRole.ADMIN), AdminController.getAllReviews);

export const AdminRoutes = router;
