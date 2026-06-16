const axios = require("axios");
const crypto = require("crypto");

// Stores OTPs temporarily in memory (use Redis in production)
const otpStore = new Map();

// ── Generate OTP ───────────────────────────────────────
const sendAadhaarOTP = async (aadhaarNumber) => {
  try {
    // Validate Aadhaar format (12 digits)
    if (!/^\d{12}$/.test(aadhaarNumber)) {
      throw new Error("Invalid Aadhaar number format");
    }

    // In sandbox mode we simulate OTP sending
    // In production this calls the real UIDAI API
    if (process.env.NODE_ENV === "development") {
      const otp = "123456"; // sandbox OTP
      const txnId = `TXN_${Date.now()}`;

      // Store OTP with 5 min expiry
      otpStore.set(txnId, {
        otp,
        aadhaarNumber,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      console.log(`[SANDBOX] OTP for ${aadhaarNumber}: ${otp}, txnId: ${txnId}`);
      return { success: true, txnId, message: "OTP sent successfully" };
    }

    // Production UIDAI API call
    const response = await axios.post(
      `${process.env.AADHAAR_SANDBOX_URL}/api/v1/otp`,
      {
        uid: aadhaarNumber,
        clientId: process.env.AADHAAR_AUA_CODE,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AADHAAR_LICENSE_KEY}`,
        },
      }
    );

    return {
      success: true,
      txnId: response.data.txnId,
      message: "OTP sent successfully",
    };
  } catch (error) {
    throw new Error(`OTP send failed: ${error.message}`);
  }
};

// ── Verify OTP ─────────────────────────────────────────
const verifyAadhaarOTP = async (txnId, otp, aadhaarNumber) => {
  try {
    if (process.env.NODE_ENV === "development") {
      const stored = otpStore.get(txnId);

      if (!stored) throw new Error("Invalid or expired transaction");
      if (Date.now() > stored.expiresAt) {
        otpStore.delete(txnId);
        throw new Error("OTP expired");
      }
      if (stored.otp !== otp) throw new Error("Invalid OTP");
      if (stored.aadhaarNumber !== aadhaarNumber) throw new Error("Aadhaar mismatch");

      otpStore.delete(txnId);

      // Return hashed Aadhaar — never store raw
      const aadhaarHash = hashAadhaar(aadhaarNumber);
      return { success: true, aadhaarHash, verified: true };
    }

    // Production verification
    const response = await axios.post(
      `${process.env.AADHAAR_SANDBOX_URL}/api/v1/verify`,
      { txnId, otp },
      {
        headers: {
          Authorization: `Bearer ${process.env.AADHAAR_LICENSE_KEY}`,
        },
      }
    );

    if (response.data.verified) {
      const aadhaarHash = hashAadhaar(aadhaarNumber);
      return { success: true, aadhaarHash, verified: true };
    }

    throw new Error("OTP verification failed");
  } catch (error) {
    throw new Error(`Verification failed: ${error.message}`);
  }
};

// ── Hash Aadhaar (never store raw) ────────────────────
const hashAadhaar = (aadhaarNumber) => {
  return "0x" + crypto
    .createHash("sha256")
    .update(aadhaarNumber + process.env.JWT_SECRET)
    .digest("hex");
};

module.exports = { sendAadhaarOTP, verifyAadhaarOTP, hashAadhaar };