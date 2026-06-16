import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useWeb3 } from "../context/Web3Context";

export default function Navbar() {
  const { token, role, logout } = useAuth();
  const { walletAddress, isConnected, connectWallet, disconnectWallet } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate("/");
  };

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: "rgba(15, 23, 42, 0.95)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid #1e293b",
      padding: "0 24px",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      height: "70px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      {/* Logo */}
      <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "36px", height: "36px",
          background: "linear-gradient(135deg, #6366f1, #4f46e5)",
          borderRadius: "10px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "18px"
        }}>🗳️</div>
        <span style={{
          fontFamily: "Space Grotesk, sans-serif",
          fontWeight: 700, fontSize: "18px",
          background: "linear-gradient(135deg, #f1f5f9, #818cf8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent"
        }}>
          BlockVote
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {[
          { path: "/", label: "Home" },
          { path: "/voter", label: "Vote" },
          { path: "/results", label: "Results" },
          ...(role === "admin" ? [{ path: "/admin", label: "Admin" }] : []),
        ].map(({ path, label }) => (
          <Link key={path} to={path} style={{
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: isActive(path) ? "#818cf8" : "#94a3b8",
            background: isActive(path) ? "rgba(99,102,241,0.1)" : "transparent",
            transition: "all 0.2s",
          }}>{label}</Link>
        ))}
      </div>

      {/* Right side */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isConnected ? (
          <div style={{
            padding: "8px 16px",
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.3)",
            borderRadius: "8px",
            fontSize: "13px",
            color: "#10b981",
            fontWeight: 500,
          }}>
            🟢 {shortAddress}
          </div>
        ) : (
          <button className="btn btn-primary" onClick={connectWallet}
            style={{ padding: "8px 16px", fontSize: "13px" }}>
            Connect Wallet
          </button>
        )}

        {token && (
          <button className="btn btn-secondary" onClick={handleLogout}
            style={{ padding: "8px 16px", fontSize: "13px" }}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}