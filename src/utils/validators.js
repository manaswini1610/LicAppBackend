import { body, param, query } from "express-validator";

const objectIdParam = (name = "id") =>
  param(name).isMongoId().withMessage(`${name} must be a valid Mongo ID`);

const policyStatusValues = [
  "pending",
  "converted_to_client",
];

const policyTermValues = ["monthly", "quarterly", "half_yearly", "yearly"];

export const createPolicyValidation = [
  body("customerName").trim().notEmpty(),
  body("customerEmail").optional().isEmail(),
  body("policyTerm").optional().isIn(policyTermValues),
  body("premiumAmount").optional().isFloat({ min: 0 }),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
  body("nextFollowUpDate").optional().isISO8601(),
  body("status").optional().isIn(policyStatusValues),
];

export const updatePolicyValidation = [
  objectIdParam("id"),
  body("policyNumber").optional().trim().notEmpty(),
  body("customerName").optional().trim().notEmpty(),
  body("customerEmail").optional().isEmail(),
  body("policyTerm").optional().isIn(policyTermValues),
  body("premiumAmount").optional().isFloat({ min: 0 }),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
  body("nextFollowUpDate").optional().isISO8601(),
  body("status").optional().isIn(policyStatusValues),
];

export const updatePolicyStatusValidation = [
  objectIdParam("id"),
  body("status").isIn(policyStatusValues),
];

export const listPoliciesValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(policyStatusValues),
  query("followUpRange").optional().isIn(["today", "upcoming"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
];

export const createFollowUpValidation = [
  body("policyId").isMongoId(),
  body("followUpDate").isISO8601(),
  body("followUpType").isIn([
    "renewal reminder",
    "document pending",
    "payment reminder",
    "call back",
    "other",
  ]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("status").optional().isIn(["pending", "completed", "missed"]),
  body("nextFollowUpDate").optional().isISO8601(),
];

export const updateFollowUpValidation = [
  objectIdParam("id"),
  body("policyId").optional().isMongoId(),
  body("followUpDate").optional().isISO8601(),
  body("followUpType")
    .optional()
    .isIn(["renewal reminder", "document pending", "payment reminder", "call back", "other"]),
  body("priority").optional().isIn(["low", "medium", "high"]),
  body("status").optional().isIn(["pending", "completed", "missed"]),
  body("nextFollowUpDate").optional().isISO8601(),
];

export const updateFollowUpStatusValidation = [
  objectIdParam("id"),
  body("status").isIn(["pending", "completed", "missed"]),
];

export const idValidation = [objectIdParam("id")];

export const listFollowUpsValidation = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("status").optional().isIn(["pending", "completed", "missed"]),
  query("priority").optional().isIn(["low", "medium", "high"]),
  query("policyId").optional().isMongoId(),
  query("dateFrom").optional().isISO8601(),
  query("dateTo").optional().isISO8601(),
  query("followUpRange").optional().isIn(["today", "1d", "1w", "1m"]),
  query("sortOrder").optional().isIn(["asc", "desc"]),
];

export const recentPolicyValidation = [query("limit").optional().isInt({ min: 1, max: 100 })];

/** Same optional filters as list policies, plus how to count pending on dashboard cards */
export const dashboardPendingCountQueryValidation = [
  query("pendingCountScope").optional().isIn(["all", "list"]),
  query("followUpRange").optional().isIn(["today", "upcoming"]),
];

export const dashboardOverviewValidation = [
  query("yearlyTarget").optional().isInt({ min: 1, max: 1000000 }),
  query("targetPerMonth").optional().isInt({ min: 1, max: 1000000 }),
  ...dashboardPendingCountQueryValidation,
];

export const dashboardSummaryValidation = [...dashboardPendingCountQueryValidation];

export const registerValidation = [
  body("username").trim().isLength({ min: 3, max: 32 }).withMessage("username must be 3–32 characters"),
  body("password").isLength({ min: 6, max: 128 }).withMessage("password must be 6–128 characters"),
  body("name").trim().notEmpty().isLength({ max: 120 }).withMessage("name is required (max 120 characters)"),
  body("experience")
    .optional({ checkFalsy: true })
    .isInt({ min: 0, max: 60 })
    .withMessage("experience must be a number of years from 0 to 60"),
  body("mobileNumber")
    .trim()
    .notEmpty()
    .matches(/^[0-9]{10}$/)
    .withMessage("mobileNumber must be exactly 10 digits"),
];

export const loginValidation = [
  body("username").trim().notEmpty().withMessage("username is required"),
  body("password").notEmpty().withMessage("password is required"),
];
