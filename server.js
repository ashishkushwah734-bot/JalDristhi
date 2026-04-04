const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Enable CORS so your React frontend can communicate with this backend
app.use(cors());
app.use(express.json());

// In-memory store for OTPs (for testing only)
const otps = {};

// 1. Send OTP Endpoint
app.post('/api/send-otp', (req, res) => {
  const { phone } = req.body;

  if (!phone || phone.length !== 10) {
    return res.status(400).json({ success: false, error: 'Invalid phone number' });
  }

  // Generate a mock 4-digit OTP
  const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
  otps[phone] = mockOtp; // store it

  console.log(`\n========================================`);
  console.log(`[ALERT] OTP requested for ${phone}`);
  console.log(`[ALERT] The OTP is: ${mockOtp}`);
  console.log(`========================================\n`);

  // Simulate success response
  res.json({ success: true, message: 'OTP sent successfully' });
});

// 2. Verify OTP Endpoint
app.post('/api/verify-otp', (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ success: false, error: 'Phone and OTP are required' });
  }

  // Check if OTP matches
  if (otps[phone] && otps[phone] === otp) {
    // Return a mock token on success
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MockToken123";

    // Clear OTP after successful use
    delete otps[phone];

    return res.json({ success: true, token: mockToken });
  }

  // If OTP doesn't match
  res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
});

app.listen(PORT, () => {
  console.log(`Backend server successfully running at http://localhost:${PORT}`);
  console.log(`Waiting for Next JS / React to send OTP requests...`);
});

