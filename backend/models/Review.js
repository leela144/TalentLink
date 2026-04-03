import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // client
    revieweeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // freelancer
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    rating: { type: Number, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
