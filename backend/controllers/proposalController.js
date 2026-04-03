// // controllers/proposalController.js
// import Proposal from "../models/Proposal.js";
// import Project from "../models/Project.js";
// import Notification from "../models/Notification.js";
// import Chat from "../models/Chat.js";
// import asyncHandler from "express-async-handler";
// import Contract from "../models/Contract.js"
// export const createProposal = async (req, res) => {
//   try {
//     if (req.user.role !== "freelancer") {
//       return res.status(403).json({ message: "Only freelancers can create proposals" });
//     }

//     const { projectId, bidAmount, message, estimatedTime } = req.body;

//     const project = await Project.findById(projectId).populate("client", "name email");
//     if (!project)
//       return res.status(404).json({ message: "Project not found" });

//     if (project.status !== "open") {
//       return res.status(400).json({ message: "Cannot submit proposal. Project is already assigned or completed." });
//     }

//     const existingProposal = await Proposal.findOne({
//       projectId,
//       freelancerId: req.user._id,
//     });

//     if (existingProposal) {
//       return res.status(400).json({ message: "You have already submitted a proposal for this project" });
//     }

//     // Create proposal
//     const proposal = await Proposal.create({
//       projectId,
//       freelancerId: req.user._id,
//       bidAmount,
//       message,
//       estimatedTime,
//       status: "pending"
//     });

//     // Create initial proposal chat for communication
//     const chat = await Chat.create({
//       chatName: `Proposal Chat - ${project.title}`,
//       isGroupChat: false,
//       users: [req.user._id, project.client._id],
//       projectId: projectId,
//       proposalId: proposal._id,
//       chatType: "proposal_chat",
//       isActive: true
//     });

//     // Send notification to client
//     await Notification.create({
//       user: project.client,
//       title: "New Proposal Received",
//       message: `${req.user.name} submitted a proposal for "${project.title}"`,
//       type: "proposal",
//       relatedId: proposal._id,
//     });

//     // Send notification to freelancer
//     await Notification.create({
//       user: req.user._id,
//       title: "Proposal Submitted",
//       message: `Your proposal for "${project.title}" has been submitted. You can now chat with the client.`,
//       type: "proposal",
//       relatedId: proposal._id,
//     });

//     res.status(201).json({
//       message: "Proposal submitted successfully",
//       proposal,
//       chat: {
//         _id: chat._id,
//         chatName: chat.chatName,
//         users: chat.users
//       }
//     });
//   } catch (error) {
//     console.error("Proposal creation error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getProjectProposals = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     const project = await Project.findById(projectId);
//     if (!project)
//       return res.status(404).json({ message: "Project not found" });

//     if (project.client.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     const proposals = await Proposal.find({ projectId })
//       .populate("freelancerId", "name email skills hourlyRate rating profilePhoto")
//       .sort({ createdAt: -1 });

//     res.status(200).json(proposals);
//   } catch (error) {
//     console.error("Error fetching project proposals:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const getMyProposals = async (req, res) => {
//   try {
//     const proposals = await Proposal.find({ freelancerId: req.user._id })
//       .populate("projectId", "title description status budget duration requiredSkills")
//       .populate({
//         path: "projectId",
//         populate: {
//           path: "client",
//           select: "name email rating profilePhoto"
//         }
//       })
//       .sort({ createdAt: -1 });

//     res.status(200).json(proposals);
//   } catch (error) {
//     console.error("Error fetching my proposals:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



// export const updateProposalStatus = async (req, res) => {
//   try {
//     if (req.user.role !== "client") {
//       return res.status(403).json({ message: "Only clients can update proposal status" })
//     }

//     const { id } = req.params
//     const { status } = req.body

//     if (!["pending", "accepted", "rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" })
//     }

//     const proposal = await Proposal.findById(id)
//       .populate("projectId")
//       .populate("freelancerId", "name email")

//     if (!proposal) {
//       return res.status(404).json({ message: "Proposal not found" })
//     }

//     if (proposal.projectId.client.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Unauthorized" })
//     }

//     if (proposal.status === "accepted" && status === "accepted") {
//       return res.status(400).json({ message: "Proposal already accepted" })
//     }

//     proposal.status = status
//     await proposal.save()

