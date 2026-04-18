import { Router } from "express";
import { listFollowUps } from "../controllers/followup.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { listFollowUpsValidation } from "../utils/validators.js";

const router = Router();

router.get("/", listFollowUpsValidation, validateRequest, listFollowUps);

export default router;
