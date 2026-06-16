import React, { useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/constants";

export default function CreateElection({ token, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [electionType, setElectionType] = useState("GENERAL");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [candidates, setCandidates] = useState([
    { name: "", party: "" },
    { name: "", party: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addCandidate = () => {
    setCandidates([...candidates, { name: "", party: "" }]);
  };

  const updateCandidate = (index, field, value) => {
    const updated = [...candidates];
    updated[index][field] = value;
    setCandidates(updated);
  };

  const removeCandidate = (index) => {
    if (candidates.length <= 2) return;
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    if (!title || !description || !startTime || !endTime) {
      setError("All fields are required");
      return;
    }
    if (candidates.some(c => !c.name || !c.party)) {
      setError("All candidates must have a name and party");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/elections`, {
        title, description, electionType,
        startTime, endTime, candidates,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create election");
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ maxWidth: "700px" }}>
      <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>
        ➕ Create New Election
      </h2>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="form-group">
        <label className="label">Election Title</label>
        <input className="input" placeholder="e.g. Student Council Election 2025"
          value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div className="form-group">
        <label className="label">Description</label>
        <textarea className="input" placeholder="Describe this election..."
          rows={3} value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ resize: "vertical" }} />
      </div>

      <div className="form-group">
        <label className="label">Election Type</label>
        <select className="input" value={electionType}
          onChange={(e) => setElectionType(e.target.value)}>
          <option value="GENERAL">General Election</option>
          <option value="UNIVERSITY">University Election</option>
          <option value="CORPORATE">Corporate Election</option>
        </select>
      </div>

      <div className="grid-2">
        <div className="form-group">
          <label className="label">Start Time</label>
          <input className="input" type="datetime-local"
            value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">End Time</label>
          <input className="input" type="datetime-local"
            value={endTime} onChange={(e) => setEndTime(e.target.value)} />
        </div>
      </div>

      {/* Candidates */}
      <div style={{ marginBottom: "24px" }}>
        <div className="flex-between" style={{ marginBottom: "12px" }}>
          <label className="label" style={{ margin: 0 }}>
            Candidates (minimum 2)
          </label>
          <button className="btn btn-secondary" onClick={addCandidate}
            style={{ padding: "6px 12px", fontSize: "13px" }}>
            + Add Candidate
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {candidates.map((candidate, index) => (
            <div key={index} style={{
              padding: "16px",
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "10px",
            }}>
              <div className="flex-between" style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#818cf8" }}>
                  Candidate {index + 1}
                </span>
                {candidates.length > 2 && (
                  <button onClick={() => removeCandidate(index)}
                    style={{
                      background: "none", border: "none",
                      color: "#ef4444", cursor: "pointer", fontSize: "13px",
                    }}>
                    Remove
                  </button>
                )}
              </div>
              <div className="grid-2">
                <div>
                  <label className="label">Full Name</label>
                  <input className="input" placeholder="Candidate name"
                    value={candidate.name}
                    onChange={(e) => updateCandidate(index, "name", e.target.value)} />
                </div>
                <div>
                  <label className="label">Party / Affiliation</label>
                  <input className="input" placeholder="Party name"
                    value={candidate.party}
                    onChange={(e) => updateCandidate(index, "party", e.target.value)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: "12px 16px",
        background: "rgba(99,102,241,0.05)",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: "10px", marginBottom: "20px",
        fontSize: "13px", color: "#94a3b8",
      }}>
        ⛓️ This election will be deployed to the Ethereum blockchain.
        Once created, candidates cannot be modified.
      </div>

      <button className="btn btn-primary" onClick={handleCreate}
        disabled={loading} style={{ width: "100%", padding: "16px", fontSize: "16px" }}>
        {loading ? (
          <><span className="loading-spinner" /> Deploying to Blockchain...</>
        ) : (
          "🚀 Create Election on Blockchain"
        )}
      </button>
    </div>
  );
}