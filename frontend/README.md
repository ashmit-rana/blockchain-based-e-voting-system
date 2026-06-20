# 🗳️ Blockchain Based E-Voting System

<div align="center">

![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-627EEA?style=for-the-badge&logo=ethereum&logoColor=white)
![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=for-the-badge&logo=solidity&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-8.24-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Hardhat](https://img.shields.io/badge/Hardhat-2.28.6-F7DF1E?style=for-the-badge&logo=hardhat&logoColor=black)

### A fully decentralised, privacy-first e-voting platform built on Ethereum
### Secured by Zero-Knowledge Proofs and Aadhaar OTP Identity Verification

[**Features**](#-features) • [**Architecture**](#-system-architecture) • [**Smart Contracts**](#-smart-contracts) • [**Getting Started**](#-getting-started) • [**Demo**](#-demo-flow) • [**Security**](#-security)

</div>

---

## 🌟 What is BlockVote?

BlockVote is a production-grade decentralised e-voting system that completely eliminates the need for a central authority. Every single vote is recorded immutably on the Ethereum blockchain — no government body, no administrator, and no hacker can alter, delete, or manipulate it.

Identity is verified through India's **Aadhaar OTP system** (UIDAI), ensuring only real, eligible citizens can participate. Voter anonymity is guaranteed through **Zero-Knowledge cryptographic proofs** — meaning a vote can be verified as legitimate without ever revealing who cast it.

The system supports three election types: **General/Political Elections**, **University/College Elections**, and **Corporate Board Voting** — all managed through a live admin dashboard with real-time blockchain analytics.

---

## ✨ Features

| Feature | Description | Technology |
|---|---|---|
| 🔗 **On-Chain Voting** | Every vote permanently recorded on Ethereum | Solidity, ethers.js |
| 🪪 **Aadhaar Verification** | Real identity verified via UIDAI OTP | UIDAI Sandbox API |
| 🔐 **Zero-Knowledge Proofs** | Vote anonymity guaranteed cryptographically | snarkjs, ZKVerifier.sol |
| 🦊 **MetaMask Login** | Wallet-based authentication, no passwords | ethers.js BrowserProvider |
| ⚡ **Live Results** | Vote counts stream in real time from blockchain | Recharts, polling |
| 🛡️ **Double Vote Prevention** | Enforced at smart contract level — impossible to bypass | VotingBallot.sol |
| 📊 **Admin Dashboard** | Full election lifecycle management | React, JWT |
| 🏆 **Auto Winner Tallying** | Winner calculated and published on-chain | ResultTally.sol |
| 📋 **Immutable Audit Trail** | Every action timestamped and permanently logged | Ethereum events |
| 🌐 **Multi-Election Types** | General, University, and Corporate elections | ElectionManager.sol |

---

## 🏗️ System Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                        FRONTEND LAYER                            ║
║              React 18  •  ethers.js  •  MetaMask                 ║
║     Voter Portal  •  Admin Dashboard  •  Live Results            ║
╠══════════════════════════════════════════════════════════════════╣
║                        BACKEND LAYER                             ║
║               Node.js 22  •  Express  •  MongoDB                 ║
║   Voter API  •  Election API  •  Vote API  •  ZK Service         ║
║          Aadhaar Service  •  Blockchain Service                  ║
╠══════════════════════════════════════════════════════════════════╣
║                    SMART CONTRACT LAYER                          ║
║                  Solidity 0.8.28  •  Hardhat                     ║
║  ElectionManager  •  VoterRegistry  •  VotingBallot              ║
║           ZKVerifier  •  ResultTally                             ║
╠══════════════════════════════════════════════════════════════════╣
║                      STORAGE LAYER                               ║
║         MongoDB (off-chain)  •  Ethereum (on-chain)              ║
╚══════════════════════════════════════════════════════════════════╝
```

### Data Flow: How a Vote is Cast

```
Voter → MetaMask Connect → Aadhaar OTP → Identity Verified on Chain
     → Select Election → Choose Candidate → ZK Proof Generated
     → Nullifier Recorded on Chain → Vote Cast on VotingBallot.sol
     → ElectionManager updates tally → Event emitted → UI updates live
```

---

## 📜 Smart Contracts

Five Solidity contracts work together as an interconnected system:

### `ElectionManager.sol`
The master contract. Manages the full election lifecycle: `CREATED → ACTIVE → PAUSED → CLOSED → TALLIED`. Only authorised admins can create elections. Every state change emits an event for real-time frontend updates. Stores candidates on-chain with live vote counts.

### `VoterRegistry.sol`
Handles voter registration and verification. Stores a SHA-256 hash of each voter's Aadhaar number — the raw number is never stored anywhere. Links each voter's wallet address to a ZK commitment. Prevents duplicate registrations via both Aadhaar hash and ZK commitment checks.

### `VotingBallot.sol`
The core voting contract. Calls `VoterRegistry` to confirm eligibility before accepting any vote. Uses nullifiers to prevent double voting — enforced at protocol level, not application level. Every vote increments the candidate count in `ElectionManager`.

### `ZKVerifier.sol`
Records Zero-Knowledge proof hashes on-chain after the backend validates them via snarkjs. Maintains a mapping of used proof hashes to prevent reuse. Ensures every vote can be cryptographically verified as legitimate without revealing the voter's identity.

### `ResultTally.sol`
Activated when admin closes an election. Reads final vote counts from `ElectionManager`, determines the winner, handles tie detection, and publishes the immutable final result on-chain. Once published, results cannot be altered by anyone.

---

## 🛠️ Tech Stack

### Blockchain & Smart Contracts
- **Ethereum** — Decentralised blockchain network
- **Solidity 0.8.28** — Smart contract language
- **Hardhat 2.28.6** — Local blockchain node and deployment framework
- **OpenZeppelin** — Battle-tested security standards (Ownable, ReentrancyGuard)
- **ethers.js v6** — Ethereum interaction library

### Backend
- **Node.js v22+** — Runtime environment
- **Express.js** — REST API framework
- **MongoDB + Mongoose 8.24** — Off-chain data (sessions, metadata)
- **JWT** — Role-based authentication (voter / admin)
- **UIDAI Sandbox API** — Aadhaar OTP verification
- **snarkjs** — Zero-Knowledge proof generation
- **Nodemailer** — Email notifications

### Frontend
- **React 18** — UI framework
- **ethers.js v6** — MetaMask wallet integration
- **React Router v6** — Client-side routing
- **Recharts** — Real-time vote charts
- **Context API** — Web3 and Auth state management

---

## 📁 Project Structure

```
blockchain-based-e-voting-system/
│
├── blockchain/                          # Hardhat project
│   ├── contracts/
│   │   ├── ElectionManager.sol          # Master election contract
│   │   ├── VoterRegistry.sol            # Voter identity & verification
│   │   ├── VotingBallot.sol             # Vote casting & double-vote prevention
│   │   ├── ZKVerifier.sol               # Zero-Knowledge proof recording
│   │   └── ResultTally.sol              # Result calculation & publishing
│   ├── scripts/
│   │   └── deploy.js                    # Deploys all 5 contracts in correct order
│   ├── test/                            # Contract unit tests
│   ├── deployments/
│   │   └── localhost.json               # Deployed contract addresses
│   └── hardhat.config.js
│
├── backend/                             # Node.js / Express API
│   ├── controllers/
│   │   ├── voterController.js           # Aadhaar OTP, registration, login
│   │   ├── electionController.js        # Create, activate, close elections
│   │   └── voteController.js            # Cast vote, results, vote status
│   ├── routes/
│   │   ├── voterRoutes.js
│   │   ├── electionRoutes.js
│   │   └── voteRoutes.js
│   ├── services/
│   │   ├── blockchainService.js         # ethers.js contract interactions
│   │   ├── aadhaarService.js            # UIDAI OTP integration
│   │   └── zkService.js                 # ZK commitment & nullifier generation
│   ├── models/
│   │   ├── Voter.js                     # Voter MongoDB schema
│   │   └── Election.js                  # Election + candidates schema
│   ├── middleware/
│   │   └── auth.js                      # JWT protect & adminOnly middleware
│   └── server.js
│
├── frontend/                            # React application
│   └── src/
│       ├── pages/
│       │   ├── Home.js                  # Landing page with features & stats
│       │   ├── VoterPortal/
│       │   │   ├── VoterPortal.js       # 4-step registration & voting flow
│       │   │   └── VotingPanel.js       # Active election & candidate selection
│       │   ├── AdminDashboard/
│       │   │   ├── AdminDashboard.js    # Election management & stats
│       │   │   └── CreateElection.js    # Election creation form
│       │   └── Results/
│       │       └── Results.js           # Live charts & winner display
│       ├── components/
│       │   └── Navbar.js                # Sticky nav with wallet status
│       ├── context/
│       │   ├── AuthContext.js           # JWT token & user role state
│       │   └── Web3Context.js           # MetaMask provider & signer state
│       └── utils/
│           └── constants.js             # Contract addresses & API URL
│
└── zk-circuits/                         # snarkjs / Circom ZK circuits
    ├── circuits/
    └── keys/
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js v22.13.0 or later** (required by Hardhat 2.28.6)
- **MongoDB** running locally
- **MetaMask** browser extension installed
- **Git**

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/blockchain-based-e-voting-system.git
cd blockchain-based-e-voting-system
```

### Step 2 — Install all dependencies

```bash
# Blockchain
cd blockchain && npm install

# Backend
cd ../backend && npm install

# Frontend
cd ../frontend && npm install

# ZK Circuits
cd ../zk-circuits && npm install
```

### Step 3 — Configure environment variables

Create `backend/.env` with the following:

```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/evoting
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
RPC_URL=http://127.0.0.1:8545
DEPLOYER_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
AADHAAR_SANDBOX_URL=https://developer.uidai.gov.in
NODE_ENV=development
ADMIN_PASSWORD=admin123
```

> Contract addresses are automatically added to this file when you run the deploy script.

### Step 4 — Start the system (4 terminals)

```bash
# Terminal 1 — Start local Ethereum blockchain
cd blockchain && npx hardhat node

# Terminal 2 — Deploy all 5 smart contracts (run once after Terminal 1 is ready)
cd blockchain && npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 — Start backend API server
cd backend && npm run dev

# Terminal 4 — Start React frontend
cd frontend && npm start
```

### Step 5 — Configure MetaMask

Add the local Hardhat network to MetaMask:

| Field | Value |
|---|---|
| Network Name | `Hardhat Local` |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | `ETH` |

Import the Hardhat test account (pre-loaded with 10,000 test ETH):
```
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> ⚠️ This is a public test key used only for local development. Never use it on mainnet.

Open `http://localhost:3000` in your browser.

---

## 🎬 Demo Flow

### Admin Flow
1. Navigate to `http://localhost:3000/admin`
2. Login with password: `admin123`
3. Click **Create Election** → fill in title, description, candidates, and dates
4. Click **Create Election on Blockchain** — transaction confirmed on Hardhat node
5. Go to **Manage Elections** → click **Activate Election**
6. After voting period ends → click **Close & Tally** — winner published on-chain

### Voter Flow
1. Open `http://localhost:3000/voter`
2. Click **Connect MetaMask** → approve connection
3. Enter any 12-digit number as Aadhaar → click **Send OTP**
4. Enter sandbox OTP: `123456` → click **Verify OTP**
5. Fill in name, email, phone → click **Register & Verify on Blockchain**
6. Select active election → choose candidate → click **Cast Vote on Blockchain**
7. Vote is permanently recorded — attempting to vote again is blocked by smart contract

### Results Flow
1. Navigate to `http://localhost:3000/results`
2. Live bar charts show real-time vote distribution per candidate
3. Leading candidate highlighted with live percentage
4. Winner banner appears when election is closed and tallied
5. Every result verified directly from Ethereum — `⛓️ Immutable & tamper-proof`

---

## 🔐 Security

### Smart Contract Security
- **ReentrancyGuard** on all state-changing functions — prevents re-entrancy attacks
- **Ownable** pattern — only authorised addresses can manage elections
- **Nullifier mapping** — each ZK proof can only be used once
- **On-chain eligibility check** — VotingBallot calls VoterRegistry before every vote

### Identity & Privacy
- **Aadhaar number never stored** — only a SHA-256 hash (salted with JWT secret)
- **ZK commitments** — voter identity mathematically separated from their vote
- **Wallet addresses** are public by design — vote choices are never linked to them
- **OTP expiry** — sandbox OTPs expire after 5 minutes

### API Security
- **JWT authentication** on all protected routes
- **Role-based access control** — voter and admin roles enforced separately
- **CORS** restricted to `localhost:3000` only

---

## 🗺️ Roadmap

- [x] 5 Solidity smart contracts deployed and tested
- [x] Aadhaar OTP verification (sandbox)
- [x] Zero-Knowledge proof generation and on-chain recording
- [x] MetaMask wallet integration
- [x] Real-time results dashboard
- [x] Admin election management
- [ ] Sepolia testnet deployment
- [ ] Full Circom ZK circuit implementation
- [ ] IPFS metadata storage
- [ ] Email/SMS notifications via Nodemailer & Twilio
- [ ] Mobile responsive UI improvements

---

## 👨‍💻 Author

**Ashmit Rana**

Built as a major full-stack blockchain project demonstrating decentralised application development, Solidity smart contract engineering, cryptographic privacy techniques, and full-stack JavaScript development.

---

## 📄 License

MIT License — free to use for educational and non-commercial purposes.