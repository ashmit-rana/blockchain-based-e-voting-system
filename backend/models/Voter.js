const mongoose = require("mongoose");

const voterSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    aadhaarHash: {
      type: String,
      required: true,
      unique: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    isRegistered: { type: Boolean, default: true },
    zkCommitment: { type: String },
    electionType: {
      type: String,
      enum: ["GENERAL", "UNIVERSITY", "CORPORATE"],
      required: true,
    },
    votedElections: [{ type: Number }],
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Voter", voterSchema);