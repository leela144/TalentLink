import express from "express";
import {
  getAllProjects,
  createProject,
  getClientAllProjects,
  getClientProjects,
  updateProject,
  deleteProject,
  getProjectById,
  getOpenProjects,
} from "../controllers/projectController.js";
import { protect, roleCheck } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ PUBLIC OPEN PROJECTS - MUST COME BEFORE DYNAMIC ROUTES
router.get("/open", getOpenProjects);

// Client projects
router.get("/my", protect, roleCheck("client"), getClientProjects);

// All projects (admin / debug)
router.get("/all", getAllProjects);

// Create project (client only)
router.post("/", protect, roleCheck("client"), createProject);

// Get project by ID
router.get("/:id", getProjectById);

// Get all projects by client ID
router.get("/client/:clientId", getClientAllProjects);

// Update / delete
router.put("/:id", protect, roleCheck("client"), updateProject);
router.delete("/:id", protect, roleCheck("client"), deleteProject);

export default router;