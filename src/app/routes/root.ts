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
      message: "GearUp backend is running",
      data: {
        service: "GearUp API",
        status: "running",
        health: "/api/health",
      },
    });
  })
);

export const RootRoute = router;