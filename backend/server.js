import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import passport from "passport";
import session from "express-session";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import "./config/passport.js";
import { connectDB } from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import proposalRoutes from "./routes/proposalRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import ChatBot from './routes/chatBotRoutes.js';
import contactRoutes from "./routes/contactRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// Simple CORS configuration
app.use(cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "talentlink-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

connectDB();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/proposals", proposalRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/uploads', express.static(path.join(path.resolve(), '/uploads')));

app.use("/api/contact", contactRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/chatbot", ChatBot);

app.get("/", (req, res) => {
  res.json({ message: "TalentLink API" });
});

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    credentials: true
  }
});

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("Authentication error"));

    socket.userId = user._id;
    socket.user = user;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
});

io.on("connection", socket => {
  console.log(`User connected: ${socket.userId}`);

  socket.on("joinChat", chatId => {
    socket.join(chatId);
  });

  socket.on("sendMessage", async data => {
    const { chatId, text } = data;

    // Import Message and Chat inside the handler to avoid circular dependencies
    const Message = (await import("./models/Message.js")).default;
    const Chat = (await import("./models/Chat.js")).default;

    const newMessage = await Message.create({
      sender: socket.userId,
      chat: chatId,
      text
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage._id,
      updatedAt: new Date()
    });

    const fullMessage = await Message.findById(newMessage._id)
      .populate("sender", "name email role profilePhoto");

    io.to(chatId).emit("newMessage", fullMessage);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});