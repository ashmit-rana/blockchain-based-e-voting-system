const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const Voter = require("../models/Voter");
const { sendAadhaarOTP, verifyAadhaarOTP, hashAadhaar } = require("../services/aadhaarService");
const { generateZKCommitment } = require("../services/zkService");
const { registerVoterOnChain, verifyVoterOnChain } = require("../services/blockchainService");

// ── Send Aadhaar OTP ───────────────────────────────────
const sendOTP = async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;
    if (!aadhaarNumber) {
      return res.status(400).json({ message: "Aadhaar number required" });
    }
    const result = await sendAadhaarOTP(aadhaarNumber);
    res.json({ success: true, txnId: result.txnId, message: result.message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Verify OTP & Register Voter ────────────────────────
const verifyOTPAndRegister = async (req, res) => {
  try {
    const {
      txnId, otp, aadhaarNumber,
      walletAddress, name, email, phone, electionType
    } = req.body;

    if (!txnId || !otp || !aadhaarNumber || !walletAddress || !name || !email || !phone || !electionType) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Verify OTP
    const aadhaarResult = await verifyAadhaarOTP(txnId, otp, aadhaarNumber);
    if (!aadhaarResult.verified) {
      return res.status(400).json({ message: "OTP verification failed" });
    }

    const aadhaarHash = aadhaarResult.aadhaarHash;

    // Check if already registered
    const existingVoter = await Voter.findOne({
      $or: [
        { walletAddress: walletAddress.toLowerCase() },
        { aadhaarHash }
      ]
    });

    if (existingVoter) {
      return res.status(400).json({ message: "Voter already registered" });
    }

    // Generate ZK commitment
    const { commitment, secret } = generateZKCommitment(walletAddress, aadhaarHash);
    const zkCommitment = commitment;

    // Register on blockchain
    await registerVoterOnChain(
      walletAddress,
      aadhaarHash,
      zkCommitment,
      electionType
    );

    // Verify on blockchain
    await verifyVoterOnChain(walletAddress);

    // Save to MongoDB
    const voter = await Voter.create({
      walletAddress: walletAddress.toLowerCase(),
      aadhaarHash,
      name,
      email,
      phone,
      isVerified: true,
      zkCommitment,
      electionType,
    });

    // Generate JWT
    const token = jwt.sign(
      { walletAddress: walletAddress.toLowerCase(), role: "voter" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      message: "Voter registered and verified successfully",
      token,
      voter: {
        walletAddress: voter.walletAddress,
        name: voter.name,
        isVerified: voter.isVerified,
        electionType: voter.electionType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Login (wallet based) ───────────────────────────────
const loginVoter = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ message: "Wallet address required" });
    }

    const voter = await Voter.findOne({
      walletAddress: walletAddress.toLowerCase()
    });

    if (!voter) {
      return res.status(404).json({ message: "Voter not found. Please register first." });
    }

    if (!voter.isVerified) {
      return res.status(403).json({ message: "Voter not verified" });
    }

    const token = jwt.sign(
      { walletAddress: walletAddress.toLowerCase(), role: "voter" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      success: true,
      token,
      voter: {
        walletAddress: voter.walletAddress,
        name: voter.name,
        isVerified: voter.isVerified,
        electionType: voter.electionType,
        votedElections: voter.votedElections,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get Voter Profile ──────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const voter = await Voter.findOne({
      walletAddress: req.user.walletAddress
    }).select("-aadhaarHash -zkCommitment");

    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }

    res.json({ success: true, voter });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { sendOTP, verifyOTPAndRegister, loginVoter, getProfile };