import { Router } from "express";
import authRoutes from "./auth.routes.js";
import policyRoutes from "./policy.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import followupRoutes from "./followup.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/policies", policyRoutes);
router.use("/followups", followupRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
