import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./app/routes/index";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { RootRoute } from "./app/routes/root";
import { PaymentController } from "./app/modules/payment/controller";

const app: Application = express();

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(cookieParser());
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhook
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", RootRoute);
app.use("/api", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
