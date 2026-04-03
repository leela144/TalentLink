// import mongoose from "mongoose";

// const contractSchema = new mongoose.Schema(
//   {
//     proposalId: { type: mongoose.Schema.Types.ObjectId, ref: "Proposal", required: true },
//     projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
//     clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     startDate: { type: Date, default: Date.now },
//     endDate: Date,
//     payment: Number,
//     status: {
//       type: String,
//       enum: ["active", "completed", "cancelled"],
//       default: "active",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Contract", contractSchema);


// models/Contract.js
import mongoose from "mongoose";

const contractSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: [true, "Proposal ID is required"],
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Freelancer ID is required"],
    },
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client ID is required"],
    },
    title: {
      type: String,
      default: "Contract",
    },
    // Use 'payment' instead of 'budget' to match existing data
    payment: {
      type: Number,
      required: [true, "Payment is required"],
      min: [1, "Payment must be at least 1"],
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    // Use 'endDate' instead of 'deadline' to match existing data
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    // Make these fields optional since they don't exist in your existing data
    description: {
      type: String,
      // Remove required since your existing contracts don't have this
    },
    terms: {
      type: String,
      // Remove required since your existing contracts don't have this
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    // Make contractNumber optional or remove unique constraint
    contractNumber: {
      type: String,
      // Remove required or make it optional
    },
    // Optional fields from your existing schema
    clientAccepted: {
      type: Boolean,
      default: false,
    },
    freelancerAccepted: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid"],
      default: "pending",
    },
    completedAt: {
      type: Date,
    },
    cancelledAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Remove or adjust unique indexes that might conflict with existing data
contractSchema.index({ clientId: 1, status: 1 });
contractSchema.index({ freelancerId: 1, status: 1 });
contractSchema.index({ projectId: 1 });
// Remove unique index from proposalId since existing data might have duplicates
contractSchema.index({ proposalId: 1 });
// Remove unique index from contractNumber or make it sparse
contractSchema.index({ contractNumber: 1 }, { sparse: true, unique: true });

// Only generate contract number if it doesn't exist
contractSchema.pre("save", function (next) {
  if (!this.contractNumber) {
    this.contractNumber = `CON-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
  }
  next();
});

const Contract = mongoose.model("Contract", contractSchema);

export default Contract;