const { ethers } = require("ethers");
const path = require("path");
const fs = require("fs");

const electionManagerABI = require(path.join(__dirname, "../../blockchain/artifacts/contracts/ElectionManager.sol/ElectionManager.json")).abi;
const voterRegistryABI = require(path.join(__dirname, "../../blockchain/artifacts/contracts/VoterRegistry.sol/VoterRegistry.json")).abi;
const votingBallotABI = require(path.join(__dirname, "../../blockchain/artifacts/contracts/VotingBallot.sol/VotingBallot.json")).abi;
const zkVerifierABI = require(path.join(__dirname, "../../blockchain/artifacts/contracts/ZKVerifier.sol/ZKVerifier.json")).abi;
const resultTallyABI = require(path.join(__dirname, "../../blockchain/artifacts/contracts/ResultTally.sol/ResultTally.json")).abi;

const getProvider = () => new ethers.JsonRpcProvider(process.env.RPC_URL);
const getSigner = () => new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, getProvider());

const getElectionManager = () => new ethers.Contract(process.env.ELECTION_MANAGER_ADDRESS, electionManagerABI, getSigner());
const getVoterRegistry = () => new ethers.Contract(process.env.VOTER_REGISTRY_ADDRESS, voterRegistryABI, getSigner());
const getVotingBallot = () => new ethers.Contract(process.env.VOTING_BALLOT_ADDRESS, votingBallotABI, getSigner());
const getZkVerifier = () => new ethers.Contract(process.env.ZK_VERIFIER_ADDRESS, zkVerifierABI, getSigner());
const getResultTally = () => new ethers.Contract(process.env.RESULT_TALLY_ADDRESS, resultTallyABI, getSigner());

const createElection = async (title, description, ipfsHash, electionType, startTime, endTime) => {
  const typeMap = { GENERAL: 0, UNIVERSITY: 1, CORPORATE: 2 };
  const contract = getElectionManager();
  const tx = await contract.createElection(
    title, description, ipfsHash, typeMap[electionType],
    Math.floor(new Date(startTime).getTime() / 1000),
    Math.floor(new Date(endTime).getTime() / 1000)
  );
  await tx.wait();
  const totalElections = await contract.getTotalElections();
  return Number(totalElections);
};

const addCandidate = async (electionId, name, party, ipfsImageHash) => {
  const tx = await getElectionManager().addCandidate(electionId, name, party, ipfsImageHash);
  await tx.wait();
  return true;
};

const activateElection = async (electionId) => {
  const tx = await getElectionManager().activateElection(electionId);
  await tx.wait();
  return true;
};

const closeElection = async (electionId) => {
  const tx = await getElectionManager().closeElection(electionId);
  await tx.wait();
  return true;
};

const getElection = async (electionId) => {
  return await getElectionManager().getElection(electionId);
};

const getAllCandidates = async (electionId) => {
  return await getElectionManager().getAllCandidates(electionId);
};

const isElectionActive = async (electionId) => {
  return await getElectionManager().isElectionActive(electionId);
};

const registerVoterOnChain = async (walletAddress, aadhaarHash, zkCommitment, electionType) => {
  const tx = await getVoterRegistry().registerVoter(walletAddress, aadhaarHash, zkCommitment, electionType);
  await tx.wait();
  return true;
};

const verifyVoterOnChain = async (walletAddress) => {
  const tx = await getVoterRegistry().verifyVoter(walletAddress);
  await tx.wait();
  return true;
};

const isVerifiedVoter = async (walletAddress) => {
  return await getVoterRegistry().isVerifiedVoter(walletAddress);
};

const hasVoterVoted = async (electionId, walletAddress) => {
  return await getVotingBallot().hasVoterVoted(electionId, walletAddress);
};

const recordZKProof = async (voter, proofHash, nullifier) => {
  const tx = await getZkVerifier().verifyAndRecordProof(voter, proofHash, nullifier);
  await tx.wait();
  return true;
};

const publishResult = async (electionId, candidateIds, voteCounts, totalVotes, winnerId, winnerName, isTied) => {
  const tx = await getResultTally().publishResult(electionId, candidateIds, voteCounts, totalVotes, winnerId, winnerName, isTied);
  await tx.wait();
  return true;
};

const getResult = async (electionId) => {
  return await getResultTally().getResult(electionId);
};

module.exports = {
  createElection, addCandidate, activateElection,
  closeElection, getElection, getAllCandidates, isElectionActive,
  registerVoterOnChain, verifyVoterOnChain, isVerifiedVoter,
  hasVoterVoted, recordZKProof, publishResult, getResult,
};