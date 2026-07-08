import { Request, Response } from "express";
import AppError from "../../errors/AppError";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { PaymentServices } from "./service";

const createPaymentSession = catchAsync(
  async (req: Request, res: Response) => {
    const result = await PaymentServices.createPaymentSession(
      req.user!.id,
      req.body
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Payment session created successfully",
      data: result,
    });
  }
);

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.confirmPayment(req.user!.id, req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment confirmation checked successfully",
    data: result,
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentServices.getMyPayments(req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment history retrieved successfully",
    data: result,
  });
});

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new AppError(400, "Valid payment id is required");
  }

  const result = await PaymentServices.getSinglePayment(id, req.user!.id);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment details retrieved successfully",
    data: result,
  });
});

const handleSuccessPayment = catchAsync(
  async (req: Request, res: Response) => {
    const sessionId = req.query.session_id;

    if (!sessionId || Array.isArray(sessionId) || typeof sessionId !== "string") {
      throw new AppError(400, "Stripe session id is required");
    }

    const result = await PaymentServices.handleSuccessPayment(sessionId);

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Payment success callback handled successfully",
      data: result,
    });
  }
);

const handleCancelPayment = catchAsync(async (_req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: 200,
    success: false,
    message: "Payment was cancelled",
    data: null,
  });
});

export const PaymentController = {
  createPaymentSession,
  confirmPayment,
  getMyPayments,
  getSinglePayment,
  handleSuccessPayment,
  handleCancelPayment,
};