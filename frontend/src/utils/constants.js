export const API_URL = "http://localhost:5001/api";

export const CONTRACT_ADDRESSES = {
  ElectionManager: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  VoterRegistry: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  VotingBallot: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
  ZKVerifier: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
  ResultTally: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
};

export const ELECTION_TYPES = ["GENERAL", "UNIVERSITY", "CORPORATE"];

export const ELECTION_STATUS = {
  0: "CREATED",
  1: "ACTIVE",
  2: "PAUSED",
  3: "CLOSED",
  4: "TALLIED",
};