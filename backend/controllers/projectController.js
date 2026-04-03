import Project from "../models/Project.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// 🟢 Create a new project (Client only)
export const createProject = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ success: false, message: "Only clients can create projects" });
    }

    const { title, description, budget, duration, requiredSkills } = req.body;

    const project = await Project.create({
      title,
      description,
      budget,
      duration,
      requiredSkills,
      client: req.user.id,
      status: "open",
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// 🟡 Get all open projects (visible to freelancers only)
export const getOpenProjects = async (req, res) => {
  try {
    const projects = await Project.find({ status: "open" }).populate("client", "name email");
    res.status(200).json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔵 Get single project by ID
export const getProjectById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid project ID" });
    }

    const project = await Project.findById(req.params.id).populate("client", "name email");
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔵 Get all projects created by a specific client (Admin or public view if needed)
export const getClientAllProjects = async (req, res) => {
  try {
    const { clientId } = req.params;
    const projects = await Project.find({ client: clientId }).populate("client", "name email");

    res.status(200).json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔵 Get projects of logged-in client
export const getClientProjects = async (req, res) => {
  try {
    const projects = await Project.find({ client: req.user.id }).populate("client", "name email");
    res.status(200).json({ success: true, projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate("client", "name email role")
      .sort({ createdAt: -1 });
    return res.json({ projects });
  } catch (err) {
    console.error("getAllProjects error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// 🟠 Update a project (Client only)
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    // Validate status
    const allowedStatus = ["open", "in_progress", "completed", "closed"];
    if (req.body.status && !allowedStatus.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const updated = await Project.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ success: true, project: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 🔴 Delete a project (Client only)
export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    if (project.client.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await project.deleteOne();
    res.status(200).json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};