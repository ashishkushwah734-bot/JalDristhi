require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { z } = require('zod');
const path = require('path');

const scriptPath = path.join(__dirname, './scripts/ph_detector.py');

// --- Import Custom Services & Models ---
const Report = require('./models/Report');
const { analyzeImage } = require('./services/aiValidator');
const { detectPhLevel } = require('./services/phAnalyzer');

const app = express();

// --- Middleware ---
app.use(cors()); // Allows Ashu's React app to connect
app.use(express.json()); // Allows server to read JSON bodies
app.use('/', express.static(path.join(__dirname, 'public'))); // Serve Official Dashboard

// --- In-memory store for OTPs (for testing only) ---
const otps = {};

// --- Zod Validation Blueprint ---
const reportValidationSchema = z.object({
  reporterName: z.string().min(2, "Name must be at least 2 characters"),
  aadharNumber: z.string().optional(),
  landmark: z.string().optional(),
  issueType: z.enum(['Leak', 'Clogging', 'Waterlogging', 'Water Quality']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional()
  }),
  imageUrl: z.string() 
});

// ==========================================
//       API ROUTES - AUTHENTICATION
// ==========================================

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
    const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.MockToken123";
    delete otps[phone]; // Clear OTP after successful use
    return res.json({ success: true, token: mockToken });
  }

  res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
});

// ==========================================
//       API ROUTES - REPORTS
// ==========================================

// 3. CREATE: Accept a new report from Arnav's Flutter app
app.post('/submit-report', async (req, res) => {
  try {
    const validatedData = reportValidationSchema.parse(req.body);
    console.log(`🤖 Analyzing image: ${validatedData.imageUrl}...`);
    
    const aiVerdict = await analyzeImage(validatedData.imageUrl);

    if (!aiVerdict.isWaterIssue) {
      return res.status(400).json({
        success: false,
        message: "Image rejected. AI determined this is not a valid water infrastructure issue.",
        aiSummary: aiVerdict.summary
      });
    }
    
    console.log("✅ Gemini Approved. Running Computer Vision pH Analysis...");
    const calculatedPh = await detectPhLevel(validatedData.imageUrl);

    const newReport = new Report({
      reporterName: validatedData.reporterName,
      aadharNumber: validatedData.aadharNumber,
      landmark: validatedData.landmark,
      issueType: validatedData.issueType,
      location: validatedData.location,
      imageUrl: validatedData.imageUrl,
      aiValidation: aiVerdict,
      phLevel: calculatedPh
    });

    const savedReport = await newReport.save();

    res.status(201).json({
      success: true,
      message: '🌊 Verified water report safely stored!',
      data: savedReport
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: 'Invalid data format', errors: error.issues });
    }
    console.error("Backend Error:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// 4. READ: Fetch all reports for Ashu's React Dashboard
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, message: 'Server Error fetching reports' });
  }
});

// 5. UPDATE: Change the status of a specific report (Pending -> Resolved)
app.patch('/api/reports/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Pending', 'In Progress', 'Resolved'];
    
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id, 
      { status: status },
      { new: true } 
    );

    if (!updatedReport) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      message: `Report status updated to ${status}`,
      data: updatedReport
    });

  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ success: false, message: 'Server Error updating status' });
  }
});

// ==========================================
//       DATABASE & SERVER INITIALIZATION
// ==========================================

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('🌊 JalDristhi Database Connected Successfully!'))
  .catch(err => console.error('DB Connection Error:', err));

// Single point of truth for Render Port Binding
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Master Server running on port ${PORT}`);
});
