import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["client", "freelancer"], required: true },
    skills: { type: [String], default: [] },
    bio: { type: String, default: "" },
    hourlyRate: { type: Number, default: 0 },
    authProvider: { type: String, default: "local" },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    profilePhoto: { type: String, default: "" },
    googleId: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
