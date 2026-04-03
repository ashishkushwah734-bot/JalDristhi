require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { z } = require('zod');
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
app.listen(PORT, () => console.log(`🚀 Master Server running on port ${PORT}`));