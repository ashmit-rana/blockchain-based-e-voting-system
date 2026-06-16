const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    (await hre.ethers.provider.getBalance(deployer.address)).toString(),
    "\n"
  );

  // ── 1. Deploy ElectionManager ──────────────────────────
  console.log("📋 Deploying ElectionManager...");
  const ElectionManager = await hre.ethers.getContractFactory("ElectionManager");
  const electionManager = await ElectionManager.deploy();
  await electionManager.waitForDeployment();
  const electionManagerAddress = await electionManager.getAddress();
  console.log("✅ ElectionManager deployed to:", electionManagerAddress);

  // ── 2. Deploy VoterRegistry ────────────────────────────
  console.log("\n👤 Deploying VoterRegistry...");
  const VoterRegistry = await hre.ethers.getContractFactory("VoterRegistry");
  const voterRegistry = await VoterRegistry.deploy();
  await voterRegistry.waitForDeployment();
  const voterRegistryAddress = await voterRegistry.getAddress();
  console.log("✅ VoterRegistry deployed to:", voterRegistryAddress);

  // ── 3. Deploy VotingBallot ─────────────────────────────
  console.log("\n🗳️  Deploying VotingBallot...");
  const VotingBallot = await hre.ethers.getContractFactory("VotingBallot");
  const votingBallot = await VotingBallot.deploy(
    electionManagerAddress,
    voterRegistryAddress
  );
  await votingBallot.waitForDeployment();
  const votingBallotAddress = await votingBallot.getAddress();
  console.log("✅ VotingBallot deployed to:", votingBallotAddress);

  // ── 4. Deploy ZKVerifier ───────────────────────────────
  console.log("\n🔐 Deploying ZKVerifier...");
  const ZKVerifier = await hre.ethers.getContractFactory("ZKVerifier");
  const zkVerifier = await ZKVerifier.deploy();
  await zkVerifier.waitForDeployment();
  const zkVerifierAddress = await zkVerifier.getAddress();
  console.log("✅ ZKVerifier deployed to:", zkVerifierAddress);

  // ── 5. Deploy ResultTally ──────────────────────────────
  console.log("\n📊 Deploying ResultTally...");
  const ResultTally = await hre.ethers.getContractFactory("ResultTally");
  const resultTally = await ResultTally.deploy(electionManagerAddress);
  await resultTally.waitForDeployment();
  const resultTallyAddress = await resultTally.getAddress();
  console.log("✅ ResultTally deployed to:", resultTallyAddress);

  // ── 6. Link contracts together ─────────────────────────
  console.log("\n🔗 Linking contracts...");

  // Authorise VotingBallot to call VoterRegistry
  await voterRegistry.authoriseCaller(votingBallotAddress);
  console.log("✅ VotingBallot authorised in VoterRegistry");

  // Authorise VotingBallot to call ElectionManager
  await electionManager.authoriseAdmin(votingBallotAddress);
  console.log("✅ VotingBallot authorised in ElectionManager");

  // Authorise ResultTally to call ElectionManager
  await electionManager.authoriseAdmin(resultTallyAddress);
  console.log("✅ ResultTally authorised in ElectionManager");

  // ── 7. Save addresses to file ──────────────────────────
  console.log("\n💾 Saving contract addresses...");

  const addresses = {
    ElectionManager: electionManagerAddress,
    VoterRegistry: voterRegistryAddress,
    VotingBallot: votingBallotAddress,
    ZKVerifier: zkVerifierAddress,
    ResultTally: resultTallyAddress,
    deployer: deployer.address,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  // Save to blockchain/deployments/
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentsDir, "localhost.json"),
    JSON.stringify(addresses, null, 2)
  );

  // Save .env for backend
  const envContent = `
ELECTION_MANAGER_ADDRESS=${electionManagerAddress}
VOTER_REGISTRY_ADDRESS=${voterRegistryAddress}
VOTING_BALLOT_ADDRESS=${votingBallotAddress}
ZK_VERIFIER_ADDRESS=${zkVerifierAddress}
RESULT_TALLY_ADDRESS=${resultTallyAddress}
DEPLOYER_ADDRESS=${deployer.address}
`.trim();

  fs.writeFileSync(
    path.join(__dirname, "../../backend/.env"),
    envContent
  );

  console.log("✅ Addresses saved to blockchain/deployments/localhost.json");
  console.log("✅ Backend .env updated with contract addresses");

  // ── 8. Summary ─────────────────────────────────────────
  console.log("\n==========================================");
  console.log("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!");
  console.log("==========================================");
  console.log("ElectionManager:", electionManagerAddress);
  console.log("VoterRegistry:  ", voterRegistryAddress);
  console.log("VotingBallot:   ", votingBallotAddress);
  console.log("ZKVerifier:     ", zkVerifierAddress);
  console.log("ResultTally:    ", resultTallyAddress);
  console.log("==========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });