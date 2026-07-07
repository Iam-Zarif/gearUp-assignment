import { RequestHandler } from "express";

const notFound: RequestHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: "API Not Found",
    errorDetails: [
      {
        path: req.originalUrl,
        message: `Cannot ${req.method} ${req.originalUrl}`,
      },
    ],
  });
};

export default notFound;