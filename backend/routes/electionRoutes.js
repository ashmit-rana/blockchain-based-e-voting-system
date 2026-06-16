const express = require("express");
const router = express.Router();
const {
  adminLogin, createElection, getAllElections,
  getElection, activateElection, closeElection
} = require("../controllers/electionController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/admin-login", adminLogin);
router.get("/", getAllElections);
router.get("/:id", getElection);
router.post("/", protect, adminOnly, createElection);
router.put("/:electionId/activate", protect, adminOnly, activateElection);
router.put("/:electionId/close", protect, adminOnly, closeElection);

module.exports = router;