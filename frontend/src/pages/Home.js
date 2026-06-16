import React from "react";
import { Link } from "react-router-dom";
import { useWeb3 } from "../context/Web3Context";

const features = [
  { icon: "🔗", title: "Blockchain Secured", desc: "Every vote is recorded on Ethereum — immutable, transparent, and tamper-proof." },
  { icon: "🪪", title: "Aadhaar Verified", desc: "Voters are verified via Aadhaar OTP ensuring only eligible citizens can vote." },
  { icon: "🔐", title: "Zero-Knowledge Proofs", desc: "Your identity is never revealed. ZK proofs ensure complete voter anonymity." },
  { icon: "⚡", title: "Real-Time Results", desc: "Watch live vote counts update in real time directly from the blockchain." },
  { icon: "🛡️", title: "Double Vote Prevention", desc: "Smart contracts enforce one vote per voter at the protocol level." },
  { icon: "📊", title: "Full Audit Trail", desc: "Every action is logged immutably — full transparency with zero manipulation." },
];

const stats = [
  { value: "5", label: "Smart Contracts" },
  { value: "100%", label: "Decentralised" },
  { value: "ZK", label: "Privacy Protected" },
  { value: "0", label: "Central Authority" },
];

export default function Home() {
  const { isConnected, connectWallet } = useWeb3();

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        padding: "100px 24px",
        textAlign: "center",
        background: "radial-gradient(ellipse at top, rgba(99,102,241,0.15) 0%, transparent 60%)",
      }}>
        {/* Glow orbs */}
        <div style={{
          position: "absolute", top: "20%", left: "10%",
          width: "300px", height: "300px",
          background: "rgba(99,102,241,0.08)",
          borderRadius: "50%", filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "10%",
          width: "200px", height: "200px",
          background: "rgba(16,185,129,0.08)",
          borderRadius: "50%", filter: "blur(60px)",
        }} />

        <div className="fade-in" style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px",
            background: "rgba(99,102,241,0.1)",
            border: "1px solid rgba(99,102,241,0.3)",
            borderRadius: "20px",
            fontSize: "13px", color: "#818cf8",
            marginBottom: "24px",
          }}>
            <span>⚡</span> Powered by Ethereum Blockchain
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 800, lineHeight: 1.1,
            marginBottom: "24px",
            background: "linear-gradient(135deg, #f1f5f9 0%, #818cf8 50%, #10b981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            The Future of<br />Democratic Voting
          </h1>

          <p style={{
            fontSize: "18px", color: "#94a3b8",
            lineHeight: 1.7, marginBottom: "40px",
            maxWidth: "600px", margin: "0 auto 40px",
          }}>
            A fully decentralised e-voting platform secured by blockchain technology,
            Aadhaar identity verification, and Zero-Knowledge proofs for complete voter anonymity.
          </p>

          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/voter" className="btn btn-primary" style={{ fontSize: "16px", padding: "14px 32px" }}>
              🗳️ Cast Your Vote
            </Link>
            <Link to="/results" className="btn btn-secondary" style={{ fontSize: "16px", padding: "14px 32px" }}>
              📊 View Results
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 24px 80px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "80px",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              background: "rgba(30,41,59,0.5)",
              border: "1px solid #334155",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
            }}>
              <div style={{
                fontSize: "36px", fontWeight: 800,
                background: "linear-gradient(135deg, #818cf8, #10b981)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{s.value}</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <h2 style={{ textAlign: "center", fontSize: "36px", fontWeight: 700, marginBottom: "48px" }}>
          Why BlockVote?
        </h2>
        <div className="grid-3">
          {features.map((f, i) => (
            <div key={i} className="card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{f.icon}</div>
              <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "8px" }}>{f.title}</h3>
              <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: "80px",
          padding: "60px",
          background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(16,185,129,0.1))",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "24px",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: "36px", fontWeight: 700, marginBottom: "16px" }}>
            Ready to Vote?
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "16px" }}>
            Connect your MetaMask wallet and verify your Aadhaar to get started.
          </p>
          {!isConnected ? (
            <button className="btn btn-primary" onClick={connectWallet}
              style={{ fontSize: "16px", padding: "14px 32px" }}>
              🦊 Connect MetaMask
            </button>
          ) : (
            <Link to="/voter" className="btn btn-primary"
              style={{ fontSize: "16px", padding: "14px 32px" }}>
              🗳️ Go to Voter Portal
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}