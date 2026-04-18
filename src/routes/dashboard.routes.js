import { Router } from "express";
import {
  getDashboardOverview,
  getSummary,
  recentPolicies,
  todayFollowUps,
} from "../controllers/dashboard.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { dashboardOverviewValidation, recentPolicyValidation } from "../utils/validators.js";

const router = Router();

router.get("/summary", getSummary);
router.get("/overview", dashboardOverviewValidation, validateRequest, getDashboardOverview);
router.get("/recent-policies", recentPolicyValidation, validateRequest, recentPolicies);
router.get("/followups/today", todayFollowUps);

export default router;
