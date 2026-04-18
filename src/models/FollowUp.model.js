import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    policyId: { type: mongoose.Schema.Types.ObjectId, ref: "Policy", required: true },
    followUpDate: { type: Date, required: true },
    followUpType: {
      type: String,
      enum: ["renewal reminder", "document pending", "payment reminder", "call back", "other"],
      required: true,
    },
    remark: { type: String, trim: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    status: { type: String, enum: ["pending", "completed", "missed"], default: "pending" },
    assignedTo: { type: String, trim: true },
    nextFollowUpDate: { type: Date },
  },
  { timestamps: true }
);

followUpSchema.index({ followUpDate: 1, status: 1, priority: 1, assignedTo: 1 });
followUpSchema.index({ policyId: 1 });

const FollowUp = mongoose.model("FollowUp", followUpSchema);

export default FollowUp;
