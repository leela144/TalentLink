// routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/upload.js";
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  getUserById
} from "../controllers/userController.js";

const router = express.Router();

// Get current user profile
router.get("/profile", protect, getProfile);

// Get user by ID (public info)
router.get("/:id", protect, getUserById);

// Update user profile
router.put("/profile", protect, updateProfile);

// Upload profile photo
router.post("/profile/photo", protect, 
  upload.single("photo"),
  uploadProfilePhoto
);

export default router;