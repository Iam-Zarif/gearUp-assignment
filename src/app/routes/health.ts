import { Router } from "express";
import catchAsync from "../helpers/catchAsync";
import sendResponse from "../helpers/sendResponse";

const router = Router();

router.get(
  "/",
  catchAsync(async (_req, res) => {
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "GearUp API health check successful",
      data: {
        status: "healthy",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
    });
  })
);

export const HealthRoutes = router;