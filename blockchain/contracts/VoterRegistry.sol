// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract VoterRegistry is Ownable, ReentrancyGuard {

    // ── Structs ────────────────────────────────────────────
    struct Voter {
        address walletAddress;
        bytes32 aadhaarHash;        // hashed Aadhaar, never stored raw
        bytes32 zkCommitment;       // ZK proof commitment
        bool isVerified;
        bool isRegistered;
        uint256 registeredAt;
        string electionType;        // GENERAL, UNIVERSITY, CORPORATE
    }

    // ── State Variables ────────────────────────────────────
    mapping(address => Voter) public voters;
    mapping(bytes32 => bool) public aadhaarHashUsed;   // prevent duplicate Aadhaar
    mapping(bytes32 => bool) public zkCommitmentUsed;  // prevent duplicate ZK commitment
    mapping(address => bool) public authorisedCallers; // VotingBallot contract

    uint256 public totalRegistered;
    uint256 public totalVerified;

    // ── Events ─────────────────────────────────────────────
    event VoterRegistered(
        address indexed walletAddress,
        bytes32 zkCommitment,
        uint256 timestamp
    );
    event VoterVerified(
        address indexed walletAddress,
        uint256 timestamp
    );
    event VoterRevoked(
        address indexed walletAddress,
        uint256 timestamp
    );

    // ── Modifiers ──────────────────────────────────────────
    modifier onlyAuthorisedCaller() {
        require(
            authorisedCallers[msg.sender] || msg.sender == owner(),
            "Not authorised"
        );
        _;
    }

    modifier voterExists(address _voter) {
        require(voters[_voter].isRegistered, "Voter not registered");
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

    // ── Registration ───────────────────────────────────────
    function registerVoter(
        address _walletAddress,
        bytes32 _aadhaarHash,
        bytes32 _zkCommitment,
        string memory _electionType
    ) external onlyAuthorisedCaller nonReentrant {
        require(_walletAddress != address(0), "Invalid address");
        require(!voters[_walletAddress].isRegistered, "Already registered");
        require(!aadhaarHashUsed[_aadhaarHash], "Aadhaar already used");
        require(!zkCommitmentUsed[_zkCommitment], "ZK commitment already used");

        voters[_walletAddress] = Voter({
            walletAddress: _walletAddress,
            aadhaarHash: _aadhaarHash,
            zkCommitment: _zkCommitment,
            isVerified: false,
            isRegistered: true,
            registeredAt: block.timestamp,
            electionType: _electionType
        });

        aadhaarHashUsed[_aadhaarHash] = true;
        zkCommitmentUsed[_zkCommitment] = true;
        totalRegistered++;

        emit VoterRegistered(_walletAddress, _zkCommitment, block.timestamp);
    }

    // ── Verification (called after Aadhaar OTP confirmed) ──
    function verifyVoter(address _walletAddress)
        external
        onlyAuthorisedCaller
        voterExists(_walletAddress)
    {
        require(!voters[_walletAddress].isVerified, "Already verified");
        voters[_walletAddress].isVerified = true;
        totalVerified++;
        emit VoterVerified(_walletAddress, block.timestamp);
    }

    // ── Revocation ─────────────────────────────────────────
    function revokeVoter(address _walletAddress)
        external
        onlyOwner
        voterExists(_walletAddress)
    {
        voters[_walletAddress].isVerified = false;
        emit VoterRevoked(_walletAddress, block.timestamp);
    }

    // ── View Functions ─────────────────────────────────────
    function isVerifiedVoter(address _walletAddress)
        external
        view
        returns (bool)
    {
        return voters[_walletAddress].isVerified;
    }

    function getVoter(address _walletAddress)
        external
        view
        voterExists(_walletAddress)
        returns (Voter memory)
    {
        return voters[_walletAddress];
    }

    function isAadhaarUsed(bytes32 _aadhaarHash)
        external
        view
        returns (bool)
    {
        return aadhaarHashUsed[_aadhaarHash];
    }
}