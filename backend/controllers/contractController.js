// controllers/contractController.js
import asyncHandler from "express-async-handler";
import Contract from "../models/Contract.js";
import Proposal from "../models/Proposal.js";
import Project from "../models/Project.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// @desc    Create new contract
// @route   POST /api/contracts
// @access  Private
export const createContract = asyncHandler(async (req, res) => {
  try {
    console.log("🎯 ===== CONTRACT CREATION REQUEST =====");
    console.log("📋 Request body:", req.body);
    console.log("👤 User making request:", req.user._id, req.user.name, req.user.role);

    const {
      projectId,
      proposalId,
      freelancerId,
      clientId,
      title,
      description,
      budget,
      startDate,
      deadline,
      terms,
    } = req.body;

    // Debug: Log all received values
    console.log("📥 Received values:", {
      projectId,
      proposalId,
      freelancerId,
      clientId,
      title,
      description,
      budget,
      startDate,
      deadline,
      terms,
    });

    // Step 1: Validate required fields
    console.log("🔍 Step 1: Validating required fields...");
    
    const missingFields = [];
    if (!projectId) missingFields.push('projectId');
    if (!proposalId) missingFields.push('proposalId');
    if (!freelancerId) missingFields.push('freelancerId');
    if (!clientId) missingFields.push('clientId');
    if (!title) missingFields.push('title');
    if (!budget) missingFields.push('budget');
    if (!deadline) missingFields.push('deadline');

    if (missingFields.length > 0) {
      console.log("❌ Missing fields:", missingFields);
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        missing: missingFields
      });
    }

    console.log("✅ All required fields present");

    // Step 2: Verify user is the client
    console.log("🔍 Step 2: Verifying user authorization...");
    
    const userId = req.user._id.toString();
    const requestClientId = clientId.toString();
    
    if (userId !== requestClientId) {
      console.log("❌ User is not the client");
      return res.status(403).json({
        success: false,
        message: "Only the project client can create contracts",
        details: {
          userId: userId,
          clientId: requestClientId,
          userRole: req.user.role
        }
      });
    }
    console.log("✅ User is authorized (client)");

    // Step 3: Check if contract already exists for this proposal
    console.log("🔍 Step 3: Checking for existing contracts...");
    const existingContract = await Contract.findOne({ proposalId });
    if (existingContract) {
      console.log("❌ Contract already exists for this proposal");
      return res.status(400).json({
        success: false,
        message: "Contract already exists for this proposal",
        existingContractId: existingContract._id
      });
    }
    console.log("✅ No existing contract found");

    // Step 4: Check if proposal exists
    console.log("🔍 Step 4: Validating proposal...");
    const proposal = await Proposal.findById(proposalId);
    
    if (!proposal) {
      console.log("❌ Proposal not found");
      return res.status(404).json({
        success: false,
        message: "Proposal not found",
        proposalId: proposalId
      });
    }

    // Check if proposal belongs to this project
    if (proposal.projectId.toString() !== projectId) {
      console.log("❌ Proposal doesn't belong to this project");
      return res.status(400).json({
        success: false,
        message: "Proposal doesn't belong to this project"
      });
    }
    
    // Check if freelancer matches
    if (proposal.freelancerId.toString() !== freelancerId) {
      console.log("❌ Freelancer doesn't match the proposal");
      return res.status(400).json({
        success: false,
        message: "Freelancer doesn't match the proposal"
      });
    }
    console.log("✅ Proposal validation passed");

    // Step 5: Check if project exists and belongs to this client
    console.log("🔍 Step 5: Validating project...");
    const project = await Project.findById(projectId);
    
    if (!project) {
      console.log("❌ Project not found");
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Your Project model uses 'client' field, not 'clientId'
    console.log("🔍 Project client field:", project.client);
    console.log("🔍 Project client type:", typeof project.client);
    
    // Extract client ID from project (your schema uses 'client' field)
    let projectClientId;
    
    if (project.client) {
      if (typeof project.client === 'string') {
        projectClientId = project.client;
      } else if (project.client._id) {
        projectClientId = project.client._id.toString();
      } else if (project.client.toString) {
        projectClientId = project.client.toString();
      } else {
        projectClientId = String(project.client);
      }
    }
    
    console.log("🔍 Extracted projectClientId:", projectClientId);
    console.log("🔍 Request clientId:", requestClientId);
    
    // Verify project belongs to client
    if (!projectClientId) {
      console.log("❌ Project has no client information");
      return res.status(400).json({
        success: false,
        message: "Project is missing client information"
      });
    }
    
    if (projectClientId !== requestClientId) {
      console.log("❌ Project doesn't belong to this client");
      return res.status(403).json({
        success: false,
        message: "Project doesn't belong to this client",
        details: {
          projectClientId: projectClientId,
          requestClientId: requestClientId
        }
      });
    }
    
    console.log("✅ Project validation passed - Client ownership verified");

    // Step 6: Create new contract
    console.log("🔍 Step 6: Creating contract document...");
    
    // Validate and convert dates - MUST be done before creating contract
    console.log("🔍 Converting dates...");
    console.log("  - startDate input:", startDate, "Type:", typeof startDate);
    console.log("  - deadline input:", deadline, "Type:", typeof deadline);
    
    const startDateObj = startDate ? new Date(startDate) : new Date();
    if (isNaN(startDateObj.getTime())) {
      console.log("❌ Invalid startDate:", startDate);
      return res.status(400).json({
        success: false,
        message: "Invalid start date",
        startDate: startDate
      });
    }
    
    const endDateObj = deadline ? new Date(deadline) : null;
    if (!endDateObj || isNaN(endDateObj.getTime())) {
      console.log("❌ Invalid deadline:", deadline);
      return res.status(400).json({
        success: false,
        message: "Invalid deadline date",
        deadline: deadline
      });
    }
    
    console.log("✅ Dates converted successfully:");
    console.log("  - startDateObj:", startDateObj.toISOString());
    console.log("  - endDateObj:", endDateObj.toISOString());
    
    // Validate budget/payment - MUST be a valid number
    console.log("🔍 Converting budget to payment...");
    console.log("  - budget input:", budget, "Type:", typeof budget);
    
    const paymentAmount = Number(budget);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      console.log("❌ Invalid budget:", budget, "Converted to:", paymentAmount);
      return res.status(400).json({
        success: false,
        message: "Invalid budget amount",
        budget: budget,
        converted: paymentAmount
      });
    }
    
    console.log("✅ Payment amount converted successfully:", paymentAmount);
    
    // Create contract data that matches your Contract schema
    // IMPORTANT: Use exact field names from Contract model
    const contractData = {
      projectId: projectId,
      proposalId: proposalId,
      freelancerId: freelancerId,
      clientId: clientId,
      title: title || `Contract for ${project.title}`,
      description: description || "",
      payment: paymentAmount, // MUST be 'payment', not 'budget'
      startDate: startDateObj, // Must be a Date object
      endDate: endDateObj, // MUST be 'endDate', not 'deadline', and must be a Date object
      terms: terms || "Standard contract terms",
      status: "pending",
      clientAccepted: true,
      freelancerAccepted: false,
    };

    // Final validation before creating contract
    console.log("🔍 Final contract data validation:");
    console.log("  - payment:", contractData.payment, "Type:", typeof contractData.payment, "Valid:", !isNaN(contractData.payment) && contractData.payment > 0);
    console.log("  - endDate:", contractData.endDate, "Type:", contractData.endDate instanceof Date, "Valid:", contractData.endDate instanceof Date && !isNaN(contractData.endDate.getTime()));
    console.log("  - startDate:", contractData.startDate, "Type:", contractData.startDate instanceof Date);
    
    if (!contractData.payment || isNaN(contractData.payment) || contractData.payment <= 0) {
      console.log("❌ Payment validation failed:", contractData.payment);
      return res.status(400).json({
        success: false,
        message: "Payment amount is required and must be a valid positive number",
        payment: contractData.payment
      });
    }

    if (!contractData.endDate || !(contractData.endDate instanceof Date) || isNaN(contractData.endDate.getTime())) {
      console.log("❌ End date validation failed:", contractData.endDate);
      return res.status(400).json({
        success: false,
        message: "End date is required and must be a valid Date object",
        endDate: contractData.endDate,
        endDateType: typeof contractData.endDate
      });
    }

    // Create and save contract
    console.log("📝 Creating Contract instance...");
    console.log("📝 contractData being passed:", {
      payment: contractData.payment,
      paymentType: typeof contractData.payment,
      endDate: contractData.endDate,
      endDateType: typeof contractData.endDate,
      endDateInstance: contractData.endDate instanceof Date
    });
    
    let contract; // Declare outside try block for scope
    try {
      // Create contract instance
      contract = new Contract();
      
      // Set fields explicitly to ensure they're recognized by Mongoose
      contract.projectId = contractData.projectId;
      contract.proposalId = contractData.proposalId;
      contract.freelancerId = contractData.freelancerId;
      contract.clientId = contractData.clientId;
      contract.title = contractData.title;
      contract.description = contractData.description;
      contract.payment = contractData.payment; // Set explicitly
      contract.startDate = contractData.startDate;
      contract.endDate = contractData.endDate; // Set explicitly
      contract.terms = contractData.terms;
      contract.status = contractData.status;
      contract.clientAccepted = contractData.clientAccepted;
      contract.freelancerAccepted = contractData.freelancerAccepted;
      
      // Log the contract instance to see what values it has
      console.log("📝 Contract instance after setting values:");
      console.log("  - contract.payment:", contract.payment, "Type:", typeof contract.payment);
      console.log("  - contract.endDate:", contract.endDate, "Type:", typeof contract.endDate, "Instance of Date:", contract.endDate instanceof Date);
      console.log("  - contract.startDate:", contract.startDate, "Type:", typeof contract.startDate);
      
      // Verify values are set
      if (contract.payment === undefined || contract.payment === null || isNaN(contract.payment)) {
        console.error("❌ contract.payment is not set correctly!");
        console.error("  - contractData.payment:", contractData.payment);
        console.error("  - contract.payment:", contract.payment);
        return res.status(400).json({
          success: false,
          message: "Payment is not set on contract instance",
          contractDataPayment: contractData.payment,
          contractPayment: contract.payment
        });
      }
      
      if (contract.endDate === undefined || contract.endDate === null || !(contract.endDate instanceof Date)) {
        console.error("❌ contract.endDate is not set correctly!");
        console.error("  - contractData.endDate:", contractData.endDate);
        console.error("  - contract.endDate:", contract.endDate);
        return res.status(400).json({
          success: false,
          message: "End date is not set on contract instance",
          contractDataEndDate: contractData.endDate,
          contractEndDate: contract.endDate
        });
      }
      
      console.log("📝 Contract instance created, validating...");
      
      // Manually validate before save
      const validationError = contract.validateSync();
      if (validationError) {
        console.error("❌ Contract validation error:", validationError);
        const errors = {};
        Object.keys(validationError.errors).forEach(key => {
          errors[key] = validationError.errors[key].message;
        });
        return res.status(400).json({
          success: false,
          message: "Contract validation failed",
          error: validationError.message,
          validationErrors: errors,
          contractValues: {
            payment: contract.payment,
            endDate: contract.endDate,
            startDate: contract.startDate
          }
        });
      }
      
      console.log("✅ Contract validation passed, saving...");
      await contract.save();
      console.log("✅ Contract saved successfully:", contract._id);
    } catch (saveError) {
      console.error("❌ Contract save error:", saveError);
      console.error("❌ Error name:", saveError.name);
      console.error("❌ Error message:", saveError.message);
      console.error("❌ Error stack:", saveError.stack);
      if (saveError.name === 'ValidationError') {
        const errors = {};
        if (saveError.errors) {
          Object.keys(saveError.errors).forEach(key => {
            errors[key] = saveError.errors[key].message;
          });
        }
        return res.status(400).json({
          success: false,
          message: "Contract validation failed",
          error: saveError.message,
          validationErrors: errors
        });
      }
      // Return 500 error with details instead of throwing
      return res.status(500).json({
        success: false,
        message: "Server error while saving contract",
        error: saveError.message,
        errorName: saveError.name
      });
    }
    
    if (!contract || !contract._id) {
      console.error("❌ Contract was not created successfully");
      return res.status(500).json({
        success: false,
        message: "Contract was not created successfully"
      });
    }
    
    console.log("✅ Contract saved to database:", contract._id);

    // Step 7: Update proposal status
    console.log("🔍 Step 7: Updating proposal status...");
    try {
      proposal.status = "accepted";
      proposal.contractId = contract._id;
      await proposal.save();
      console.log("✅ Proposal status updated to accepted");
    } catch (proposalError) {
      console.error("❌ Error updating proposal:", proposalError);
      // Continue even if proposal update fails - contract is already created
    }

    // Step 8: Update project status - Match your Project schema
    console.log("🔍 Step 8: Updating project status...");
    try {
      // Your Project model uses 'assignedFreelancer' field, not 'freelancerId'
      project.status = "in_progress";
      project.assignedFreelancer = freelancerId; // Use your schema's field name
      
      // Add contractId if your Project model has it
      if (project.schema && project.schema.paths && project.schema.paths.contractId) {
        project.contractId = contract._id;
      }
      
      await project.save();
      console.log("✅ Project updated to in_progress with assignedFreelancer");
    } catch (projectError) {
      console.error("❌ Error updating project:", projectError);
      // Continue even if project update fails - contract is already created
    }

    // Step 9: Create notifications
    console.log("🔍 Step 9: Creating notifications...");
    try {
      // Get freelancer name for notification
      let freelancerName = "the freelancer";
      try {
        const freelancer = await User.findById(freelancerId, "name");
        if (freelancer) {
          freelancerName = freelancer.name;
        }
      } catch (err) {
        console.warn("⚠️ Could not fetch freelancer name:", err.message);
      }
      
      // Notification for freelancer
      const freelancerNotification = new Notification({
        user: freelancerId,
        type: "contract",
        title: "New Contract Offer",
        message: `You have received a contract offer for "${title}" from ${req.user.name}`,
        relatedId: contract._id,
        isRead: false
      });
      await freelancerNotification.save();
      console.log("✅ Notification created for freelancer");

      // Notification for client
      const clientNotification = new Notification({
        user: clientId,
        type: "contract",
        title: "Contract Created",
        message: `You have created a contract for "${title}" with ${freelancerName}`,
        relatedId: contract._id,
        isRead: true
      });
      await clientNotification.save();
      console.log("✅ Notification created for client");
    } catch (notifError) {
      console.warn("⚠️ Could not create notifications:", notifError.message);
    }

    // Step 10: Return the created contract
    console.log("🔍 Step 10: Fetching created contract...");
    let createdContract;
    try {
      createdContract = await Contract.findById(contract._id)
        .populate("clientId", "name email avatar")
        .populate("freelancerId", "name email avatar")
        .populate("projectId", "title");
      
      if (!createdContract) {
        // If populate fails, just return the contract we created
        createdContract = contract;
      }
    } catch (fetchError) {
      console.warn("⚠️ Could not fetch populated contract, using created contract:", fetchError.message);
      createdContract = contract;
    }

    console.log("🎉 ===== CONTRACT CREATION COMPLETE =====");
    console.log("✅ Contract ID:", createdContract._id);
    console.log("✅ Contract Status:", createdContract.status);

    res.status(201).json({
      success: true,
      message: "Contract created successfully",
      contract: createdContract
    });
  } catch (error) {
    console.error("❌ ===== CONTRACT CREATION ERROR =====");
    console.error("Error:", error.message);
    console.error("Stack trace:", error.stack);
    
    // Check for MongoDB specific errors
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
        validationErrors: error.errors
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      console.error("MongoDB error code:", error.code);
      return res.status(500).json({
        success: false,
        message: "Database error",
        error: error.message,
        code: error.code
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Server error while creating contract",
      error: error.message
    });
  }
});

