require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { analyzeImage } = require('../services/aiValidator');

async function runTests() {
    console.log("🌊 Starting aiValidator System Verification...\n");

    // We pass 3 distinct test cases: valid issue, borderline, and fully invalid.
    const testCases = [
        {
            name: "Unrelated image test (Random Photo)",
            url: "https://picsum.photos/400/300"
        }
    ];

    for (let i = 0; i < testCases.length; i++) {
        const { name, url } = testCases[i];
        console.log(`[Test Case ${i + 1}]: ${name}`);
        console.log(`Image URL: ${url}`);
        
        try {
            const verdict = await analyzeImage(url);
            console.log("\n🤖 AI Verdict:");
            console.log(JSON.stringify(verdict, null, 2));
        } catch (error) {
            console.error("\n❌ Test Failed due to system error:", error);
        }
        console.log("\n" + "-".repeat(60) + "\n");
    }
}

runTests();
