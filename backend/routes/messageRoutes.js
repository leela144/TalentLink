import express from "express";
import multer from "multer";
import { sendMessage, getMessages, sendFileMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, "uploads/");
    },
    filename(req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
const upload = multer({ storage });

router.post("/", protect, sendMessage);
router.post("/file", protect, upload.single("file"), sendFileMessage);
router.get("/:chatId", protect, getMessages);

export default router;
