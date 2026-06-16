import React, { useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import { API_URL } from "../../utils/constants";
import VotingPanel from "./VotingPanel";

const STEPS = ["Connect Wallet", "Aadhaar Verify", "Register", "Vote"];

export default function VoterPortal() {
  const { walletAddress, isConnected, connectWallet } = useWeb3();
  const { token, login } = useAuth();

  const [step, setStep] = useState(0);
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [txnId, setTxnId] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [electionType, setElectionType] = useState("GENERAL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleConnectWallet = async () => {
    const address = await connectWallet();
    if (address) setStep(1);
  };

  const handleSendOTP = async () => {
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      setError("Enter a valid 12-digit Aadhaar number");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/voters/send-otp`, { aadhaarNumber });
      setTxnId(res.data.txnId);
      setOtpSent(true);
      setSuccess("OTP sent! Use 123456 in sandbox mode.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    }
    setLoading(false);
  };

  const handleVerifyAndRegister = async () => {
    if (!otp || !name || !email || !phone) {
      setError("All fields are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/voters/register`, {
        txnId, otp, aadhaarNumber,
        walletAddress, name, email, phone, electionType,
      });
      login(res.data.voter, res.data.token, "voter");
      setSuccess("Successfully registered and verified!");
      setStep(3);
    } catch (err) {
      // If already registered, try login
      if (err.response?.data?.message?.includes("already registered")) {
        try {
          const loginRes = await axios.post(`${API_URL}/voters/login`, { walletAddress });
          login(loginRes.data.voter, loginRes.data.token, "voter");
          setStep(3);
        } catch {
          setError("Already registered. Please login.");
        }
      } else {
        setError(err.response?.data?.message || "Registration failed");
      }
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/voters/login`, { walletAddress });
      login(res.data.voter, res.data.token, "voter");
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
      setStep(1);
    }
    setLoading(false);
  };

  // If wallet connected, check if already registered
  const handleWalletConnected = async (address) => {
    try {
      const res = await axios.post(`${API_URL}/voters/login`, { walletAddress: address });
      login(res.data.voter, res.data.token, "voter");
      setStep(3);
    } catch {
      setStep(1);
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: "700px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: 800, marginBottom: "8px" }}>
          🗳️ Voter Portal
        </h1>
        <p style={{ color: "#94a3b8" }}>
          Verify your identity and cast your vote securely on the blockchain
        </p>
      </div>

      {/* Step Progress */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "center", gap: "0", marginBottom: "40px",
      }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 700,
                background: i <= step
                  ? "linear-gradient(135deg, #6366f1, #4f46e5)"
                  : "#1e293b",
                border: i <= step ? "none" : "1px solid #334155",
                color: i <= step ? "white" : "#64748b",
                boxShadow: i === step ? "0 0 20px rgba(99,102,241,0.5)" : "none",
                transition: "all 0.3s",
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              <span style={{
                fontSize: "11px", fontWeight: 500,
                color: i <= step ? "#818cf8" : "#64748b",
                whiteSpace: "nowrap",
              }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: "2px", maxWidth: "60px",
                background: i < step ? "#6366f1" : "#1e293b",
                margin: "0 8px", marginBottom: "20px",
                transition: "all 0.3s",
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Alerts */}
      {error && <div className="alert alert-error">❌ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Step 0: Connect Wallet */}
      {step === 0 && (
        <div className="card fade-in" style={{ textAlign: "center", padding: "48px" }}>
          <div style={{ fontSize: "64px", marginBottom: "24px" }}>🦊</div>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>
            Connect Your Wallet
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "32px", lineHeight: 1.6 }}>
            Connect your MetaMask wallet to begin the voting process.
            Your wallet address serves as your unique voter ID on the blockchain.
          </p>
          <button className="btn btn-primary" onClick={handleConnectWallet}
            style={{ fontSize: "16px", padding: "14px 32px" }}>
            Connect MetaMask
          </button>
        </div>
      )}

      {/* Step 1: Aadhaar Verify */}
      {step === 1 && (
        <div className="card fade-in">
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            🪪 Aadhaar Verification
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "14px" }}>
            Your Aadhaar number is hashed and never stored. Use any 12-digit number in sandbox mode.
          </p>

          <div className="form-group">
            <label className="label">Aadhaar Number</label>
            <input className="input" type="text" maxLength={12}
              placeholder="Enter 12-digit Aadhaar number"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {!otpSent ? (
            <button className="btn btn-primary" onClick={handleSendOTP}
              disabled={loading} style={{ width: "100%" }}>
              {loading ? <span className="loading-spinner" /> : "Send OTP"}
            </button>
          ) : (
            <>
              <div className="alert alert-info" style={{ marginBottom: "16px" }}>
                📱 Sandbox OTP: <strong>123456</strong>
              </div>
              <div className="form-group">
                <label className="label">Enter OTP</label>
                <input className="input" type="text" maxLength={6}
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
              </div>
              <button className="btn btn-primary" onClick={() => setStep(2)}
                disabled={otp.length !== 6} style={{ width: "100%" }}>
                Verify OTP →
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 2: Register Details */}
      {step === 2 && (
        <div className="card fade-in">
          <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "8px" }}>
            📋 Complete Registration
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: "24px", fontSize: "14px" }}>
            Fill in your details to complete voter registration.
          </p>

          <div className="form-group">
            <label className="label">Full Name</label>
            <input className="input" type="text" placeholder="Your full name"
              value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input className="input" type="email" placeholder="your@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Phone</label>
            <input className="input" type="text" placeholder="10-digit phone number"
              value={phone} onChange={(e) => setPhone(e.target.value)} />
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

          <div style={{
            padding: "12px 16px",
            background: "rgba(99,102,241,0.05)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "10px", marginBottom: "16px",
          }}>
            <p style={{ fontSize: "12px", color: "#94a3b8" }}>
              🔗 Wallet: <span style={{ color: "#818cf8" }}>{walletAddress}</span>
            </p>
          </div>

          <button className="btn btn-primary" onClick={handleVerifyAndRegister}
            disabled={loading} style={{ width: "100%" }}>
            {loading ? <span className="loading-spinner" /> : "Register & Verify on Blockchain →"}
          </button>
        </div>
      )}

      {/* Step 3: Voting Panel */}
      {step === 3 && token && <VotingPanel />}
    </div>
  );
}