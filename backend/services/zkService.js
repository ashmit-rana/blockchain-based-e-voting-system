const crypto = require("crypto");
const { ethers } = require("ethers");

// Generates a ZK commitment and nullifier for a voter.
// In production this uses snarkjs with a real circuit.
// For our system the backend handles proof generation
// and records the hash on-chain via ZKVerifier.sol.

const generateZKCommitment = (walletAddress, aadhaarHash) => {
  const secret = crypto.randomBytes(32).toString("hex");
  const commitment = "0x" + crypto
    .createHash("sha256")
    .update(walletAddress + aadhaarHash + secret)
    .digest("hex");
  return { commitment, secret };
};

const generateNullifier = (walletAddress, electionId, secret) => {
  const nullifier = "0x" + crypto
    .createHash("sha256")
    .update(walletAddress + electionId.toString() + secret)
    .digest("hex");
  return nullifier;
};

const generateProofHash = (walletAddress, electionId, nullifier) => {
  return ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ["address", "uint256", "bytes32"],
      [walletAddress, electionId, nullifier]
    )
  );
};

module.exports = {
  generateZKCommitment,
  generateNullifier,
  generateProofHash,
};