const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

// ── Load ABIs ──────────────────────────────────────────
const electionManagerABI = require(path.join(
  __dirname, "../../blockchain/artifacts/contracts/ElectionManager.sol/ElectionManager.json"
)).abi;

const voterRegistryABI = require(path.join(
  __dirname, "../../blockchain/artifacts/contracts/VoterRegistry.sol/VoterRegistry.json"
)).abi;

const votingBallotABI = require(path.join(
  __dirname, "../../blockchain/artifacts/contracts/VotingBallot.sol/VotingBallot.json"
)).abi;

const zkVerifierABI = require(path.join(
  __dirname, "../../blockchain/artifacts/contracts/ZKVerifier.sol/ZKVerifier.json"
)).abi;

const resultTallyABI = require(path.join(
  __dirname, "../../blockchain/artifacts/contracts/ResultTally.sol/ResultTally.json"
)).abi;

// ── Provider & Signer ──────────────────────────────────
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const signer = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

// ── Contract Instances ─────────────────────────────────
const electionManager = new ethers.Contract(
  process.env.ELECTION_MANAGER_ADDRESS,
  electionManagerABI,
  signer
);

const voterRegistry = new ethers.Contract(
  process.env.VOTER_REGISTRY_ADDRESS,
  voterRegistryABI,
  signer
);

const votingBallot = new ethers.Contract(
  process.env.VOTING_BALLOT_ADDRESS,
  votingBallotABI,
  signer
);

const zkVerifier = new ethers.Contract(
  process.env.ZK_VERIFIER_ADDRESS,
  zkVerifierABI,
  signer
);

const resultTally = new ethers.Contract(
  process.env.RESULT_TALLY_ADDRESS,
  resultTallyABI,
  signer
);

// ── Election Functions ─────────────────────────────────
const createElection = async (
  title, description, ipfsHash, electionType, startTime, endTime
) => {
  const typeMap = { GENERAL: 0, UNIVERSITY: 1, CORPORATE: 2 };
  const tx = await electionManager.createElection(
    title, description, ipfsHash,
    typeMap[electionType],
    Math.floor(new Date(startTime).getTime() / 1000),
    Math.floor(new Date(endTime).getTime() / 1000)
  );
  const receipt = await tx.wait();
  const event = receipt.logs.find(log => {
    try { return electionManager.interface.parseLog(log).name === "ElectionCreated"; }
    catch { return false; }
  });
  const parsed = electionManager.interface.parseLog(event);
  return Number(parsed.args.electionId);
};

const addCandidate = async (electionId, name, party, ipfsImageHash) => {
  const tx = await electionManager.addCandidate(electionId, name, party, ipfsImageHash);
  await tx.wait();
  return true;
};

const activateElection = async (electionId) => {
  const tx = await electionManager.activateElection(electionId);
  await tx.wait();
  return true;
};

const closeElection = async (electionId) => {
  const tx = await electionManager.closeElection(electionId);
  await tx.wait();
  return true;
};

const getElection = async (electionId) => {
  return await electionManager.getElection(electionId);
};

const getAllCandidates = async (electionId) => {
  return await electionManager.getAllCandidates(electionId);
};

const isElectionActive = async (electionId) => {
  return await electionManager.isElectionActive(electionId);
};

// ── Voter Functions ────────────────────────────────────
const registerVoterOnChain = async (walletAddress, aadhaarHash, zkCommitment, electionType) => {
  const tx = await voterRegistry.registerVoter(
    walletAddress, aadhaarHash, zkCommitment, electionType
  );
  await tx.wait();
  return true;
};

const verifyVoterOnChain = async (walletAddress) => {
  const tx = await voterRegistry.verifyVoter(walletAddress);
  await tx.wait();
  return true;
};

const isVerifiedVoter = async (walletAddress) => {
  return await voterRegistry.isVerifiedVoter(walletAddress);
};

// ── Vote Functions ─────────────────────────────────────
const hasVoterVoted = async (electionId, walletAddress) => {
  return await votingBallot.hasVoterVoted(electionId, walletAddress);
};

// ── ZK Functions ───────────────────────────────────────
const recordZKProof = async (voter, proofHash, nullifier) => {
  const tx = await zkVerifier.verifyAndRecordProof(voter, proofHash, nullifier);
  await tx.wait();
  return true;
};

// ── Result Functions ───────────────────────────────────
const publishResult = async (
  electionId, candidateIds, voteCounts,
  totalVotes, winnerId, winnerName, isTied
) => {
  const tx = await resultTally.publishResult(
    electionId, candidateIds, voteCounts,
    totalVotes, winnerId, winnerName, isTied
  );
  await tx.wait();
  return true;
};

const getResult = async (electionId) => {
  return await resultTally.getResult(electionId);
};

module.exports = {
  createElection, addCandidate, activateElection,
  closeElection, getElection, getAllCandidates, isElectionActive,
  registerVoterOnChain, verifyVoterOnChain, isVerifiedVoter,
  hasVoterVoted, recordZKProof, publishResult, getResult,
  provider, signer
};