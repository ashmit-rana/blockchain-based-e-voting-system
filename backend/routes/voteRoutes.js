const express = require("express");
const router = express.Router();
const { castVote, getElectionResults, checkVoteStatus } = require("../controllers/voteController");
const { protect } = require("../middleware/auth");

router.post("/cast", protect, castVote);
router.get("/results/:electionId", getElectionResults);
router.get("/status/:electionId", protect, checkVoteStatus);

module.exports = router;