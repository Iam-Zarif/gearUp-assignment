import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "./controller";
import { ReviewValidation } from "./validation";

const router = Router();

router.get("/", ReviewController.getAllReviews);

router.get("/:id", ReviewController.getSingleReview);

router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview
);

router.patch(
  "/:id",
  auth(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.updateReviewValidationSchema),
  ReviewController.updateReview
);

router.delete(
  "/:id",
  auth(UserRole.CUSTOMER, UserRole.ADMIN),
  ReviewController.deleteReview
);
export const ReviewRoutes = router;