// @desc    Get all contracts for the logged-in user
// @route   GET /api/contracts/my
// @access  Private
export const getMyContracts = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    console.log(`📋 Fetching contracts for user ${userId} (${userRole})`);

    let query = {};
    
    if (userRole === 'client') {
      query.clientId = userId;
    } else if (userRole === 'freelancer') {
      query.freelancerId = userId;
    } else {
      // Admin or other roles can see all
      query = {
        $or: [
          { clientId: userId },
          { freelancerId: userId }
        ]
      };
    }

    const contracts = await Contract.find(query)
      .populate("clientId", "name email avatar")
      .populate("freelancerId", "name email avatar")
      .populate("projectId", "title category")
      .populate("proposalId", "bidAmount estimatedTime")
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${contracts.length} contracts`);

    res.json({
      success: true,
      count: contracts.length,
      contracts: contracts,
    });
  } catch (error) {
    console.error("❌ Error getting contracts:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching contracts",
      error: error.message,
    });
  }
});

// @desc    Get all contracts (admin)
// @route   GET /api/contracts
// @access  Private/Admin
export const getAllContracts = asyncHandler(async (req, res) => {
  const contracts = await Contract.find({})
    .populate("clientId", "name email")
    .populate("freelancerId", "name email")
    .populate("projectId", "title")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: contracts.length,
    contracts: contracts,
  });
});

// @desc    Get single contract
// @route   GET /api/contracts/:id
// @access  Private
export const getContractById = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id)
    .populate("clientId", "name email avatar")
    .populate("freelancerId", "name email avatar")
    .populate("projectId", "title description category")
    .populate("proposalId", "bidAmount estimatedTime coverLetter");

  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  // Check authorization
  const isClient = contract.clientId._id.toString() === req.user._id.toString();
  const isFreelancer = contract.freelancerId._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isClient && !isFreelancer && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to view this contract");
  }

  res.json({
    success: true,
    contract: contract,
  });
});

// @desc    Update contract
// @route   PUT /api/contracts/:id
// @access  Private
export const updateContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  // Check authorization - only client or admin can update
  const isClient = contract.clientId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isClient && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to update this contract");
  }

  const updatedContract = await Contract.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  )
    .populate("clientId", "name email")
    .populate("freelancerId", "name email");

  res.json({
    success: true,
    message: "Contract updated successfully",
    contract: updatedContract,
  });
});

// @desc    Update contract status
// @route   PATCH /api/contracts/:id/status
// @access  Private
export const updateContractStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  // Check authorization
  const isClient = contract.clientId.toString() === req.user._id.toString();
  const isFreelancer = contract.freelancerId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isClient && !isFreelancer && !isAdmin) {
    res.status(403);
    throw new Error("Not authorized to update this contract");
  }

  // Validate status transition
  const validStatuses = ["pending", "active", "completed", "cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }

  contract.status = status;
  await contract.save();

  res.json({
    success: true,
    message: "Contract status updated successfully",
    contract: contract,
  });
});

// @desc    Freelancer accept contract
// @route   POST /api/contracts/:id/accept
// @access  Private
export const acceptContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  // Check if user is the freelancer
  if (contract.freelancerId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Only the freelancer can accept this contract");
  }

  if (contract.status !== "pending") {
    res.status(400);
    throw new Error("Only pending contracts can be accepted");
  }

  // Mark freelancer as accepted
  contract.freelancerAccepted = true;
  
  // Only activate contract when BOTH parties have accepted
  if (contract.clientAccepted && contract.freelancerAccepted) {
    contract.status = "active";
  }
  
  await contract.save();

  // Create notification for client
  try {
    const notification = new Notification({
      user: contract.clientId,
      type: "contract",
      title: contract.status === "active" 
        ? "Contract Finalized - Both Parties Accepted" 
        : "Contract Partially Accepted",
      message: contract.status === "active"
        ? `${req.user.name} has accepted your contract for "${contract.title}". The contract is now active!`
        : `${req.user.name} has accepted your contract for "${contract.title}". Waiting for your acceptance.`,
      relatedId: contract._id,
    });
    await notification.save();
  } catch (notifError) {
    console.warn("Could not create notification:", notifError.message);
  }

  res.json({
    success: true,
    message: contract.status === "active" 
      ? "Contract accepted and finalized successfully" 
      : "Contract accepted. Waiting for client acceptance.",
    contract: contract,
  });
});

// @desc    Delete contract
// @route   DELETE /api/contracts/:id
// @access  Private/Admin
export const deleteContract = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  await contract.deleteOne();

  res.json({
    success: true,
    message: "Contract removed successfully",
  });
});

// @desc    Get chat for specific contract
// @route   GET /api/contracts/:id/chat
// @access  Private
export const getContractChat = asyncHandler(async (req, res) => {
  const contract = await Contract.findById(req.params.id);

  if (!contract) {
    res.status(404);
    throw new Error("Contract not found");
  }

  // Check if user is part of this contract
  const isClient = contract.clientId.toString() === req.user._id.toString();
  const isFreelancer = contract.freelancerId.toString() === req.user._id.toString();

  if (!isClient && !isFreelancer) {
    res.status(403);
    throw new Error("Not authorized to access this chat");
  }

  res.json({
    success: true,
    message: "Chat endpoint",
    contractId: contract._id,
    participants: [
      {
        userId: contract.clientId,
        role: "client"
      },
      {
        userId: contract.freelancerId,
        role: "freelancer"
      }
    ],
    canChat: contract.status === "active",
  });
});