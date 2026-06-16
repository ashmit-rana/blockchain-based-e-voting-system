const mongoose = require("mongoose");

const candidateSchema = new mongoose.Schema({
  candidateId: { type: Number, required: true },
  name: { type: String, required: true },
  party: { type: String, required: true },
  imageUrl: { type: String },
  voteCount: { type: Number, default: 0 },
});

const electionSchema = new mongoose.Schema(
  {
    electionId: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    electionType: {
      type: String,
      enum: ["GENERAL", "UNIVERSITY", "CORPORATE"],
      required: true,
    },
    status: {
      type: String,
      enum: ["CREATED", "ACTIVE", "PAUSED", "CLOSED", "TALLIED"],
      default: "CREATED",
    },
    candidates: [candidateSchema],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    totalVotes: { type: Number, default: 0 },
    createdBy: { type: String, required: true },
    ipfsMetadataHash: { type: String },
    winnerId: { type: Number },
    winnerName: { type: String },
    isTied: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Election", electionSchema);