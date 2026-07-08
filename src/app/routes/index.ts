import { Router } from "express";
import { AuthRoutes } from "../modules/auth/route";
import { CategoryRoutes } from "../modules/category/route";
import { GearRoutes, ProviderGearRoutes } from "../modules/gear/route";
import { ProviderOrderRoutes, RentalRoutes } from "../modules/rental/route";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GearUp API health check successful",
  });
});


router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);
router.use("/gear", GearRoutes);
router.use("/provider/gear", ProviderGearRoutes);
router.use("/rentals", RentalRoutes);
router.use("/provider/orders", ProviderOrderRoutes);

export default router;