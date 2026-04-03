// controllers/chatController.js
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Contract from "../models/Contract.js";
import Proposal from "../models/Proposal.js";
import Project from "../models/Project.js";

// @desc    Get or create chat between users
// @route   POST /api/chats
// @access  Private
export const accessChat = async (req, res) => {
  try {
    const { userId, proposalId, contractId } = req.body;

    if (!userId && !proposalId && !contractId) {
      return res.status(400).json({ message: "Provide userId, proposalId, or contractId" });
    }

    let chat;

    // Case 1: Access by contractId
    if (contractId) {
      const contract = await Contract.findById(contractId);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      // Check if user is involved in contract
      if (
        contract.clientId.toString() !== req.user._id.toString() &&
        contract.freelancerId.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: "You are not part of this contract" });
      }

      // Find or create contract chat
      chat = await Chat.findOne({ contractId: contractId });

      if (!chat) {
        chat = await Chat.create({
          chatName: `Contract Chat - ${contract.projectId?.title || "Untitled"}`,
          isGroupChat: false,
          users: [contract.clientId, contract.freelancerId],
          contractId: contract._id,
          projectId: contract.projectId,
          chatType: "contract_chat",
          isActive: true
        });
      }
    }
    // Case 2: Access by proposalId
    else if (proposalId) {
      const proposal = await Proposal.findById(proposalId)
        .populate("projectId", "title client")
        .populate("freelancerId", "name email");

      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Check if user is involved in proposal
      const isClient = req.user._id.toString() === proposal.projectId.client.toString();
      const isFreelancer = req.user._id.toString() === proposal.freelancerId._id.toString();

      if (!isClient && !isFreelancer) {
        return res.status(403).json({ message: "You are not part of this proposal" });
      }

      // Find or create proposal chat
      chat = await Chat.findOne({ proposalId: proposalId });

      if (!chat) {
        const otherUserId = isClient ? proposal.freelancerId._id : proposal.projectId.client;

        chat = await Chat.create({
          chatName: `Proposal Chat - ${proposal.projectId.title}`,
          isGroupChat: false,
          users: [req.user._id, otherUserId],
          proposalId: proposal._id,
          projectId: proposal.projectId._id,
          chatType: "proposal_chat",
          isActive: true
        });
      }
    }
    // Case 3: Direct user-to-user chat (requires active contract)
    else if (userId) {
      // Check if there's an active contract between users
      const activeContract = await Contract.findOne({
        $or: [
          { clientId: req.user._id, freelancerId: userId, status: "active" },
          { clientId: userId, freelancerId: req.user._id, status: "active" }
        ]
      });

      if (!activeContract) {
        return res.status(400).json({
          message: "You need an active contract to chat with this user"
        });
      }

      // Find existing contract chat
      chat = await Chat.findOne({
        contractId: activeContract._id,
        isActive: true
      });

      if (!chat) {
        // Create new contract chat
        chat = await Chat.create({
          chatName: `Contract Chat - ${activeContract.projectId?.title || "Untitled"}`,
          isGroupChat: false,
          users: [req.user._id, userId],
          contractId: activeContract._id,
          projectId: activeContract.projectId,
          chatType: "contract_chat",
          isActive: true
        });
      }
    }

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Populate chat data
    const populatedChat = await Chat.findById(chat._id)
      .populate("users", "name email profilePhoto role")
      .populate("contractId", "status payment startDate endDate")
      .populate("proposalId", "bidAmount status")
      .populate("projectId", "title status")
      .populate("latestMessage");

    res.status(200).json(populatedChat);
  } catch (error) {
    console.error("Access chat error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all chats for logged-in user
// @route   GET /api/chats
// @access  Private
export const fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: req.user._id,
      isActive: true
    })
      .populate("users", "name email profilePhoto role")
      .populate("contractId", "status payment startDate endDate")
      .populate("proposalId", "bidAmount status")
      .populate("projectId", "title status")
      .populate({
        path: "latestMessage",
        populate: {
          path: "sender",
          select: "name profilePhoto"
        }
      })
      .sort({ updatedAt: -1 });

    // Filter out chats where contract has ended (if chat is contract-based)
    const filteredChats = chats.filter(chat => {
      if (chat.chatType === "contract_chat" && chat.contractId) {
        return chat.contractId.status === "active";
      }
      return true;
    });

    res.status(200).json(filteredChats);
  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check if users can chat (have active contract or proposal)
