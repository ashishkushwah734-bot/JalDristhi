<<<<<<< HEAD
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { z } = require('zod');
const path = require('path'); // 🟢 FIX 1: THIS LINE PREVENTS THE CRASH

const scriptPath = path.join(__dirname, './scripts/ph_detector.py');

// --- Import Custom Services & Models ---
const Report = require('./models/Report');
const { analyzeImage } = require('./services/aiValidator');
const { detectPhLevel } = require('./services/phAnalyzer');

const app = express();

// --- Middleware ---
app.use(cors()); // Allows Ashu's React app to connect
app.use(express.json()); // Allows server to read JSON bodies

// --- Zod Validation Blueprint ---
const reportValidationSchema = z.object({
  reporterName: z.string().min(2, "Name must be at least 2 characters"),
  issueType: z.enum(['Leak', 'Clogging', 'Waterlogging', 'Water Quality']),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string().optional()
  }),
  imageUrl: z.string() // Using standard string since you might test with local file names now
});

// ==========================================
//           API ROUTES
// ==========================================

// 1. CREATE: Accept a new report from Arnav's Flutter app
app.post('/submit-report', async (req, res) => {
  try {
    // Step A: Validate the incoming Flutter request body
    const validatedData = reportValidationSchema.parse(req.body);

    // Step B: Ask Gemini to analyze the image
    console.log(`🤖 Analyzing image: ${validatedData.imageUrl}...`);
    const aiVerdict = await analyzeImage(validatedData.imageUrl);

    // Step C: Reject if Gemini says it's not a water issue
    if (!aiVerdict.isWaterIssue) {
      return res.status(400).json({
        success: false,
        message: "Image rejected. AI determined this is not a valid water infrastructure issue.",
        aiSummary: aiVerdict.summary
      });
    }
    
    console.log("✅ Gemini Approved. Running Computer Vision pH Analysis...");

    // Step D: Calculate pH using Python Microservice
    const calculatedPh = await detectPhLevel(validatedData.imageUrl);

    // Step E: Save the verified data to MongoDB Atlas
    const newReport = new Report({
      reporterName: validatedData.reporterName,
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

// 2. READ: Fetch all reports for Ashu's React Dashboard
app.get('/api/reports', async (req, res) => {
  try {
    // Fetch all reports, sorting them from newest to oldest
    const reports = await Report.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, message: 'Server Error fetching reports' });
  }
});

// 3. UPDATE: Change the status of a specific report (Pending -> Resolved)
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

const PORT = process.env.PORT || 5000;
// 🟢 FIX 2: ADD '0.0.0.0' FOR DOCKER NETWORKING
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Master Server running on port ${PORT}`));
=======
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

// 1. Tell Express to use Render's dynamic port, or fallback to 5000 locally
const PORT = process.env.PORT || 5000;

// 2. Bind to '0.0.0.0' so the Docker container accepts outside traffic
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Master Server running on port ${PORT}`);
});
