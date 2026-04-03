// controllers/messageController.js
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";
import Contract from "../models/Contract.js";

export const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text) {
      return res.status(400).json({ message: "Chat ID and text are required" });
    }

    const chat = await Chat.findById(chatId)
      .populate("users", "name role profilePhoto")
      .populate("contractId", "status startDate endDate payment")
      .populate("proposalId", "status");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is part of the chat
    const isUserInChat = chat.users.some(user => 
      user._id.toString() === req.user._id.toString()
    );
    
    if (!isUserInChat) {
      return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    // Check chat accessibility based on type
    if (chat.chatType === "contract_chat" && chat.contractId) {
      if (chat.contractId.status !== "active") {
        return res.status(403).json({
          message: "Contract has ended. Chat is read-only.",
          contractStatus: chat.contractId.status
        });
      }
    } else if (chat.chatType === "proposal_chat" && chat.proposalId) {
      if (chat.proposalId.status !== "pending") {
        return res.status(403).json({
          message: "Proposal is no longer pending. Chat is closed.",
          proposalStatus: chat.proposalId.status
        });
      }
    }

    // Create message
    const message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      text
    });

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name role profilePhoto")
      .populate("chat");

    // Update chat's latest message and timestamp
    chat.latestMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Broadcast via Socket.io (your existing socket logic)
    const io = req.app.get('socketio');
    if (io) {
      io.to(chatId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const sendFileMessage = async (req, res) => {
  try {
    const { chatId } = req.body;
    const file = req.file;

    if (!chatId || !file) {
      return res.status(400).json({ message: "Chat ID and file are required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is part of the chat
    const isUserInChat = chat.users.some(user => 
      user.toString() === req.user._id.toString()
    );
    
    if (!isUserInChat) {
      return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    // Create message with file
    const message = await Message.create({
      sender: req.user._id,
      chat: chatId,
      text: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      fileType: file.mimetype,
      fileName: file.originalname,
      fileSize: file.size
    });

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name role profilePhoto");

    // Update chat's latest message
    chat.latestMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Broadcast via Socket.io
    const io = req.app.get('socketio');
    if (io) {
      io.to(chatId).emit("newMessage", populatedMessage);
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("Error sending file message:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Check if user is part of the chat
    const isUserInChat = chat.users.some(user => 
      user.toString() === req.user._id.toString()
    );
    
    if (!isUserInChat) {
      return res.status(403).json({ message: "You are not a participant in this chat" });
    }

    const messages = await Message.find({ chat: chatId })
      .populate("sender", "name profilePhoto role")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("Error getting messages:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};