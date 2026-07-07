import { ErrorRequestHandler } from "express";

const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;
  const message = error.message || "Something went wrong";

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: error,
  });
};

export default globalErrorHandler;