import { Router } from "express";
import { listUsers, login, register } from "../controllers/auth.controller.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { loginValidation, registerValidation } from "../utils/validators.js";

const router = Router();

const postOnly = (path) => (req, res) => {
  res.setHeader("Allow", "POST, OPTIONS");
  return res.status(405).json({
    success: false,
    message: `Use POST ${path} with Content-Type: application/json (GET is not supported).`,
    errorCode: "METHOD_NOT_ALLOWED",
  });
};

router.get("/register", postOnly("/api/auth/register"));
router.get("/login", postOnly("/api/auth/login"));

router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
/** Public: no Bearer token required (protect behind admin auth / network in production if needed). */
router.get("/users", listUsers);

export default router;