//     const proposalChat = await Chat.findOne({ proposalId: proposal._id })
//     if (proposalChat) {
//       proposalChat.isActive = status === "accepted"
//       await proposalChat.save()
//     }

//     if (status === "accepted") {
//       const project = await Project.findById(proposal.projectId._id)

//       project.status = "in_progress"
//       project.assignedFreelancer = proposal.freelancerId._id
//       await project.save()

//       const existingContract = await Contract.findOne({ proposalId: proposal._id })

//       let contract = existingContract
//       if (!existingContract) {
//         contract = await Contract.create({
//           projectId: project._id,
//           proposalId: proposal._id,
//           clientId: project.client,
//           freelancerId: proposal.freelancerId._id,
//           title: project.title,
//           description: proposal.message,
//           budget: proposal.bidAmount,
//           status: "active",
//           startDate: new Date()
//         })
//       }

//       await Notification.create({
//         user: proposal.freelancerId._id,
//         title: "Proposal Accepted",
//         message: `Your proposal for "${project.title}" has been accepted`,
//         type: "contract",
//         relatedId: contract._id
//       })

//       await Notification.create({
//         user: req.user._id,
//         title: "Contract Created",
//         message: `Contract created for "${project.title}"`,
//         type: "contract",
//         relatedId: contract._id
//       })

//       return res.status(200).json({
//         message: "Proposal accepted and contract created",
//         proposal,
//         contract
//       })
//     }

//     if (status === "rejected") {
//       await Notification.create({
//         user: proposal.freelancerId._id,
//         title: "Proposal Rejected",
//         message: `Your proposal for "${proposal.projectId.title}" was rejected`,
//         type: "proposal",
//         relatedId: proposal._id
//       })
//     }

//     res.status(200).json({
//       message: `Proposal ${status}`,
//       proposal
//     })
//   } catch (error) {
//     console.error("Proposal status update error:", error)
//     res.status(500).json({ message: error.message })
//   }
// }


// export const deleteProposal = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const proposal = await Proposal.findById(id);
//     if (!proposal) {
//       return res.status(404).json({ message: "Proposal not found" });
//     }

//     // Check if user owns the proposal
//     if (proposal.freelancerId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "You can only delete your own proposals" });
//     }

//     // Check if proposal can be deleted (only pending proposals can be deleted)
//     if (proposal.status !== "pending") {
//       return res.status(400).json({ 
//         message: `Cannot delete proposal with status: ${proposal.status}. Only pending proposals can be deleted.` 
//       });
//     }

//     // Find and disable associated chat
//     const proposalChat = await Chat.findOne({ proposalId: proposal._id });
//     if (proposalChat) {
//       proposalChat.isActive = false;
//       await proposalChat.save();
//     }

//     // Delete the proposal
//     await proposal.deleteOne();

//     res.status(200).json({ 
//       message: "Proposal deleted successfully",
//       proposalId: id 
//     });
//   } catch (error) {
//     console.error("Proposal deletion error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// // Additional optional functions you might want to add:

// // controllers/proposalController.js


// // @desc    Get proposals by project ID
// // @route   GET /api/proposals/project/:projectId
// // @access  Private
// export const getProposalsByProject = asyncHandler(async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     console.log("🔍 Fetching proposals for project:", projectId);

//     // Validate project ID
//     if (!mongoose.Types.ObjectId.isValid(projectId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid project ID format"
//       });
//     }

//     // Check if project exists
//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({
//         success: false,
//         message: "Project not found"
//       });
//     }

//     // Check if user is the project client
//     // Your Project model uses 'client' field, not 'clientId'
//     let projectClientId = project.client;

//     // Handle both ObjectId and string
//     if (projectClientId && typeof projectClientId === 'object') {
//       projectClientId = projectClientId.toString();
//     }

//     const userId = req.user._id.toString();

//     console.log("🔍 Project client ID:", projectClientId);
//     console.log("🔍 User ID:", userId);

//     if (projectClientId !== userId) {
//       return res.status(403).json({
//         success: false,
//         message: "Only the project client can view proposals"
//       });
//     }

//     // Get proposals
//     const proposals = await Proposal.find({ projectId })
//       .populate("freelancerId", "name email avatar skills")
//       .populate("projectId", "title")
//       .sort({ createdAt: -1 });

//     console.log(`✅ Found ${proposals.length} proposals for project ${projectId}`);

