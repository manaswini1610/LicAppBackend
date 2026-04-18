import { Router } from "express";
import policyRoutes from "./policy.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import followupRoutes from "./followup.routes.js";

const router = Router();

router.use("/policies", policyRoutes);
router.use("/followups", followupRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
