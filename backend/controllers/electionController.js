const jwt = require("jsonwebtoken");
const Election = require("../models/Election");
const blockchain = require("../services/blockchainService");

// ── Admin Login ────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { walletAddress, password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { walletAddress, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Create Election ────────────────────────────────────
const createElection = async (req, res) => {
  try {
    const {
      title, description, electionType,
      startTime, endTime, candidates
    } = req.body;

    if (!title || !description || !electionType || !startTime || !endTime || !candidates) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Deploy to blockchain
    const electionId = await blockchain.createElection(
      title, description, "", electionType, startTime, endTime
    );

    // Add candidates on-chain
    const candidateList = [];
    for (let i = 0; i < candidates.length; i++) {
      const c = candidates[i];
      await blockchain.addCandidate(electionId, c.name, c.party, "");
      candidateList.push({
        candidateId: i + 1,
        name: c.name,
        party: c.party,
        imageUrl: c.imageUrl || "",
        voteCount: 0,
      });
    }

    // Save to MongoDB
    const election = await Election.create({
      electionId,
      title,
      description,
      electionType,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      candidates: candidateList,
      createdBy: req.user.walletAddress,
    });

    res.status(201).json({ success: true, election });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get All Elections ──────────────────────────────────
const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().sort({ createdAt: -1 });
    res.json({ success: true, elections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get Single Election ────────────────────────────────
const getElection = async (req, res) => {
  try {
    const election = await Election.findOne({
      electionId: req.params.id
    });
    if (!election) {
      return res.status(404).json({ message: "Election not found" });
    }
    res.json({ success: true, election });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Activate Election ──────────────────────────────────
const activateElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    
    // Force time check bypass for local dev
    const election = await Election.findOne({ electionId: Number(electionId) });
    
    // Update start time to now if not reached
    if (new Date(election.startTime) > new Date()) {
      await Election.findOneAndUpdate(
        { electionId: Number(electionId) },
        { startTime: new Date() }
      );
    }

    await blockchain.activateElection(Number(electionId));
    await Election.findOneAndUpdate(
      { electionId: Number(electionId) },
      { status: "ACTIVE" }
    );
    res.json({ success: true, message: "Election activated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Close Election ─────────────────────────────────────
const closeElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    await blockchain.closeElection(Number(electionId));

    // Calculate results
    const candidates = await blockchain.getAllCandidates(Number(electionId));
    let winnerId = 0;
    let maxVotes = 0;
    let isTied = false;
    let totalVotes = 0;
    const candidateIds = [];
    const voteCounts = [];

    for (const c of candidates) {
      const votes = Number(c.voteCount);
      candidateIds.push(Number(c.id));
      voteCounts.push(votes);
      totalVotes += votes;
      if (votes > maxVotes) {
        maxVotes = votes;
        winnerId = Number(c.id);
        isTied = false;
      } else if (votes === maxVotes && votes > 0) {
        isTied = true;
      }
    }

    const winner = candidates.find(c => Number(c.id) === winnerId);
    const winnerName = winner ? winner.name : "No winner";

    // Publish result on-chain
    await blockchain.publishResult(
      Number(electionId), candidateIds, voteCounts,
      totalVotes, winnerId, winnerName, isTied
    );

    // Update MongoDB
    await Election.findOneAndUpdate(
      { electionId: Number(electionId) },
      { status: "CLOSED", winnerId, winnerName, isTied, totalVotes }
    );

    res.json({ success: true, message: "Election closed", winnerId, winnerName, isTied });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  adminLogin, createElection, getAllElections,
  getElection, activateElection, closeElection
};