//     res.json({
//       success: true,
//       count: proposals.length,
//       proposals: proposals
//     });
//   } catch (error) {
//     console.error("❌ Error fetching project proposals:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching proposals",
//       error: error.message
//     });
//   }
// });

// export const updateProposal = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { bidAmount, message, estimatedTime } = req.body;

//     const proposal = await Proposal.findById(id);
//     if (!proposal) {
//       return res.status(404).json({ message: "Proposal not found" });
//     }

//     // Check if user owns the proposal
//     if (proposal.freelancerId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "You can only update your own proposals" });
//     }

//     // Check if proposal can be updated (only pending proposals can be updated)
//     if (proposal.status !== "pending") {
//       return res.status(400).json({ 
//         message: `Cannot update proposal with status: ${proposal.status}. Only pending proposals can be updated.` 
//       });
//     }

//     // Update fields
//     if (bidAmount !== undefined) proposal.bidAmount = bidAmount;
//     if (message !== undefined) proposal.message = message;
//     if (estimatedTime !== undefined) proposal.estimatedTime = estimatedTime;

//     await proposal.save();

//     // Send notification to client
//     const project = await Project.findById(proposal.projectId).populate("client", "name email");
//     if (project) {
//       await Notification.create({
//         user: project.client,
//         title: "Proposal Updated",
//         message: `${req.user.name} updated their proposal for "${project.title}"`,
//         type: "proposal",
//         relatedId: proposal._id,
//       });
//     }

//     res.status(200).json({
//       message: "Proposal updated successfully",
//       proposal
//     });
//   } catch (error) {
//     console.error("Proposal update error:", error);
//     res.status(500).json({ message: error.message });
//   }
// };





import mongoose from "mongoose";
import Proposal from "../models/Proposal.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import Chat from "../models/Chat.js";
import Contract from "../models/Contract.js";
import asyncHandler from "express-async-handler";

// @desc    Create a new proposal
// @route   POST /api/proposals
// @access  Private/Freelancer
export const createProposal = asyncHandler(async (req, res) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ message: "Only freelancers can create proposals" });
  }

  const { projectId, bidAmount, message, estimatedTime } = req.body;

  const project = await Project.findById(projectId).populate("client", "name email");
  if (!project)
    return res.status(404).json({ message: "Project not found" });

  if (project.status !== "open") {
    return res.status(400).json({ message: "Cannot submit proposal. Project is already assigned or completed." });
  }

  const existingProposal = await Proposal.findOne({
    projectId,
    freelancerId: req.user._id,
  });

  if (existingProposal) {
    return res.status(400).json({ message: "You have already submitted a proposal for this project" });
  }

  // Create proposal
  const proposal = await Proposal.create({
    projectId,
    freelancerId: req.user._id,
    bidAmount,
    message,
    estimatedTime,
    status: "pending"
  });

  // Create initial proposal chat for communication
  const chat = await Chat.create({
    chatName: `Proposal Chat - ${project.title}`,
    isGroupChat: false,
    users: [req.user._id, project.client._id],
    projectId: projectId,
    proposalId: proposal._id,
    chatType: "proposal_chat",
    isActive: true
  });

  // Send notification to client
  await Notification.create({
    user: project.client,
    title: "New Proposal Received",
    message: `${req.user.name} submitted a proposal for "${project.title}"`,
    type: "proposal",
    relatedId: proposal._id,
  });

  // Send notification to freelancer
  await Notification.create({
    user: req.user._id,
    title: "Proposal Submitted",
    message: `Your proposal for "${project.title}" has been submitted. You can now chat with the client.`,
    type: "proposal",
    relatedId: proposal._id,
  });

  res.status(201).json({
    message: "Proposal submitted successfully",
    proposal,
    chat: {
      _id: chat._id,
      chatName: chat.chatName,
      users: chat.users
    }
  });
});

// @desc    Get proposals for a specific project
// @route   GET /api/proposals/project/:projectId
// @access  Private/Client (Project Owner)
export const getProposalsByProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  // Validate project ID
  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid project ID format"
    });
  }

  // Check if project exists
  const project = await Project.findById(projectId);
  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found"
    });
  }

  // Check if user is the project client
  const projectClientId = project.client.toString();
  const userId = req.user._id.toString();

  if (projectClientId !== userId && req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only the project client can view proposals"
    });
  }

  // Get proposals
  const proposals = await Proposal.find({ projectId })
    .populate("freelancerId", "name email avatar skills rating profilePhoto")
    .populate("projectId", "title")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: proposals.length,
    proposals
  });
});

