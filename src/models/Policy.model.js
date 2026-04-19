import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true, unique: true, trim: true },
    customerName: { type: String, required: true, trim: true },
    customerPhone: { type: String, trim: true },
    customerEmail: { type: String, trim: true, lowercase: true },
    policyType: { type: String, trim: true },
    policyTerm: {
      type: String,
      enum: ["monthly", "quarterly", "half_yearly", "yearly"],
      trim: true,
    },
    premiumAmount: { type: Number, min: 0 },
    startDate: { type: Date },
    endDate: { type: Date },
    nextFollowUpDate: { type: Date },
    status: {
      type: String,
      enum: ["pending", "converted_to_client"],
      default: "pending",
    },
    /** Set when status becomes converted_to_client; used for yearly progress and monthly charts */
    convertedAt: { type: Date },
    agentName: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

policySchema.index({ customerName: "text", policyNumber: "text" });
policySchema.index({ status: 1, policyType: 1, startDate: 1, endDate: 1 });
policySchema.index({ nextFollowUpDate: 1 });

const Policy = mongoose.model("Policy", policySchema);

export default Policy;
