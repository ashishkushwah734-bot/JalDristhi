const { GoogleGenerativeAI } = require('@google/generative-ai');

// The Architect's Way: Pulling the key securely from the environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeImage = async (imageUrl) => {
    // ... rest of the Gemini AI logic ...
}