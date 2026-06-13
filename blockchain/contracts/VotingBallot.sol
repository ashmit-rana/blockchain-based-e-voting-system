// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./ElectionManager.sol";
import "./VoterRegistry.sol";

contract VotingBallot is Ownable, ReentrancyGuard {

    // ── State Variables ────────────────────────────────────
    ElectionManager public electionManager;
    VoterRegistry public voterRegistry;

    // electionId => voterAddress => has voted
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    // electionId => voterAddress => nullifier (ZK)
    mapping(uint256 => mapping(bytes32 => bool)) public nullifierUsed;

    uint256 public totalVotesCast;

    // ── Events ─────────────────────────────────────────────
    event VoteCast(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        bytes32 nullifier,
        uint256 timestamp
    );

    // ── Modifiers ──────────────────────────────────────────
    modifier onlyVerifiedVoter() {
        require(
            voterRegistry.isVerifiedVoter(msg.sender),
            "Not a verified voter"
        );
        _;
    }

    modifier hasNotVoted(uint256 _electionId) {
        require(
            !hasVoted[_electionId][msg.sender],
            "Already voted in this election"
        );
        _;
    }

    // ── Constructor ────────────────────────────────────────
    constructor(
        address _electionManager,
        address _voterRegistry
    ) Ownable(msg.sender) {
        electionManager = ElectionManager(_electionManager);
        voterRegistry = VoterRegistry(_voterRegistry);
    }

    // ── Cast Vote ──────────────────────────────────────────
    function castVote(
        uint256 _electionId,
        uint256 _candidateId,
        bytes32 _nullifier
    )
        external
        nonReentrant
        onlyVerifiedVoter
        hasNotVoted(_electionId)
    {
        // Prevent ZK nullifier reuse (anonymity protection)
        require(
            !nullifierUsed[_electionId][_nullifier],
            "Nullifier already used"
        );

        // Verify election is active
        require(
            electionManager.isElectionActive(_electionId),
            "Election is not active"
        );

        // Record vote
        hasVoted[_electionId][msg.sender] = true;
        nullifierUsed[_electionId][_nullifier] = true;
        totalVotesCast++;

        // Update count in ElectionManager
        electionManager.incrementVoteCount(_electionId, _candidateId);

        emit VoteCast(
            _electionId,
            _candidateId,
            _nullifier,
            block.timestamp
        );
    }

    // ── View Functions ─────────────────────────────────────
    function hasVoterVoted(uint256 _electionId, address _voter)
        external
        view
        returns (bool)
    {
        return hasVoted[_electionId][_voter];
    }

    function isNullifierUsed(uint256 _electionId, bytes32 _nullifier)
        external
        view
        returns (bool)
    {
        return nullifierUsed[_electionId][_nullifier];
    }

    // ── Update Contract References ─────────────────────────
    function updateElectionManager(address _electionManager)
        external
        onlyOwner
    {
        electionManager = ElectionManager(_electionManager);
    }

    function updateVoterRegistry(address _voterRegistry)
        external
        onlyOwner
    {
        voterRegistry = VoterRegistry(_voterRegistry);
    }
}