import { Router } from "express";
import { UserRole } from "../../../generated/prisma/client";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { ReviewController } from "./controller";
import { ReviewValidation } from "./validation";

const router = Router();

router.post(
  "/",
  auth(UserRole.CUSTOMER),
  validateRequest(ReviewValidation.createReviewValidationSchema),
  ReviewController.createReview
);

export const ReviewRoutes = router;