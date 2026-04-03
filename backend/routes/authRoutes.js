// routes/authRoutes.js
import express from "express";
import { OAuth2Client } from 'google-auth-library';
import { register, login } from "../controllers/authController.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js"; // ADD THIS IMPORT

const router = express.Router();

// Register user
router.post("/register", register);

// Login user
// Login user
router.post("/login", login);

// Forgot Password
import { forgotPassword, resetPassword } from "../controllers/authController.js";
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;