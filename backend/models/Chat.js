// models/Chat.js
import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    chatName: { 
      type: String, 
      trim: true,
      default: function() {
        if (this.isGroupChat) {
          return "Group Chat";
        }
        return "Direct Chat";
      }
    },
    isGroupChat: { type: Boolean, default: false },

    users: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    ],

    // 🔑 LINK CHAT TO CONTRACT
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contract",
      required: false, // Changed to optional initially
      index: true
    },

    // 🔗 Link to proposal (for initial communication)
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: false,
      index: true
    },

    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: false,
      index: true
    },

    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message"
    },

    // 🔒 Control chat access
    isActive: {
      type: Boolean,
      default: true
    },

    // Auto-disable chat if contract ends
    autoDisableOnContractEnd: {
      type: Boolean,
      default: true
    },

    // Chat type: proposal_chat, contract_chat, general_chat
    chatType: {
      type: String,
      enum: ["proposal_chat", "contract_chat", "general_chat"],
      default: "general_chat"
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if chat is enabled
chatSchema.virtual('isEnabled').get(function() {
  if (this.isActive === false) return false;
  if (this.autoDisableOnContractEnd && this.contractId) {
    // This will be populated in controllers
    if (this.contractId && this.contractId.status !== 'active') {
      return false;
    }
  }
  return true;
});

// Indexes for better query performance
chatSchema.index({ users: 1 });
chatSchema.index({ contractId: 1, isActive: 1 });
chatSchema.index({ updatedAt: -1 });

export default mongoose.model("Chat", chatSchema);