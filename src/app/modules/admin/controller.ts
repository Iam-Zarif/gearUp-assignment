import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { AdminServices } from "./service";

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getDashboardStats();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Dashboard statistics retrieved successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllUsers();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Users retrieved successfully",
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(400, "Valid user id is required");
  }

  const result = await AdminServices.updateUserStatus(
    id,
    req.user!.id,
    req.body
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User status updated successfully",
    data: result,
  });
});

const getAllGear = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllGear();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear listings retrieved successfully",
    data: result,
  });
});

const getAllRentals = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllRentals();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rental orders retrieved successfully",
    data: result,
  });
});

const getAllPayments = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllPayments();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
});

const getAllReviews = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminServices.getAllReviews();

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
});

export const AdminController = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
  getAllPayments,
  getAllReviews,
};
