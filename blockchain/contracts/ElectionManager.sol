// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract ElectionManager is Ownable, ReentrancyGuard {

    // ── Enums ──────────────────────────────────────────────
    enum ElectionType { GENERAL, UNIVERSITY, CORPORATE }
    enum ElectionStatus { CREATED, ACTIVE, PAUSED, CLOSED, TALLIED }

    // ── Structs ────────────────────────────────────────────
    struct Candidate {
        uint256 id;
        string name;
        string party;
        string ipfsImageHash;
        uint256 voteCount;
        bool exists;
    }

    struct Election {
        uint256 id;
        string title;
        string description;
        string ipfsMetadataHash;
        ElectionType electionType;
        ElectionStatus status;
        uint256 startTime;
        uint256 endTime;
        address admin;
        uint256 totalVotes;
        uint256 candidateCount;
        bool exists;
    }

    // ── State Variables ────────────────────────────────────
    uint256 private _electionCounter;

    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates;
    mapping(address => bool) public authorisedAdmins;

    // ── Events ─────────────────────────────────────────────
    event ElectionCreated(
        uint256 indexed electionId,
        string title,
        ElectionType electionType,
        address indexed admin,
        uint256 startTime,
        uint256 endTime
    );
    event ElectionStatusChanged(
        uint256 indexed electionId,
        ElectionStatus oldStatus,
        ElectionStatus newStatus
    );
    event CandidateAdded(
        uint256 indexed electionId,
        uint256 indexed candidateId,
        string name,
        string party
    );
    event AdminAuthorised(address indexed admin);
    event AdminRevoked(address indexed admin);

    // ── Modifiers ──────────────────────────────────────────
    modifier onlyAuthorisedAdmin() {
        require(
            authorisedAdmins[msg.sender] || msg.sender == owner(),
            "Not authorised admin"
        );
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(elections[_electionId].exists, "Election does not exist");
        _;
    }

    modifier onlyElectionAdmin(uint256 _electionId) {
        require(
            elections[_electionId].admin == msg.sender || msg.sender == owner(),
            "Not election admin"
        );
        _;
    }

    // ── Constructor ────────────────────────────────────────
    constructor() Ownable(msg.sender) {
        authorisedAdmins[msg.sender] = true;
    }

    // ── Admin Management ───────────────────────────────────
    function authoriseAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "Invalid address");
        authorisedAdmins[_admin] = true;
        emit AdminAuthorised(_admin);
    }

    function revokeAdmin(address _admin) external onlyOwner {
        authorisedAdmins[_admin] = false;
        emit AdminRevoked(_admin);
    }

    // ── Election Management ────────────────────────────────
    function createElection(
        string memory _title,
        string memory _description,
        string memory _ipfsMetadataHash,
        ElectionType _electionType,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAuthorisedAdmin returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_startTime > block.timestamp, "Start must be in future");
        require(_endTime > _startTime, "End must be after start");

        _electionCounter++;
        uint256 electionId = _electionCounter;

        elections[electionId] = Election({
            id: electionId,
            title: _title,
            description: _description,
            ipfsMetadataHash: _ipfsMetadataHash,
            electionType: _electionType,
            status: ElectionStatus.CREATED,
            startTime: _startTime,
            endTime: _endTime,
            admin: msg.sender,
            totalVotes: 0,
            candidateCount: 0,
            exists: true
        });

        emit ElectionCreated(
            electionId,
            _title,
            _electionType,
            msg.sender,
            _startTime,
            _endTime
        );

        return electionId;
    }

    function addCandidate(
        uint256 _electionId,
        string memory _name,
        string memory _party,
        string memory _ipfsImageHash
    )
        external
        electionExists(_electionId)
        onlyElectionAdmin(_electionId)
        returns (uint256)
    {
        Election storage election = elections[_electionId];
        require(
            election.status == ElectionStatus.CREATED,
            "Can only add candidates before election starts"
        );
        require(bytes(_name).length > 0, "Candidate name required");

        election.candidateCount++;
        uint256 candidateId = election.candidateCount;

        candidates[_electionId][candidateId] = Candidate({
            id: candidateId,
            name: _name,
            party: _party,
            ipfsImageHash: _ipfsImageHash,
            voteCount: 0,
            exists: true
        });

        emit CandidateAdded(_electionId, candidateId, _name, _party);
        return candidateId;
    }

    function activateElection(uint256 _electionId)
        external
        electionExists(_electionId)
        onlyElectionAdmin(_electionId)
    {
        Election storage election = elections[_electionId];
        require(
            election.status == ElectionStatus.CREATED,
            "Election not in CREATED state"
        );
        require(
            election.candidateCount >= 2,
            "Need at least 2 candidates"
        );

        ElectionStatus old = election.status;
        election.status = ElectionStatus.ACTIVE;
        emit ElectionStatusChanged(_electionId, old, ElectionStatus.ACTIVE);
    }

    function pauseElection(uint256 _electionId)
        external
        electionExists(_electionId)
        onlyElectionAdmin(_electionId)
    {
        Election storage election = elections[_electionId];
        require(election.status == ElectionStatus.ACTIVE, "Not active");

        ElectionStatus old = election.status;
        election.status = ElectionStatus.PAUSED;
        emit ElectionStatusChanged(_electionId, old, ElectionStatus.PAUSED);
    }

    function closeElection(uint256 _electionId)
        external
        electionExists(_electionId)
        onlyElectionAdmin(_electionId)
    {
        Election storage election = elections[_electionId];
        require(
            election.status == ElectionStatus.ACTIVE ||
            election.status == ElectionStatus.PAUSED,
            "Election not active or paused"
        );

        ElectionStatus old = election.status;
        election.status = ElectionStatus.CLOSED;
        emit ElectionStatusChanged(_electionId, old, ElectionStatus.CLOSED);
    }

    // ── Internal Vote Count Update (called by VotingBallot) ──
    function incrementVoteCount(uint256 _electionId, uint256 _candidateId)
        external
        electionExists(_electionId)
    {
        Election storage election = elections[_electionId];
        require(election.status == ElectionStatus.ACTIVE, "Election not active");
        require(
            candidates[_electionId][_candidateId].exists,
            "Candidate does not exist"
        );

        candidates[_electionId][_candidateId].voteCount++;
        election.totalVotes++;
    }

    // ── View Functions ─────────────────────────────────────
    function getElection(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (Election memory)
    {
        return elections[_electionId];
    }

    function getCandidate(uint256 _electionId, uint256 _candidateId)
        external
        view
        electionExists(_electionId)
        returns (Candidate memory)
    {
        require(
            candidates[_electionId][_candidateId].exists,
            "Candidate does not exist"
        );
        return candidates[_electionId][_candidateId];
    }

    function getAllCandidates(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (Candidate[] memory)
    {
        Election storage election = elections[_electionId];
        Candidate[] memory result = new Candidate[](election.candidateCount);
        for (uint256 i = 1; i <= election.candidateCount; i++) {
            result[i - 1] = candidates[_electionId][i];
        }
        return result;
    }

    function getTotalElections() external view returns (uint256) {
        return _electionCounter;
    }

    function isElectionActive(uint256 _electionId)
        external
        view
        returns (bool)
    {
        if (!elections[_electionId].exists) return false;
        Election storage e = elections[_electionId];
        return (
            e.status == ElectionStatus.ACTIVE &&
            block.timestamp >= e.startTime &&
            block.timestamp <= e.endTime
        );
    }
}