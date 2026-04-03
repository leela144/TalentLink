import express from "express";
import { chatController } from "../controllers/chatBotController.js";

const router = express.Router();

router.post("/chat", chatController);

export default router;
