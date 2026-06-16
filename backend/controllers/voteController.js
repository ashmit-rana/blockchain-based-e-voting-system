const Voter = require("../models/Voter");
const Election = require("../models/Election");
const { generateNullifier, generateProofHash } = require("../services/zkService");
const { hasVoterVoted, recordZKProof, getResult } = require("../services/blockchainService");
const { ethers } = require("ethers");

// ── Cast Vote ──────────────────────────────────────────
const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;
    const walletAddress = req.user.walletAddress;

    if (!electionId || !candidateId) {
      return res.status(400).json({ message: "Election ID and candidate ID required" });
    }

    // Check election exists and is active
    const election = await Election.findOne({ electionId: Number(electionId) });
    if (!election) return res.status(404).json({ message: "Election not found" });
    if (election.status !== "ACTIVE") {
      return res.status(400).json({ message: "Election is not active" });
    }

    // Check voter hasn't already voted
    const alreadyVoted = await hasVoterVoted(Number(electionId), walletAddress);
    if (alreadyVoted) {
      return res.status(400).json({ message: "You have already voted in this election" });
    }

    // Get voter secret for nullifier
    const voter = await Voter.findOne({ walletAddress });
    if (!voter) return res.status(404).json({ message: "Voter not found" });

    // Generate ZK nullifier and proof hash
    const secret = voter.zkCommitment;
    const nullifier = generateNullifier(walletAddress, electionId, secret);
    const proofHash = generateProofHash(walletAddress, electionId, nullifier);

    const nullifierBytes32 = ethers.zeroPadValue(
      ethers.toBeHex(BigInt(nullifier)),
      32
    );
    const proofHashBytes32 = ethers.zeroPadValue(
      ethers.toBeHex(BigInt(proofHash)),
      32
    );

    // Record ZK proof on-chain
    await recordZKProof(walletAddress, proofHashBytes32, nullifierBytes32);

    // Update MongoDB
    await Election.findOneAndUpdate(
      { electionId: Number(electionId), "candidates.candidateId": Number(candidateId) },
      { $inc: { "candidates.$.voteCount": 1, totalVotes: 1 } }
    );

    await Voter.findOneAndUpdate(
      { walletAddress },
      { $push: { votedElections: Number(electionId) } }
    );

    res.json({
      success: true,
      message: "Vote cast successfully",
      nullifier: nullifierBytes32,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Get Results ────────────────────────────────────────
const getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findOne({ electionId: Number(electionId) });
    if (!election) return res.status(404).json({ message: "Election not found" });

    res.json({
      success: true,
      election: {
        electionId: election.electionId,
        title: election.title,
        status: election.status,
        totalVotes: election.totalVotes,
        candidates: election.candidates,
        winnerId: election.winnerId,
        winnerName: election.winnerName,
        isTied: election.isTied,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Check if voted ─────────────────────────────────────
const checkVoteStatus = async (req, res) => {
  try {
    const { electionId } = req.params;
    const walletAddress = req.user.walletAddress;
    const hasVoted = await hasVoterVoted(Number(electionId), walletAddress);
    res.json({ success: true, hasVoted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { castVote, getElectionResults, checkVoteStatus };