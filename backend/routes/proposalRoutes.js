import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createProposal,
  getProposalsByProject,
  updateProposalStatus,
  getMyProposals,
  getProposalById,
  getFreelancerProposals,
  updateProposal,
  deleteProposal
} from "../controllers/proposalController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Freelancer-specific routes
router.get("/my", getMyProposals);
router.get("/freelancer/all", getFreelancerProposals); // Changed to avoid conflict
router.post("/", createProposal);

// Project-specific routes
router.get("/project/:projectId", getProposalsByProject);

// Individual proposal routes
router.get("/:id", getProposalById);
router.put("/:id", updateProposal); // Added update route
router.patch("/:id/status", updateProposalStatus);
router.delete("/:id", deleteProposal);

export default router;