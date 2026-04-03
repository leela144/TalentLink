import Project from "../models/Project.js";
import Proposal from "../models/Proposal.js";
import Contract from "../models/Contract.js";
import Review from "../models/Review.js";

// 🧩 GET /api/dashboard
// Returns summary stats based on user role
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let stats = {};

    if (role === "client") {
      // 📊 CLIENT DASHBOARD
      const totalProjects = await Project.countDocuments({ client: userId });
      const openProjects = await Project.countDocuments({ client: userId, status: "open" });
      const inProgress = await Project.countDocuments({ client: userId, status: "in_progress" });
      const completed = await Project.countDocuments({ client: userId, status: "completed" });

      const totalProposals = await Proposal.countDocuments({ projectId: { $in: (await Project.find({ client: userId }).select("_id")) } });
      const contracts = await Contract.countDocuments({ clientId: userId });

      stats = {
        role: "client",
        totalProjects,
        openProjects,
        inProgress,
        completed,
        totalProposals,
        contracts,
      };
    } 
    else if (role === "freelancer") {
      // 👨‍💻 FREELANCER DASHBOARD
      const proposalsSent = await Proposal.countDocuments({ freelancerId: userId });
      const proposalsAccepted = await Proposal.countDocuments({ freelancerId: userId, status: "accepted" });

      const activeContracts = await Contract.countDocuments({ freelancerId: userId, status: "active" });
      const completedContracts = await Contract.countDocuments({ freelancerId: userId, status: "completed" });

      const reviews = await Review.find({ revieweeId: userId });
      const avgRating = reviews.length
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : null;

      stats = {
        role: "freelancer",
        proposalsSent,
        proposalsAccepted,
        activeContracts,
        completedContracts,
        totalReviews: reviews.length,
        averageRating: avgRating,
      };
    } 
    else {
      return res.status(403).json({ message: "Invalid user role" });
    }

    res.status(200).json({ success: true, stats });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
};
