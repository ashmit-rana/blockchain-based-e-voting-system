import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from "recharts";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: "#1e293b", border: "1px solid #334155",
        borderRadius: "10px", padding: "12px 16px",
      }}>
        <p style={{ fontWeight: 600, marginBottom: "4px" }}>{label}</p>
        <p style={{ color: "#818cf8" }}>{payload[0].value} votes</p>
      </div>
    );
  }
  return null;
};

export default function Results() {
  const [elections, setElections] = useState([]);
  const [selectedElection, setSelectedElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [liveData, setLiveData] = useState(null);

  useEffect(() => {
    fetchElections();
    const interval = setInterval(fetchElections, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedElection) {
      fetchResults(selectedElection.electionId);
      const interval = setInterval(
        () => fetchResults(selectedElection.electionId), 5000
      );
      return () => clearInterval(interval);
    }
  }, [selectedElection]);

  const fetchElections = async () => {
    try {
      const res = await axios.get(`${API_URL}/elections`);
      setElections(res.data.elections);
      setLoading(false);
    } catch (err) {
      setError("Failed to load elections");
      setLoading(false);
    }
  };

  const fetchResults = async (electionId) => {
    try {
      const res = await axios.get(`${API_URL}/votes/results/${electionId}`);
      setLiveData(res.data.election);
    } catch (err) {
      console.error("Failed to fetch results");
    }
  };

  const getChartData = (election) => {
    const data = liveData?.electionId === election.electionId ? liveData : election;
    return (data.candidates || []).map(c => ({
      name: c.name,
      votes: c.voteCount || 0,
      party: c.party,
    }));
  };

  const getLeader = (election) => {
    const data = liveData?.electionId === election.electionId ? liveData : election;
    if (!data.candidates || data.candidates.length === 0) return null;
    return data.candidates.reduce((a, b) =>
      (a.voteCount || 0) > (b.voteCount || 0) ? a : b
    );
  };

  const getTotalVotes = (election) => {
    const data = liveData?.electionId === election.electionId ? liveData : election;
    return data.totalVotes || 0;
  };

  const getVotePercentage = (voteCount, total) => {
    if (!total) return 0;
    return ((voteCount / total) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: "center", paddingTop: "100px" }}>
        <div className="loading-spinner" style={{ width: "40px", height: "40px", margin: "0 auto" }} />
        <p style={{ color: "#94a3b8", marginTop: "16px" }}>Loading elections...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: "40px" }}>
        <div className="flex-between">
          <div>
            <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>
              📊 Election Results
            </h1>
            <p style={{ color: "#94a3b8" }}>
              Live results sourced directly from the Ethereum blockchain
            </p>
          </div>
          <div style={{
            display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 16px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "8px", fontSize: "13px", color: "#10b981",
          }}>
            <div style={{
              width: "8px", height: "8px",
              background: "#10b981", borderRadius: "50%",
              animation: "glow 2s ease-in-out infinite",
            }} />
            Live Updates
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {elections.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "80px" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>📭</div>
          <h2 style={{ color: "#64748b", marginBottom: "8px" }}>No elections yet</h2>
          <p style={{ color: "#475569" }}>Elections will appear here once created by admin</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {elections.map(election => {
            const chartData = getChartData(election);
            const leader = getLeader(election);
            const totalVotes = getTotalVotes(election);
            const isSelected = selectedElection?.electionId === election.electionId;
            const currentData = liveData?.electionId === election.electionId
              ? liveData : election;

            return (
              <div key={election.electionId} className="card"
                style={{ padding: "32px" }}>
                {/* Election Header */}
                <div className="flex-between" style={{ marginBottom: "24px" }}>
                  <div>
                    <div style={{
                      display: "flex", alignItems: "center",
                      gap: "12px", marginBottom: "6px",
                    }}>
                      <h2 style={{ fontSize: "24px", fontWeight: 700 }}>
                        {election.title}
                      </h2>
                      <span className={`badge badge-${election.status.toLowerCase()}`}>
                        {election.status}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                      {election.description}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: "36px", fontWeight: 800,
                      background: "linear-gradient(135deg, #818cf8, #10b981)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}>
                      {totalVotes}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>total votes</div>
                  </div>
                </div>

                {/* Winner Banner */}
                {election.status === "CLOSED" && election.winnerName && (
                  <div style={{
                    padding: "16px 24px",
                    background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.1))",
                    border: "1px solid rgba(99,102,241,0.3)",
                    borderRadius: "12px", marginBottom: "24px",
                    display: "flex", alignItems: "center", gap: "12px",
                  }}>
                    <span style={{ fontSize: "24px" }}>🏆</span>
                    <div>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "2px" }}>
                        WINNER
                      </p>
                      <p style={{ fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>
                        {election.winnerName}
                        {election.isTied && (
                          <span style={{ fontSize: "14px", color: "#f59e0b", marginLeft: "8px" }}>
                            (Tied)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Live Leader */}
                {election.status === "ACTIVE" && leader && totalVotes > 0 && (
                  <div style={{
                    padding: "12px 16px",
                    background: "rgba(16,185,129,0.05)",
                    border: "1px solid rgba(16,185,129,0.2)",
                    borderRadius: "10px", marginBottom: "24px",
                    fontSize: "14px",
                  }}>
                    📈 Currently leading: <strong style={{ color: "#10b981" }}>
                      {leader.name}
                    </strong> with {leader.voteCount} votes
                  </div>
                )}

                {/* Candidate Bars */}
                <div style={{ marginBottom: "24px" }}>
                  {(currentData.candidates || []).map((candidate, i) => {
                    const pct = getVotePercentage(candidate.voteCount || 0, totalVotes);
                    const isLeader = leader?.name === candidate.name && totalVotes > 0;
                    return (
                      <div key={candidate.candidateId} style={{ marginBottom: "16px" }}>
                        <div className="flex-between" style={{ marginBottom: "6px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{
                              width: "32px", height: "32px",
                              background: `${COLORS[i % COLORS.length]}20`,
                              border: `1px solid ${COLORS[i % COLORS.length]}40`,
                              borderRadius: "50%",
                              display: "flex", alignItems: "center",
                              justifyContent: "center",
                              fontSize: "13px", fontWeight: 700,
                              color: COLORS[i % COLORS.length],
                            }}>
                              {candidate.name.charAt(0)}
                            </div>
                            <div>
                              <span style={{ fontWeight: 600, fontSize: "15px" }}>
                                {candidate.name}
                              </span>
                              {isLeader && (
                                <span style={{
                                  marginLeft: "8px", fontSize: "11px",
                                  color: "#10b981", fontWeight: 600,
                                }}>▲ LEADING</span>
                              )}
                              <p style={{ fontSize: "12px", color: "#64748b" }}>
                                {candidate.party}
                              </p>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontWeight: 700, fontSize: "16px" }}>
                              {candidate.voteCount || 0}
                            </span>
                            <span style={{ color: "#64748b", fontSize: "13px", marginLeft: "4px" }}>
                              votes
                            </span>
                            <p style={{ fontSize: "12px", color: COLORS[i % COLORS.length] }}>
                              {pct}%
                            </p>
                          </div>
                        </div>
                        {/* Progress Bar */}
                        <div style={{
                          height: "8px", background: "#0f172a",
                          borderRadius: "4px", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[i % COLORS.length]}88)`,
                            borderRadius: "4px",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chart */}
                {chartData.length > 0 && totalVotes > 0 && (
                  <div>
                    <p style={{
                      fontSize: "12px", color: "#64748b",
                      marginBottom: "12px", textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}>Vote Distribution</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                        <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                          {chartData.map((_, index) => (
                            <Cell key={index} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Blockchain proof */}
                <div style={{
                  marginTop: "20px", padding: "12px 16px",
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "8px",
                  display: "flex", alignItems: "center", gap: "8px",
                  fontSize: "12px", color: "#475569",
                }}>
                  ⛓️ Results verified on Ethereum blockchain · Election ID: #{election.electionId}
                  · Immutable &amp; tamper-proof
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}