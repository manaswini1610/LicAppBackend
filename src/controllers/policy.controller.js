import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import {
  createPolicyService,
  deletePolicyService,
  getPolicyByIdService,
  listPoliciesService,
  updatePolicyService,
  updatePolicyStatusService,
} from "../services/policy.service.js";

export const createPolicy = asyncHandler(async (req, res) => {
  const policy = await createPolicyService(req.body);

  return successResponse(res, {
    statusCode: 201,
    message: "Policy created successfully",
    data: policy,
  });
});

export const listPolicies = asyncHandler(async (req, res) => {
  const { data, meta } = await listPoliciesService(req.query);

  return successResponse(res, {
    message: "Policies fetched successfully",
    data,
    meta,
  });
});

export const getPolicyById = asyncHandler(async (req, res) => {
  const policy = await getPolicyByIdService(req.params.id);

  return successResponse(res, {
    message: "Policy fetched successfully",
    data: policy,
  });
});

export const updatePolicy = asyncHandler(async (req, res) => {
  const policy = await updatePolicyService(req.params.id, req.body ?? {});

  return successResponse(res, {
    message: "Policy updated successfully",
    data: policy,
  });
});

export const updatePolicyStatus = asyncHandler(async (req, res) => {
  const policy = await updatePolicyStatusService(req.params.id, req.body.status);

  return successResponse(res, {
    message: "Policy status updated successfully",
    data: policy,
  });
});

export const deletePolicy = asyncHandler(async (req, res) => {
  const policy = await deletePolicyService(req.params.id);

  return successResponse(res, {
    message: "Policy deleted successfully",
    data: policy,
  });
});
