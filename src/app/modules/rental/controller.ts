import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { RentalServices } from "./service";

const createRental = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalServices.createRental(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Rental order created successfully",
    data: result,
  });
});

const getMyRentals = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalServices.getMyRentals(
    req.user!.id,
    req.query as Record<string, unknown>
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rental orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const getSingleRental = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(400, "Valid rental order id is required");
  }

  const result = await RentalServices.getSingleRental(id, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Rental order retrieved successfully",
    data: result,
  });
});

const getProviderOrders = catchAsync(async (req: Request, res: Response) => {
  const result = await RentalServices.getProviderOrders(
    req.user!.id,
    req.query as Record<string, unknown>
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Provider rental orders retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updateProviderOrderStatus = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;

    if (!id || Array.isArray(id)) {
      throw new AppError(400, "Valid rental order id is required");
    }

    const result = await RentalServices.updateProviderOrderStatus(
      id,
      req.user!.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Rental order status updated successfully",
      data: result,
    });
  }
);

export const RentalController = {
  createRental,
  getMyRentals,
  getSingleRental,
  getProviderOrders,
  updateProviderOrderStatus,
};