// @desc    Get freelancer's proposals
// @route   GET /api/proposals/my
// @access  Private/Freelancer
export const getMyProposals = asyncHandler(async (req, res) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ message: "Only freelancers can view their proposals" });
  }

  const proposals = await Proposal.find({ freelancerId: req.user._id })
    .populate("projectId", "title description status budget duration requiredSkills")
    .populate({
      path: "projectId",
      populate: {
        path: "client",
        select: "name email rating profilePhoto"
      }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: proposals.length,
    proposals
  });
});

// @desc    Get all freelancer proposals (alternative to getMyProposals)
// @route   GET /api/proposals/freelancer/all
// @access  Private/Freelancer
export const getFreelancerProposals = asyncHandler(async (req, res) => {
  if (req.user.role !== "freelancer") {
    return res.status(403).json({ message: "Only freelancers can view proposals" });
  }

  const proposals = await Proposal.find({ freelancerId: req.user._id })
    .populate("projectId", "title status budget")
    .populate({
      path: "projectId",
      populate: {
        path: "client",
        select: "name"
      }
    })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: proposals.length,
    proposals
  });
});

// @desc    Get proposal by ID
// @route   GET /api/proposals/:id
// @access  Private
export const getProposalById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid proposal ID" });
  }

  const proposal = await Proposal.findById(id)
    .populate("freelancerId", "name email skills rating profilePhoto")
    .populate({
      path: "projectId",
      populate: {
        path: "client",
        select: "name email"
      }
    });

  if (!proposal) {
    return res.status(404).json({ message: "Proposal not found" });
  }

  // Check authorization
  const isFreelancer = proposal.freelancerId._id.toString() === req.user._id.toString();
  const isClient = proposal.projectId.client._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isFreelancer && !isClient && !isAdmin) {
    return res.status(403).json({ message: "Not authorized to view this proposal" });
  }

  res.json({
    success: true,
    proposal
  });
});

// @desc    Update proposal status
// @route   PATCH /api/proposals/:id/status
// @access  Private/Client
export const updateProposalStatus = async (req, res) => {
  try {
    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can update proposal status" })
    }

    const { id } = req.params
    const { status } = req.body

    if (!["pending", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" })
    }

    const proposal = await Proposal.findById(id)
      .populate("projectId")
      .populate("freelancerId", "name email")

    if (!proposal) {
      return res.status(404).json({ message: "Proposal not found" })
    }

    if (proposal.projectId.client.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" })
    }

    if (proposal.status === "accepted") {
      return res.status(400).json({ message: "Proposal already accepted" })
    }

    proposal.status = status
    await proposal.save()

    if (status === "accepted") {
      const project = await Project.findById(proposal.projectId._id)

      project.status = "in_progress"
      project.assignedFreelancer = proposal.freelancerId._id
      await project.save()

      const existingContract = await Contract.findOne({
        proposalId: proposal._id
      })

      let contract = existingContract

      if (!existingContract) {
        const startDate = new Date()
        const endDate = new Date()

        // Fix for Invalid Date error: Ensure estimatedTime is a valid number
        let duration = 7; // Default to 7 days
        if (proposal.estimatedTime) {
          const parsed = parseInt(proposal.estimatedTime);
          if (!isNaN(parsed) && parsed > 0) {
            duration = parsed;
          }
        }

        endDate.setDate(endDate.getDate() + duration)

        // Create contract with ACTIVE status immediately as requested
        contract = await Contract.create({
          proposalId: proposal._id,
          projectId: project._id,
          clientId: project.client,
          freelancerId: proposal.freelancerId._id,
          startDate,
          endDate,
          payment: proposal.bidAmount,
          status: "active", // DIRECTLY ACTIVE
          clientAccepted: true,
          freelancerAccepted: true // Auto-accept for freelancer too since proposal was accepted
        })
      }

      // Handle chat conversion: Convert proposal chat to contract chat
      const proposalChat = await Chat.findOne({ proposalId: proposal._id })

      if (proposalChat) {
        // Convert existing proposal chat to contract chat
        proposalChat.contractId = contract._id
        proposalChat.chatType = "contract_chat"
        proposalChat.chatName = `Contract Chat - ${project.title}`
        proposalChat.isActive = true
        await proposalChat.save()
      } else {
        // Create new contract chat if proposal chat doesn't exist
        await Chat.create({
          chatName: `Contract Chat - ${project.title}`,
          isGroupChat: false,
          users: [project.client, proposal.freelancerId._id],
          contractId: contract._id,
          projectId: project._id,
          proposalId: proposal._id,
          chatType: "contract_chat",
          isActive: true
        })
      }

      await Notification.create({
        user: proposal.freelancerId._id,
        title: "Proposal Accepted - Contract Pending",
        message: `Your proposal for "${project.title}" has been accepted. Please review and accept the contract to finalize the agreement.`,
        type: "contract",
        relatedId: contract._id
      })

      await Notification.create({
        user: req.user._id,
        title: "Contract Created - Pending Freelancer Acceptance",
        message: `Contract created for "${project.title}". Waiting for freelancer to accept the contract.`,
        type: "contract",
        relatedId: contract._id
      })

      return res.status(200).json({
        message: "Proposal accepted and contract created",
        proposal,
        contract
      })
    }

    if (status === "rejected") {
      // Disable proposal chat when proposal is rejected
      const proposalChat = await Chat.findOne({ proposalId: proposal._id })
      if (proposalChat) {
        proposalChat.isActive = false
        await proposalChat.save()
      }

      await Notification.create({
        user: proposal.freelancerId._id,
        title: "Proposal Rejected",
        message: `Your proposal for "${proposal.projectId.title}" was rejected`,
        type: "proposal",
        relatedId: proposal._id
      })
    }

    res.status(200).json({
      message: `Proposal ${status}`,
      proposal
    })
  } catch (error) {
    console.error("Proposal status update error:", error)
    res.status(500).json({ message: error.message })
  }
}


