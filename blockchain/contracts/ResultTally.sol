// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ElectionManager.sol";

contract ResultTally is Ownable {

    // ── Structs ────────────────────────────────────────────
    struct TallyResult {
        uint256 electionId;
        uint256[] candidateIds;
        uint256[] voteCounts;
        uint256 totalVotes;
        uint256 winnerId;
        string winnerName;
        bool isTied;
        bool isPublished;
        uint256 publishedAt;
    }

    // ── State Variables ────────────────────────────────────
    ElectionManager public electionManager;

    mapping(uint256 => TallyResult) public results;
    mapping(uint256 => bool) public resultPublished;
    mapping(address => bool) public authorisedCallers;

    // ── Events ─────────────────────────────────────────────
    event ResultPublished(
        uint256 indexed electionId,
        uint256 winnerId,
        string winnerName,
        uint256 totalVotes,
        bool isTied,
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

    modifier resultNotPublished(uint256 _electionId) {
        require(!resultPublished[_electionId], "Result already published");
        _;
    }

    // ── Constructor ────────────────────────────────────────
    constructor(address _electionManager) Ownable(msg.sender) {
        electionManager = ElectionManager(_electionManager);
    }

    // ── Authorisation ──────────────────────────────────────
    function authoriseCaller(address _caller) external onlyOwner {
        authorisedCallers[_caller] = true;
    }

    // ── Publish Result ─────────────────────────────────────
    function publishResult(
        uint256 _electionId,
        uint256[] memory _candidateIds,
        uint256[] memory _voteCounts,
        uint256 _totalVotes,
        uint256 _winnerId,
        string memory _winnerName,
        bool _isTied
    )
        external
        onlyAuthorisedCaller
        resultNotPublished(_electionId)
    {
        require(
            _candidateIds.length == _voteCounts.length,
            "Array length mismatch"
        );
        require(_candidateIds.length > 0, "No candidates");

        // Verify election is closed
        ElectionManager.Election memory election =
            electionManager.getElection(_electionId);
        require(
            election.status == ElectionManager.ElectionStatus.CLOSED,
            "Election must be closed first"
        );

        results[_electionId] = TallyResult({
            electionId: _electionId,
            candidateIds: _candidateIds,
            voteCounts: _voteCounts,
            totalVotes: _totalVotes,
            winnerId: _winnerId,
            winnerName: _winnerName,
            isTied: _isTied,
            isPublished: true,
            publishedAt: block.timestamp
        });

        resultPublished[_electionId] = true;

        // Update election status to TALLIED
        emit ResultPublished(
            _electionId,
            _winnerId,
            _winnerName,
            _totalVotes,
            _isTied,
            block.timestamp
        );
    }

    // ── View Functions ─────────────────────────────────────
    function getResult(uint256 _electionId)
        external
        view
        returns (TallyResult memory)
    {
        require(resultPublished[_electionId], "Result not published yet");
        return results[_electionId];
    }

    function getWinner(uint256 _electionId)
        external
        view
        returns (uint256 winnerId, string memory winnerName, bool isTied)
    {
        require(resultPublished[_electionId], "Result not published yet");
        TallyResult memory r = results[_electionId];
        return (r.winnerId, r.winnerName, r.isTied);
    }

    function isResultPublished(uint256 _electionId)
        external
        view
        returns (bool)
    {
        return resultPublished[_electionId];
    }

    function updateElectionManager(address _electionManager)
        external
        onlyOwner
    {
        electionManager = ElectionManager(_electionManager);
    }
}