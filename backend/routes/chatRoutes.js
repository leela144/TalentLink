// routes/chatRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  accessChat,
  fetchChats,
  canChatWithUser,
  getContractChat,
  clearChat
} from "../controllers/chatController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all chats for user
router.get("/", fetchChats);

router.delete("/:chatId/messages", protect, clearChat);

// Access specific chat (by userId, proposalId, or contractId)
router.post("/", accessChat);

// Check if user can chat with another user
router.get("/can-chat/:userId", canChatWithUser);

// Get chat for specific contract
router.get("/contract/:contractId", getContractChat);

export default router;