import mongoose from "mongoose";

const proposalSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bidAmount: { type: Number, required: true },
    message: { type: String },
    estimatedTime: { type: String },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Proposal", proposalSchema);
