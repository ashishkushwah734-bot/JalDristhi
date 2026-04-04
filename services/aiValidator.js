const { GoogleGenerativeAI } = require('@google/generative-ai');

// The Architect's Way: Pulling the key securely from the environment
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Helper Function: Downloads the image from the URL and converts it 
 * into a format that Gemini Vision can understand (Base64).
 */
async function urlToGenerativePart(url) {
    const response = await fetch(url, {
        headers: {
            "User-Agent": "JalDristhi-App/1.0"
        }
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return {
        inlineData: {
            data: Buffer.from(buffer).toString("base64"),
            mimeType: response.headers.get("content-type") || "image/jpeg",
        },
    };
}

/**
 * Core Function: Analyzes the image and acts as the gatekeeper.
 */
const analyzeImage = async (imageUrl) => {
    try {
        // 1. Initialize the fastest, most cost-effective vision model
        // We force it to return JSON so your server.js doesn't crash parsing text.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });

        // 2. Fetch the image from Cloudinary/AWS
        const imagePart = await urlToGenerativePart(imageUrl);

        // 3. The Ironclad Prompt (This is the secret sauce for accuracy)
        const prompt = `
            You are a strict, expert civic infrastructure AI validator working for the JalDristhi government portal.
            Your ONLY job is to analyze this image and determine if it shows a genuine water-related infrastructure issue.
            
            Valid categories: 'Leak', 'Clogging', 'Waterlogging', 'Water Quality', 'blocked drainage', 'open tap', 'handpump/Motor Failure'.
            
            RULES:
            1. If the image is a selfie, a meme, a random landscape, a screenshot, or unrelated to water infrastructure, REJECT IT.
            2. If the image is too blurry to tell, REJECT IT.
            3. If it is a valid water issue, ACCEPT IT and categorize it.

            Respond ONLY with this exact JSON structure:
            {
                "isWaterIssue": boolean,
                "issueType": "String (One of the valid categories, or 'None')",
                "confidence": number (0-100),
                "summary": "String (1-2 clear sentences explaining exactly why it was accepted or rejected)"
            }
        `;

        // 4. Send to Gemini
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text();

        // 5. Parse the AI's response back into a Javascript Object
        const aiVerdict = JSON.parse(responseText);
        
        return aiVerdict;

    } catch (error) {
        console.error("❌ AI Validation System Failure:", error);
        
        // If the AI crashes or the image URL is broken, safely reject the report
        return { 
            isWaterIssue: false, 
            issueType: "Error",
            confidence: 0,
            summary: "System failed to validate image. Rejected for safety." 
        };
    }
};

module.exports = { analyzeImage };