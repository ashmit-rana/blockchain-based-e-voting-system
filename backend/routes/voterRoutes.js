const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTPAndRegister, loginVoter, getProfile } = require("../controllers/voterController");
const { protect } = require("../middleware/auth");

router.post("/send-otp", sendOTP);
router.post("/register", verifyOTPAndRegister);
router.post("/login", loginVoter);
router.get("/profile", protect, getProfile);

module.exports = router;