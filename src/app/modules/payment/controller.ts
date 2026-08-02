import { Request, Response } from "express";
import config from "../../config";
import AppError from "../../errors/AppError";
import catchAsync from "../../helpers/catchAsync";
import sendResponse from "../../helpers/sendResponse";
import { stripe } from "../../helpers/stripe";
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
  const result = await PaymentServices.getMyPayments(
    req.user!.id,
    req.query as Record<string, unknown>
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment history retrieved successfully",
    data: result.data,
    meta: result.meta,
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

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || Array.isArray(signature)) {
    throw new AppError(400, "Stripe signature is required");
  }

  const event = stripe.webhooks.constructEvent(
    req.body,
    signature,
    config.stripe.webhook_secret
  );

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    await PaymentServices.handleSuccessPayment(event.data.object.id);
  }

  res.status(200).json({ received: true });
});

export const PaymentController = {
  createPaymentSession,
  confirmPayment,
  getMyPayments,
  getSinglePayment,
  handleSuccessPayment,
  handleCancelPayment,
  handleStripeWebhook,
};
