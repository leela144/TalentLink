import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createReview,
  getReviews,
  getReviewById,
} from "../controllers/reviewController.js";

const router = express.Router();

/**
 * @route   POST /api/reviews
 * @desc    Create a review (Client only)
 * @access  Private
 */
router.post("/", protect, createReview);

/**
 * @route   GET /api/reviews
 * @desc    Get all reviews (visible to all logged-in users)
 * @access  Private
 */
router.get("/", protect, getReviews);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get a single review by ID
 * @access  Private
 */
router.get("/:id", protect, getReviewById);

export default router;
