import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";

export default function VotingPanel() {
  const { token } = useAuth();
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [votedElections, setVotedElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_URL}/elections`);
      const active = res.data.elections.filter(e => e.status === "ACTIVE");
      setElections(active);
    } catch (err) {
      setError("Failed to load elections");
    }
  };

  const checkVoteStatus = async (electionId) => {
    try {
      const res = await axios.get(`${API_URL}/votes/status/${electionId}`, { headers });
      return res.data.hasVoted;
    } catch { return false; }
  };

  const handleSelectElection = async (election) => {
    setSelectedElection(election);
    setSelectedCandidate(null);
    setSuccess("");
    setError("");
    const hasVoted = await checkVoteStatus(election.electionId);
    if (hasVoted) {
      setVotedElections(prev => [...prev, election.electionId]);
    }
  };

  const handleCastVote = async () => {
    if (!selectedCandidate) {
      setError("Please select a candidate");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/votes/cast`, {
        electionId: selectedElection.electionId,
        candidateId: selectedCandidate,
      }, { headers });

      setSuccess("🎉 Vote cast successfully and recorded on the blockchain!");
      setVotedElections(prev => [...prev, selectedElection.electionId]);
      setSelectedCandidate(null);
    } catch (err) {
      setError(err.response?.data?.message || "Vote failed");
    }
    setLoading(false);
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>
          ✅ Identity Verified
        </h2>
        <p style={{ color: "#94a3b8" }}>Select an active election to cast your vote</p>
      </div>

      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {elections.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "48px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
          <h3 style={{ color: "#64748b" }}>No active elections at the moment</h3>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {elections.map(election => (
            <div key={election.electionId}
              className="card"
              onClick={() => handleSelectElection(election)}
              style={{
                cursor: "pointer",
                border: selectedElection?.electionId === election.electionId
                  ? "1px solid #6366f1"
                  : "1px solid #334155",
                boxShadow: selectedElection?.electionId === election.electionId
                  ? "0 0 20px rgba(99,102,241,0.3)"
                  : "none",
              }}>
              <div className="flex-between">
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "4px" }}>
                    {election.title}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#94a3b8" }}>{election.description}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                  <span className="badge badge-active">Active</span>
                  {votedElections.includes(election.electionId) && (
                    <span style={{ fontSize: "12px", color: "#10b981" }}>✓ Voted</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Candidates */}
      {selectedElection && !votedElections.includes(selectedElection.electionId) && (
        <div className="fade-in" style={{ marginTop: "32px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
            Select Candidate — {selectedElection.title}
          </h3>
          <div className="grid-2">
            {selectedElection.candidates.map(candidate => (
              <div key={candidate.candidateId}
                onClick={() => setSelectedCandidate(candidate.candidateId)}
                style={{
                  padding: "20px",
                  background: selectedCandidate === candidate.candidateId
                    ? "rgba(99,102,241,0.1)"
                    : "#1e293b",
                  border: selectedCandidate === candidate.candidateId
                    ? "2px solid #6366f1"
                    : "1px solid #334155",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                <div style={{
                  width: "48px", height: "48px",
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "20px", marginBottom: "12px",
                }}>
                  {candidate.name.charAt(0)}
                </div>
                <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "4px" }}>
                  {candidate.name}
                </h4>
                <p style={{ fontSize: "13px", color: "#94a3b8" }}>{candidate.party}</p>
                {selectedCandidate === candidate.candidateId && (
                  <div style={{
                    marginTop: "12px", fontSize: "12px",
                    color: "#818cf8", fontWeight: 600,
                  }}>✓ Selected</div>
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-primary"
            onClick={handleCastVote}
            disabled={!selectedCandidate || loading}
            style={{ width: "100%", marginTop: "24px", padding: "16px", fontSize: "16px" }}>
            {loading ? <span className="loading-spinner" /> : "🗳️ Cast Vote on Blockchain"}
          </button>
        </div>
      )}

      {selectedElection && votedElections.includes(selectedElection.electionId) && (
        <div className="card fade-in" style={{ marginTop: "24px", textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>✅</div>
          <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>
            Vote Recorded on Blockchain
          </h3>
          <p style={{ color: "#94a3b8" }}>
            Your vote has been permanently recorded. It cannot be altered or deleted.
          </p>
        </div>
      )}
    </div>
  );
}