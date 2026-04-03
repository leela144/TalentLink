import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    budget: Number,
    duration: String,
    requiredSkills: [String],
    client: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // NEW
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
