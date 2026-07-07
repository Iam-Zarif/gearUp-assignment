import { Router } from "express";
import { AuthRoutes } from "../modules/auth/route";
import { CategoryRoutes } from "../modules/category/route";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "GearUp API health check successful",
  });
});


router.use("/auth", AuthRoutes);
router.use("/categories", CategoryRoutes);

export default router;