import FollowUp from "../models/FollowUp.model.js";
import Policy from "../models/Policy.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";
import ApiError from "../utils/ApiError.js";

const parsePagination = (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  return { page, limit, skip: (page - 1) * limit };
};

export const createFollowUp = asyncHandler(async (req, res) => {
  const policyExists = await Policy.exists({ _id: req.body.policyId });
  if (!policyExists) throw new ApiError(400, "Policy does not exist", "POLICY_NOT_FOUND");

  const followUp = await FollowUp.create(req.body);
  return successResponse(res, {
    statusCode: 201,
    message: "Follow-up created successfully",
    data: followUp,
  });
});

export const listFollowUps = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const {
    status,
    priority,
    assignedTo,
    policyId,
    dateFrom,
    dateTo,
    followUpRange,
    sortBy = "followUpDate",
    sortOrder = "asc",
  } = req.query;

  const filters = {};
  if (status) filters.status = status;
  if (priority) filters.priority = priority;
  if (assignedTo) filters.assignedTo = assignedTo;
  if (policyId) filters.policyId = policyId;
  if (dateFrom || dateTo) {
    filters.followUpDate = {};
    if (dateFrom) filters.followUpDate.$gte = new Date(dateFrom);
    if (dateTo) filters.followUpDate.$lte = new Date(dateTo);
  }
  if (followUpRange) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);

    if (followUpRange === "today") {
      end.setDate(start.getDate() + 1);
    } else if (followUpRange === "1d") {
      start.setDate(start.getDate() + 1);
      end.setDate(start.getDate() + 1);
    } else if (followUpRange === "1w") {
      end.setDate(start.getDate() + 7);
    } else if (followUpRange === "1m") {
      end.setMonth(start.getMonth() + 1);
    }

    // Use nextFollowUpDate when available; fallback to followUpDate.
    filters.$or = [
      { nextFollowUpDate: { $gte: start, $lt: end } },
      {
        nextFollowUpDate: { $exists: false },
        followUpDate: { $gte: start, $lt: end },
      },
    ];
  }

  const [items, total] = await Promise.all([
    FollowUp.find(filters)
      .populate("policyId", "policyNumber customerName status")
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .skip(skip)
      .limit(limit),
    FollowUp.countDocuments(filters),
  ]);

  return successResponse(res, {
    message: "Follow-ups fetched successfully",
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

export const getFollowUpById = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findById(req.params.id).populate(
    "policyId",
    "policyNumber customerName status"
  );
  if (!followUp) throw new ApiError(404, "Follow-up not found", "FOLLOWUP_NOT_FOUND");

  return successResponse(res, {
    message: "Follow-up fetched successfully",
    data: followUp,
  });
});

export const updateFollowUp = asyncHandler(async (req, res) => {
  if (req.body.policyId) {
    const policyExists = await Policy.exists({ _id: req.body.policyId });
    if (!policyExists) throw new ApiError(400, "Policy does not exist", "POLICY_NOT_FOUND");
  }

  const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!followUp) throw new ApiError(404, "Follow-up not found", "FOLLOWUP_NOT_FOUND");

  return successResponse(res, {
    message: "Follow-up updated successfully",
    data: followUp,
  });
});

export const updateFollowUpStatus = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!followUp) throw new ApiError(404, "Follow-up not found", "FOLLOWUP_NOT_FOUND");

  return successResponse(res, {
    message: "Follow-up status updated successfully",
    data: followUp,
  });
});

export const deleteFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findByIdAndDelete(req.params.id);
  if (!followUp) throw new ApiError(404, "Follow-up not found", "FOLLOWUP_NOT_FOUND");

  return successResponse(res, {
    message: "Follow-up deleted successfully",
    data: followUp,
  });
});
