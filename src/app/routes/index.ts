import { Router } from "express";
import { AuthRoutes } from "../modules/auth/route";
import { CategoryRoutes } from "../modules/category/route";
import { GearRoutes, ProviderGearRoutes } from "../modules/gear/route";
import { ProviderOrderRoutes, RentalRoutes } from "../modules/rental/route";
import { PaymentRoutes } from "../modules/payment/route";
import { ReviewRoutes } from "../modules/review/route";
import { HealthRoutes } from "./health";
import { AdminRoutes } from "../modules/admin/route";

const router = Router();

router.use("/health", HealthRoutes);
router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);
router.use("/gear", GearRoutes);
router.use("/provider/gear", ProviderGearRoutes);
router.use("/rentals", RentalRoutes);
router.use("/provider/orders", ProviderOrderRoutes);
router.use("/payments", PaymentRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/admin", AdminRoutes);

export default router;
