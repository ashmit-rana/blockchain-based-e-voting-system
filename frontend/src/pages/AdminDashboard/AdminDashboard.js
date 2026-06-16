import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import { useAuth } from "../../context/AuthContext";
import CreateElection from "./CreateElection";

export default function AdminDashboard() {
  const { token, login } = useAuth();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("elections");
  const [adminPassword, setAdminPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (isLoggedIn) fetchElections();
  }, [isLoggedIn]);

  const handleAdminLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/elections/admin-login`, {
        walletAddress: walletAddress || "0x0000000000000000000000000000000000000000",
        password: adminPassword,
      });
      login({}, res.data.token, "admin");
      setIsLoggedIn(true);
    } catch (err) {
      setError("Invalid credentials. Default password: admin123");
    }
    setLoading(false);
  };

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_URL}/elections`);
      setElections(res.data.elections);
    } catch (err) {
      setError("Failed to load elections");
    }
  };

  const handleActivate = async (electionId) => {
    setLoading(true);
    setError("");
    try {
      await axios.put(`${API_URL}/elections/${electionId}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Election activated on blockchain!");
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to activate");
    }
    setLoading(false);
  };

  const handleClose = async (electionId) => {
    setLoading(true);
    setError("");
    try {
      await axios.put(`${API_URL}/elections/${electionId}/close`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess("Election closed and results published on blockchain!");
      fetchElections();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to close");
    }
    setLoading(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: "#818cf8", ACTIVE: "#10b981",
      PAUSED: "#f59e0b", CLOSED: "#64748b", TALLIED: "#f59e0b"
    };
    return colors[status] || "#64748b";
  };

  // Admin Login Screen
  if (!isLoggedIn) {
    return (
      <div className="page-container" style={{ maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔐</div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "8px" }}>
            Admin Login
          </h1>
          <p style={{ color: "#94a3b8" }}>Access the election management dashboard</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-group">
            <label className="label">Admin Password</label>
            <input className="input" type="password"
              placeholder="Enter admin password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
            />
          </div>
          <div className="alert alert-info" style={{ marginBottom: "16px", fontSize: "13px" }}>
            💡 Default password: <strong>admin123</strong>
          </div>
          <button className="btn btn-primary" onClick={handleAdminLogin}
            disabled={loading} style={{ width: "100%" }}>
            {loading ? <span className="loading-spinner" /> : "Login as Admin"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "4px" }}>
            ⚙️ Admin Dashboard
          </h1>
          <p style={{ color: "#94a3b8" }}>Manage elections on the blockchain</p>
        </div>
        <div style={{
          padding: "8px 16px",
          background: "rgba(16,185,129,0.1)",
          border: "1px solid rgba(16,185,129,0.3)",
          borderRadius: "8px",
          fontSize: "13px", color: "#10b981",
        }}>
          🟢 Admin Connected
        </div>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px", marginBottom: "32px",
      }}>
        {[
          { label: "Total Elections", value: elections.length, icon: "🗳️" },
          { label: "Active", value: elections.filter(e => e.status === "ACTIVE").length, icon: "✅" },
          { label: "Total Votes", value: elections.reduce((a, e) => a + (e.totalVotes || 0), 0), icon: "📊" },
          { label: "Closed", value: elections.filter(e => e.status === "CLOSED").length, icon: "🔒" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: "16px", padding: "20px",
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: "#f1f5f9" }}>{s.value}</div>
            <div style={{ fontSize: "13px", color: "#64748b" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {["elections", "create"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: "10px 20px", borderRadius: "8px",
              border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 600,
              background: activeTab === tab ? "#6366f1" : "#1e293b",
              color: activeTab === tab ? "white" : "#94a3b8",
              transition: "all 0.2s",
            }}>
            {tab === "elections" ? "📋 Manage Elections" : "➕ Create Election"}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Elections List */}
      {activeTab === "elections" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {elections.length === 0 ? (
            <div className="card" style={{ textAlign: "center", padding: "48px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <h3 style={{ color: "#64748b" }}>No elections yet</h3>
              <p style={{ color: "#475569", marginTop: "8px" }}>
                Create your first election using the Create tab
              </p>
            </div>
          ) : (
            elections.map(election => (
              <div key={election.electionId} className="card">
                <div className="flex-between" style={{ marginBottom: "16px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: 700 }}>{election.title}</h3>
                      <span className={`badge badge-${election.status.toLowerCase()}`}>
                        {election.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#94a3b8" }}>{election.description}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "24px", fontWeight: 800, color: "#818cf8" }}>
                      {election.totalVotes || 0}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>total votes</div>
                  </div>
                </div>

                {/* Candidates */}
                <div style={{ marginBottom: "16px" }}>
                  <p style={{ fontSize: "12px", color: "#64748b", marginBottom: "8px" }}>CANDIDATES</p>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {election.candidates.map(c => (
                      <div key={c.candidateId} style={{
                        padding: "6px 12px",
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "8px", fontSize: "13px",
                      }}>
                        <span style={{ fontWeight: 600 }}>{c.name}</span>
                        <span style={{ color: "#64748b" }}> · {c.party}</span>
                        <span style={{ color: "#818cf8", marginLeft: "8px" }}>{c.voteCount} votes</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "12px" }}>
                  {election.status === "CREATED" && (
                    <button className="btn btn-success"
                      onClick={() => handleActivate(election.electionId)}
                      disabled={loading}>
                      ▶ Activate Election
                    </button>
                  )}
                  {election.status === "ACTIVE" && (
                    <button className="btn btn-danger"
                      onClick={() => handleClose(election.electionId)}
                      disabled={loading}>
                      ⏹ Close & Tally
                    </button>
                  )}
                  {election.status === "CLOSED" && (
                    <div style={{ fontSize: "14px", color: "#10b981", fontWeight: 600 }}>
                      🏆 Winner: {election.winnerName || "Calculating..."}
                      {election.isTied && " (Tied)"}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Election */}
      {activeTab === "create" && (
        <CreateElection
          token={token}
          onCreated={() => { fetchElections(); setActiveTab("elections"); setSuccess("Election created on blockchain!"); }}
        />
      )}
    </div>
  );
}