// @desc    Update proposal details
// @route   PUT /api/proposals/:id
// @access  Private/Freelancer
export const updateProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { bidAmount, message, estimatedTime } = req.body;

  const proposal = await Proposal.findById(id);
  if (!proposal) {
    return res.status(404).json({ message: "Proposal not found" });
  }

  // Check if user owns the proposal
  if (proposal.freelancerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only update your own proposals" });
  }

  // Check if proposal can be updated (only pending proposals can be updated)
  if (proposal.status !== "pending") {
    return res.status(400).json({
      message: `Cannot update proposal with status: ${proposal.status}. Only pending proposals can be updated.`
    });
  }

  // Update fields
  if (bidAmount !== undefined) proposal.bidAmount = bidAmount;
  if (message !== undefined) proposal.message = message;
  if (estimatedTime !== undefined) proposal.estimatedTime = estimatedTime;

  await proposal.save();

  // Send notification to client
  const project = await Project.findById(proposal.projectId).populate("client", "name email");
  if (project) {
    await Notification.create({
      user: project.client,
      title: "Proposal Updated",
      message: `${req.user.name} updated their proposal for "${project.title}"`,
      type: "proposal",
      relatedId: proposal._id,
    });
  }

  res.status(200).json({
    message: "Proposal updated successfully",
    proposal
  });
});

// @desc    Delete a proposal
// @route   DELETE /api/proposals/:id
// @access  Private/Freelancer
export const deleteProposal = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const proposal = await Proposal.findById(id);
  if (!proposal) {
    return res.status(404).json({ message: "Proposal not found" });
  }

  // Check if user owns the proposal
  if (proposal.freelancerId.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "You can only delete your own proposals" });
  }

  // Check if proposal can be deleted (only pending proposals can be deleted)
  if (proposal.status !== "pending") {
    return res.status(400).json({
      message: `Cannot delete proposal with status: ${proposal.status}. Only pending proposals can be deleted.`
    });
  }

  // Find and disable associated chat
  const proposalChat = await Chat.findOne({ proposalId: proposal._id });
  if (proposalChat) {
    proposalChat.isActive = false;
    await proposalChat.save();
  }

  // Delete the proposal
  await proposal.deleteOne();

  res.status(200).json({
    message: "Proposal deleted successfully",
    proposalId: id
  });
});