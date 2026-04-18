import Policy from "../models/Policy.model.js";
import ApiError from "../utils/ApiError.js";

const normalizePolicyStatus = (status) => {
  if (!status) return status;

  return status;
};

const parsePagination = (query) => {
  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;
  return { page, limit, skip: (page - 1) * limit };
};

const generatePolicyNumber = async () => {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const randomPart = Math.floor(100000 + Math.random() * 900000);
    const policyNumber = `POL-${year}-${randomPart}`;
    const existing = await Policy.findOne({ policyNumber }).select("_id").lean();
    if (!existing) return policyNumber;
  }
  throw new ApiError(500, "Could not generate unique policy number", "POLICY_NUMBER_GENERATION_FAILED");
};

const buildPolicyFilters = (query) => {
  const {
    search,
    status,
    policyType,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    followUpRange,
  } = query;
  const filters = {};

  if (status) filters.status = normalizePolicyStatus(status);
  if (policyType) filters.policyType = policyType;

  if (search) {
    filters.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { policyNumber: { $regex: search, $options: "i" } },
    ];
  }

  if (startDateFrom || startDateTo) {
    filters.startDate = {};
    if (startDateFrom) filters.startDate.$gte = new Date(startDateFrom);
    if (startDateTo) filters.startDate.$lte = new Date(startDateTo);
  }

  if (endDateFrom || endDateTo) {
    filters.endDate = {};
    if (endDateFrom) filters.endDate.$gte = new Date(endDateFrom);
    if (endDateTo) filters.endDate.$lte = new Date(endDateTo);
  }

  if (followUpRange) {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfToday.getDate() + 1);

    if (followUpRange === "today") {
      filters.nextFollowUpDate = { $gte: startOfToday, $lt: startOfTomorrow };
    } else if (followUpRange === "upcoming") {
      filters.nextFollowUpDate = { $gte: startOfTomorrow };
    }
  }

  return filters;
};

export const createPolicyService = async (payload) => {
  const { policyNumber: _, ...body } = payload;
  const policyNumber = await generatePolicyNumber();
  const policy = await Policy.create({
    ...body,
    status: normalizePolicyStatus(body.status),
    policyNumber,
  });
  return policy;
};

export const listPoliciesService = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const { sortBy = "createdAt", sortOrder = "desc" } = query;
  const filters = buildPolicyFilters(query);

  const [items, total] = await Promise.all([
    Policy.find(filters)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit),
    Policy.countDocuments(filters),
  ]);

  return {
    data: items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

export const getPolicyByIdService = async (policyId) => {
  const policy = await Policy.findById(policyId);
  if (!policy) throw new ApiError(404, "Policy not found", "POLICY_NOT_FOUND");
  return policy;
};

export const updatePolicyService = async (policyId, payload) => {
  if (payload.policyNumber) {
    const duplicate = await Policy.findOne({
      policyNumber: payload.policyNumber,
      _id: { $ne: policyId },
    });
    if (duplicate) throw new ApiError(409, "Policy number already exists", "POLICY_NUMBER_EXISTS");
  }

  const updatePayload = {
    ...payload,
    status: normalizePolicyStatus(payload.status),
  };

  const policy = await Policy.findByIdAndUpdate(policyId, updatePayload, {
    new: true,
    runValidators: true,
  });
  if (!policy) throw new ApiError(404, "Policy not found", "POLICY_NOT_FOUND");
  return policy;
};

export const updatePolicyStatusService = async (policyId, status) => {
  const policy = await Policy.findByIdAndUpdate(
    policyId,
    { status: normalizePolicyStatus(status) },
    { new: true, runValidators: true }
  );
  if (!policy) throw new ApiError(404, "Policy not found", "POLICY_NOT_FOUND");
  return policy;
};

export const deletePolicyService = async (policyId) => {
  const policy = await Policy.findByIdAndDelete(policyId);
  if (!policy) throw new ApiError(404, "Policy not found", "POLICY_NOT_FOUND");
  return policy;
};
