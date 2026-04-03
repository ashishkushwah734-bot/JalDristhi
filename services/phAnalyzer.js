const { spawn } = require('child_process');
const path = require('path');

const detectPhLevel = (imageUrl) => {
  return new Promise((resolve, reject) => {
    // Point to your python script
    const scriptPath = path.join(__dirname, '../scripts/ph_detector.py');
    
    // In Docker, the command is 'python3'
    const pythonProcess = spawn('python3', [scriptPath, imageUrl]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Script Error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
      try {
        // We expect the python script to print a JSON string
        const result = JSON.parse(dataString);
        if (result.success) {
          resolve(result.phLevel);
        } else {
          console.log("Python script failed, defaulting to pH 7.0");
          resolve(7.0); // Fallback so the server doesn't crash
        }
      } catch (e) {
        console.error("Failed to parse Python output. Output was:", dataString);
        resolve(7.0); // Fallback safe value
      }
    });
  });
};

module.exports = { detectPhLevel };