// @route   GET /api/chats/can-chat/:userId
// @access  Private
export const canChatWithUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Check for active contract
    const activeContract = await Contract.findOne({
      $or: [
        { clientId: req.user._id, freelancerId: userId, status: "active" },
        { clientId: userId, freelancerId: req.user._id, status: "active" }
      ]
    });

    if (activeContract) {
      return res.status(200).json({
        canChat: true,
        reason: "active_contract",
        contractId: activeContract._id,
        contractStatus: activeContract.status
      });
    }

    // Check for pending proposals between users
    const project = await Project.findOne({
      client: req.user._id,
      status: "open"
    });

    if (project) {
      const proposal = await Proposal.findOne({
        projectId: project._id,
        freelancerId: userId,
        status: "pending"
      });

      if (proposal) {
        return res.status(200).json({
          canChat: true,
          reason: "pending_proposal",
          proposalId: proposal._id,
          projectId: project._id
        });
      }
    }

    // Check if user is freelancer and client has open projects
    if (req.user.role === "freelancer") {
      const project = await Project.findOne({
        client: userId,
        status: "open"
      });

      if (project) {
        return res.status(200).json({
          canChat: true,
          reason: "potential_proposal",
          projectId: project._id
        });
      }
    }

    res.status(200).json({
      canChat: false,
      reason: "no_active_relationship"
    });
  } catch (error) {
    console.error("Can chat check error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get contract chat (for contractRoutes compatibility)
// @route   GET /api/chats/contract/:contractId
// @access  Private
export const getContractChat = async (req, res) => {
  try {
    const { contractId } = req.params;

    const contract = await Contract.findById(contractId);
    if (!contract) {
      return res.status(404).json({ message: "Contract not found" });
    }

    // Check if user is involved in contract
    if (
      contract.clientId.toString() !== req.user._id.toString() &&
      contract.freelancerId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "You are not part of this contract" });
    }

    // Find associated chat
    const chat = await Chat.findOne({
      contractId: contractId,
      isActive: true
    })
      .populate("users", "name email profilePhoto role")
      .populate("latestMessage")
      .populate({
        path: "contractId",
        select: "status payment startDate endDate"
      });

    if (!chat) {
      // Create chat if it doesn't exist
      const newChat = await Chat.create({
        chatName: `Contract Chat - ${contract.projectId?.title || "Untitled"}`,
        isGroupChat: false,
        users: [contract.clientId, contract.freelancerId],
        contractId: contract._id,
        chatType: "contract_chat",
        isActive: true
      });

      const populatedChat = await Chat.findById(newChat._id)
        .populate("users", "name email profilePhoto role")
        .populate({
          path: "contractId",
          select: "status payment startDate endDate"
        });

      return res.status(200).json({
        message: "Chat created",
        chat: populatedChat
      });
    }

    res.status(200).json({ chat });
  } catch (error) {
    console.error("Error getting contract chat:", error);
    res.status(500).json({ message: "Error fetching chat", error: error.message });
  }

};

// @desc    Clear chat history
// @route   DELETE /api/chats/:chatId/messages
// @access  Private
export const clearChat = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Authorization check
    if (!chat.users.includes(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Logic: In a real app, you might want soft-delete per user.
    // For now, we'll delete messages for this chat sender or completely clear if requested.
    // To implement "clear for me", we'd need a "hiddenFor" array in Message.
    // Assuming simple clear for both for now based on request "make clear chat"

    await Message.deleteMany({ chat: chatId });

    res.json({ message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Clear chat error:", error);
    res.status(500).json({ message: error.message });
  }
};