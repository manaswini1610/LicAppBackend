import "../src/config/loadEnv.js";
import mongoose from "mongoose";
import connectDB from "../src/config/db.js";
import Policy from "../src/models/Policy.model.js";
import FollowUp from "../src/models/FollowUp.model.js";

const run = async () => {
  await connectDB();

  await Promise.all([Policy.deleteMany({}), FollowUp.deleteMany({})]);

  const today = new Date();
  const policiesInput = Array.from({ length: 10 }).map((_, idx) => {
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - idx * 10);
    const endDate = new Date(startDate);
    endDate.setFullYear(startDate.getFullYear() + 1);
    return {
      policyNumber: `POL${1000 + idx}`,
      customerName: `Customer ${idx + 1}`,
      customerPhone: `99900000${idx}${idx}`,
      customerEmail: `customer${idx + 1}@mail.com`,
      policyType: idx % 2 === 0 ? "health" : "life",
      premiumAmount: 12000 + idx * 1000,
      startDate,
      endDate,
      status: idx < 7 ? "active" : "pending",
      agentName: idx % 2 === 0 ? "Agent A" : "Agent B",
      notes: `Sample policy ${idx + 1}`,
    };
  });

  const policies = await Policy.insertMany(policiesInput);

  const followUpsInput = policies.map((policy, idx) => {
    const followUpDate = new Date();
    followUpDate.setDate(today.getDate() + (idx % 5) - 2);
    return {
      policyId: policy._id,
      followUpDate,
      followUpType: idx % 2 === 0 ? "renewal reminder" : "payment reminder",
      remark: `Follow-up for ${policy.policyNumber}`,
      priority: idx % 3 === 0 ? "high" : "medium",
      status: idx % 4 === 0 ? "completed" : "pending",
      assignedTo: idx % 2 === 0 ? "Agent A" : "Agent B",
    };
  });

  await FollowUp.insertMany(followUpsInput);
  console.log("Seed completed: 10 policies and 10 follow-ups created.");

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
