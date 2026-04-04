const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  reporterName: { 
    type: String, 
    required: true 
  },
  aadharNumber: { 
    type: String,
    default: 'Not Provided'
  },
  landmark: {
    type: String,
    default: 'Not Provided'
  },
  issueType: { 
    type: String, 
    enum: ['Leak', 'Clogging', 'Waterlogging', 'Water Quality'], 
    required: true 
  },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String }
  },
  imageUrl: { 
    type: String, 
    required: true // We need this from Cloudinary to run our Gemini AI and OpenCV checks later
  },
  phLevel: { 
    type: Number, 
    default: null // Will be updated by your Python script later
  },
  aiValidation: {
    isWaterIssue: { type: Boolean, default: null },
    summary: { type: String, default: '' } // Gemini's analysis
  },
  status: { 
    type: String, 
    enum: ['Pending', 'In Progress', 'Resolved'], 
    default: 'Pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Report', ReportSchema);