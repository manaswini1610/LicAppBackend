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

export const dashboardOverviewValidation = [
  query("yearlyTarget").optional().isInt({ min: 1, max: 1000000 }),
  query("targetPerMonth").optional().isInt({ min: 1, max: 1000000 }),
];
