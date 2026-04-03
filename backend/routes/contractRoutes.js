// // routes/contractRoutes.js
// import express from "express";
// import { protect } from "../middleware/authMiddleware.js";
// import {
//   createContract,
//   getAllContracts,
//   getContractById,
//   updateContract,
//   deleteContract,
//   getContractChat,
//   getMyContracts,
//   updateContractStatus
// } from "../controllers/contractController.js";

// const router = express.Router();

// router.use(protect);

// // Get all contracts
// router.get("/", getAllContracts);

// // Get my contracts (for dashboard)
// router.get("/my", getMyContracts);

// // Create new contract
// router.post("/", createContract);

// // Get contract by ID
// router.get("/:id", getContractById);

// // Update contract
// router.put("/:id", updateContract);

// // Update contract status only
// router.patch("/:id/status", updateContractStatus);

// // Delete contract
// router.delete("/:id", deleteContract);

// // Get chat for specific contract
// router.get("/:id/chat", getContractChat);

// export default router;




// routes/contractRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createContract,
  getAllContracts,
  getContractById,
  updateContract,
  deleteContract,
  getContractChat,
  getMyContracts,
  updateContractStatus,
  acceptContract
} from "../controllers/contractController.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Get all contracts (admin)
router.get("/", getAllContracts);

// Get my contracts (for dashboard)
router.get("/my", getMyContracts);

// Create new contract
router.post("/", createContract);

// Get contract by ID
router.get("/:id", getContractById);

// Update contract
router.put("/:id", updateContract);

// Update contract status only
router.patch("/:id/status", updateContractStatus);

// Accept contract (freelancer)
router.post("/:id/accept", acceptContract);

// Delete contract
router.delete("/:id", deleteContract);

// Get chat for specific contract
router.get("/:id/chat", getContractChat);

export default router;