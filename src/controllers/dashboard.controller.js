import Policy from "../models/Policy.model.js";
import FollowUp from "../models/FollowUp.model.js";
import { buildPendingPoliciesDashboardFilters } from "../services/policy.service.js";
import asyncHandler from "../utils/asyncHandler.js";
import { successResponse } from "../utils/response.js";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const getSummary = asyncHandler(async (req, res) => {
  const [policyStats, totalFollowUpsPending, pendingPolicies] = await Promise.all([
    Policy.aggregate([
      {
        $facet: {
          totalPolicies: [{ $count: "count" }],
          convertedToClientPolicies: [
            { $match: { status: "converted_to_client" } },
            { $count: "count" },
          ],
        },
      },
    ]),
    FollowUp.countDocuments({ status: "pending" }),
    Policy.countDocuments(buildPendingPoliciesDashboardFilters(req.query)),
  ]);

  const stats = policyStats[0] || {};
  const countValue = (arr) => (arr?.[0]?.count != null ? arr[0].count : 0);

  const converted = countValue(stats.convertedToClientPolicies);

  return successResponse(res, {
    message: "Dashboard summary fetched successfully",
    data: {
      totalPolicies: countValue(stats.totalPolicies),
      totalLeads: countValue(stats.totalPolicies),
      pendingPolicies,
      convertedToClientPolicies: converted,
      completedPolicies: converted,
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
    Number.isFinite(targetPerMonth) && targetPerMonth > 0
      ? Math.floor(targetPerMonth)
      : null;
  const normalizedYearlyTarget = normalizedTargetPerMonth
    ? normalizedTargetPerMonth * 12
    : Number.isFinite(yearlyTarget) && yearlyTarget > 0
      ? Math.floor(yearlyTarget)
      : 360;

  /** Date used for “submitted / converted this year”: conversion time, or creation time if legacy (no convertedAt). */
  const ytdConvertedMatch = {
    status: "converted_to_client",
    $expr: {
      $and: [
        { $gte: [{ $ifNull: ["$convertedAt", "$createdAt"] }, startOfYear] },
        { $lt: [{ $ifNull: ["$convertedAt", "$createdAt"] }, startOfNextYear] },
      ],
    },
  };

  const [
    convertedToClientPoliciesAllTime,
    submittedPoliciesThisYear,
    totalPolicies,
    pendingPolicies,
    monthlySubmissionRaw,
    upcomingFollowUps,
  ] = await Promise.all([
    Policy.countDocuments({ status: "converted_to_client" }),
    Policy.countDocuments(ytdConvertedMatch),
    Policy.countDocuments({}),
    Policy.countDocuments(buildPendingPoliciesDashboardFilters(req.query)),
    Policy.aggregate([
      { $match: ytdConvertedMatch },
      {
        $addFields: {
          effectiveMonth: {
            $month: { $ifNull: ["$convertedAt", "$createdAt"] },
          },
        },
      },
      { $group: { _id: "$effectiveMonth", submitted: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    FollowUp.find({ status: "pending", followUpDate: { $gte: todayStart } })
      .sort({ followUpDate: 1, priority: -1 })
      .limit(10)
      .populate("policyId", "customerName policyType"),
  ]);

  const monthToSubmitted = new Map(
    monthlySubmissionRaw.map((item) => [item._id, item.submitted]),
  );
  const monthlyTarget =
    normalizedTargetPerMonth ??
    Math.max(1, Math.ceil(normalizedYearlyTarget / 12));
  const monthlyProgress = MONTH_NAMES.map((month, idx) => {
    const submitted = monthToSubmitted.get(idx + 1) || 0;
    const progressPct =
      monthlyTarget > 0 ? Math.round((submitted / monthlyTarget) * 100) : 0;
    const remaining = Math.max(monthlyTarget - submitted, 0);
    let achievementMessage = `You are behind by ${remaining}. Please complete ${remaining} more this month.`;

    if (submitted === monthlyTarget) {
      achievementMessage =
        "Congrats! You reached this month's target. Keep this pace for next month too.";
    }

    if (submitted > monthlyTarget) {
      achievementMessage =
        "Excellent! You did more than this month's target. Keep going like this.";
    }

    return {
      month,
      submitted,
      monthlyTarget,
      progressPercent: Math.min(progressPct, 100),
      achievementMessage,
    };
  });

  /** Full calendar months strictly after the current month (e.g. April → 8 = May–Dec); minimum 1 in December. */
  const monthsLeft = Math.max(12 - (now.getMonth() + 1), 1);

  const remainingForYear = Math.max(
    normalizedYearlyTarget - submittedPoliciesThisYear,
    0,
  );
  const requiredPerMonth = Math.ceil(remainingForYear / monthsLeft);
  const annualProgressPercent = Math.min(
    normalizedYearlyTarget > 0
      ? Math.round(
          (submittedPoliciesThisYear / normalizedYearlyTarget) * 1000,
        ) / 10
      : 0,
    100,
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
        totalLeads: totalPolicies,
        completedPolicies: convertedToClientPoliciesAllTime,
        pendingPolicies,
      },
      annualProgress: {
        yearlyTarget: normalizedYearlyTarget,
        submittedPoliciesThisYear,
        progressPercent: annualProgressPercent,
        remainingForYear,
        monthsLeft,
        requiredPerMonth,
        calculation: {
          progressPercent:
            "min(100, round((submittedPoliciesThisYear / yearlyTarget) * 1000) / 10); uses policies converted this calendar year vs annual target",
          remainingForYear: "max(0, yearlyTarget - submittedPoliciesThisYear)",
          monthsLeft:
            "number of full calendar months after the current month until year-end (minimum 1 in December); used for pacing",
          requiredPerMonth:
            "ceil(remainingForYear / monthsLeft); average policies still needed per remaining month to reach the annual target",
        },
      },
      monthlyProgress,
      upcomingFollowUps: formattedUpcomingFollowUps,
    },
  });
});
