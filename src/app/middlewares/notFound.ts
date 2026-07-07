import { RequestHandler } from "express";

const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "API Not Found",
    errorDetails: {
      path: req.originalUrl,
      method: req.method,
    },
  });
};

export default notFound;