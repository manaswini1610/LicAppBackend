import { Router } from "express";
import {
  createPolicy,
  deletePolicy,
  getPolicyById,
  listPolicies,
  updatePolicy,
} from "../controllers/policy.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createPolicyValidation,
  idValidation,
  listPoliciesValidation,
  updatePolicyValidation,
} from "../utils/validators.js";

const router = Router();

router.post("/", createPolicyValidation, validateRequest, createPolicy);
router.get("/", listPoliciesValidation, validateRequest, listPolicies);
router.get("/:id", idValidation, validateRequest, getPolicyById);
router.put("/:id", updatePolicyValidation, validateRequest, updatePolicy);
router.delete("/:id", idValidation, validateRequest, deletePolicy);

export default router;
