import Policy from "../models/Policy.model.js";
import FollowUp from "../models/FollowUp.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const getSummary = asyncHandler(async (req, res) => {
  const [policyStats, totalFollowUpsPending] = await Promise.all([
    Policy.aggregate([
      {
        $facet: {
          totalPolicies: [{ $count: "count" }],
          pendingPolicies: [{ $match: { status: "pending" } }, { $count: "count" }],
          convertedToClientPolicies: [{ $match: { status: "converted_to_client" } }, { $count: "count" }],
        },
      },
    ]),
    FollowUp.countDocuments({ status: "pending" }),
  ]);

  const stats = policyStats[0] || {};
  const countValue = (arr) => (arr?.[0]?.count ? arr[0].count : 0);

  return successResponse(res, {
    message: "Dashboard summary fetched successfully",
    data: {
      totalPolicies: countValue(stats.totalPolicies),
      pendingPolicies: countValue(stats.pendingPolicies),
      convertedToClientPolicies: countValue(stats.convertedToClientPolicies),
      totalFollowUpsPending,
    },
  });
});

export const recentPolicies = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 10;
  const policies = await Policy.find().sort({ createdAt: -1 }).limit(limit);

  return successResponse(res, {
    message: "Recent policies fetched successfully",
    data: policies,
  });
});

export const todayFollowUps = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const followUps = await FollowUp.find({
    followUpDate: { $gte: start, $lte: end },
    status: "pending",
  }).populate("policyId", "policyNumber customerName");

  return successResponse(res, {
    message: "Today follow-ups fetched successfully",
    data: followUps,
  });
});

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const year = now.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const startOfNextYear = new Date(year + 1, 0, 1);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const yearlyTarget = Number(req.query.yearlyTarget);
  const targetPerMonth = Number(req.query.targetPerMonth);
  const normalizedTargetPerMonth =
    Number.isFinite(targetPerMonth) && targetPerMonth > 0 ? Math.floor(targetPerMonth) : null;
  const normalizedYearlyTarget = normalizedTargetPerMonth
    ? normalizedTargetPerMonth * 12
    : Number.isFinite(yearlyTarget) && yearlyTarget > 0
      ? Math.floor(yearlyTarget)
      : 360;

  const [convertedToClientPolicies, pendingPolicies, monthlySubmissionRaw, upcomingFollowUps] = await Promise.all([
    Policy.countDocuments({ status: "converted_to_client" }),
    Policy.countDocuments({ status: "pending" }),
    Policy.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: startOfNextYear }, status: "converted_to_client" } },
      { $group: { _id: { $month: "$createdAt" }, submitted: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    FollowUp.find({ status: "pending", followUpDate: { $gte: todayStart } })
      .sort({ followUpDate: 1, priority: -1 })
      .limit(10)
      .populate("policyId", "customerName policyType"),
  ]);

  const monthToSubmitted = new Map(monthlySubmissionRaw.map((item) => [item._id, item.submitted]));
  const monthlyTarget = normalizedTargetPerMonth ?? Math.max(1, Math.ceil(normalizedYearlyTarget / 12));
  const monthlyProgress = MONTH_NAMES.map((month, idx) => {
    const submitted = monthToSubmitted.get(idx + 1) || 0;
    const progressPct = monthlyTarget > 0 ? Math.round((submitted / monthlyTarget) * 100) : 0;
    const remaining = Math.max(monthlyTarget - submitted, 0);
    let achievementMessage = `You are behind by ${remaining}. Please complete ${remaining} more this month.`;

    if (submitted === monthlyTarget) {
      achievementMessage = "Congrats! You reached this month's target. Keep this pace for next month too.";
    }

    if (submitted > monthlyTarget) {
      achievementMessage = "Excellent! You did more than this month's target. Keep going like this.";
    }

    return {
      month,
      submitted,
      monthlyTarget,
      progressPercent: Math.min(progressPct, 100),
      achievementMessage,
    };
  });

  const remainingForYear = Math.max(normalizedYearlyTarget - convertedToClientPolicies, 0);
  const monthsLeft = Math.max(12 - (now.getMonth() + 1), 1);
  const requiredPerMonth = Math.ceil(remainingForYear / monthsLeft);
  const annualProgressPercent = Math.min(
    normalizedYearlyTarget > 0 ? Math.round((convertedToClientPolicies / normalizedYearlyTarget) * 1000) / 10 : 0,
    100
  );

  const formattedUpcomingFollowUps = upcomingFollowUps.map((followUp) => ({
    id: followUp._id,
    clientName: followUp.policyId?.customerName ?? "Unknown Client",
    policyType: followUp.policyId?.policyType ?? "N/A",
    date: followUp.followUpDate,
    priority: followUp.priority,
    status: followUp.status,
  }));

  return successResponse(res, {
    message: "Dashboard overview fetched successfully",
    data: {
      stats: {
        yearlyTarget: normalizedYearlyTarget,
        convertedToClientPolicies,
        pendingPolicies,
        requiredPerMonth,
      },
      annualProgress: {
        progressPercent: annualProgressPercent,
        remainingForYear,
        monthsLeft,
        requiredPerMonth,
      },
      monthlyProgress,
      upcomingFollowUps: formattedUpcomingFollowUps,
    },
  });
});
