import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { GearServices } from "./service";

const createGear = catchAsync(async (req: Request, res: Response) => {
  const result = await GearServices.createGear(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Gear item created successfully",
    data: result,
  });
});

const getAllGear = catchAsync(async (req: Request, res: Response) => {
  const result = await GearServices.getAllGear(req.query);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear items retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSingleGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(400, "Valid gear id is required");
  }

  const result = await GearServices.getSingleGear(id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear item retrieved successfully",
    data: result,
  });
});

const updateGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(400, "Valid gear id is required");
  }

  const result = await GearServices.updateGear(id, req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear item updated successfully",
    data: result,
  });
});

const deleteGear = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(400, "Valid gear id is required");
  }

  const result = await GearServices.deleteGear(id, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Gear item deleted successfully",
    data: result,
  });
});

export const GearController = {
  createGear,
  getAllGear,
  getSingleGear,
  updateGear,
  deleteGear,
};