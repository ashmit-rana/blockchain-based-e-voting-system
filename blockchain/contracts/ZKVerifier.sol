// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract ZKVerifier is Ownable {

    // ── State Variables ────────────────────────────────────
    // Stores verified proof hashes to prevent reuse
    mapping(bytes32 => bool) public verifiedProofs;
    mapping(address => bool) public authorisedCallers;

    // ── Events ─────────────────────────────────────────────
    event ProofVerified(
        bytes32 indexed proofHash,
        address indexed voter,
        uint256 timestamp
    );
    event ProofRejected(
        bytes32 indexed proofHash,
        address indexed voter,
        string reason
    );

    // ── Modifiers ──────────────────────────────────────────
    modifier onlyAuthorisedCaller() {
        require(
            authorisedCallers[msg.sender] || msg.sender == owner(),
            "Not authorised"
        );
        _;
    }

    // ── Constructor ────────────────────────────────────────
    constructor() Ownable(msg.sender) {}

    // ── Authorisation ──────────────────────────────────────
    function authoriseCaller(address _caller) external onlyOwner {
        authorisedCallers[_caller] = true;
    }

    function revokeCaller(address _caller) external onlyOwner {
        authorisedCallers[_caller] = false;
    }

    // ── Proof Verification ─────────────────────────────────
    // In production this would verify a full Groth16 ZK proof.
    // For our system the backend verifies the proof via snarkjs
    // and submits the proof hash on-chain for immutable recording.
    function verifyAndRecordProof(
        address _voter,
        bytes32 _proofHash,
        bytes32 _nullifier
    ) external onlyAuthorisedCaller returns (bool) {
        require(_voter != address(0), "Invalid voter address");
        require(_proofHash != bytes32(0), "Invalid proof hash");
        require(
            !verifiedProofs[_proofHash],
            "Proof already used"
        );

        verifiedProofs[_proofHash] = true;

        emit ProofVerified(_proofHash, _voter, block.timestamp);
        return true;
    }

    // ── Nullifier Check ────────────────────────────────────
    function isProofUsed(bytes32 _proofHash)
        external
        view
        returns (bool)
    {
        return verifiedProofs[_proofHash];
    }

    // ── Generate proof hash (helper) ───────────────────────
    function generateProofHash(
        address _voter,
        uint256 _electionId,
        bytes32 _nullifier
    ) external pure returns (bytes32) {
        return keccak256(abi.encodePacked(_voter, _electionId, _nullifier));
    }
}