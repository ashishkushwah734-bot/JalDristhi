/**
 * CITIZEN PWA LOGIC CORE
 */

// Global State
let currentOTP = null;
let imageBlob = null;
let mediaStream = null;
let profileData = {};

// --- ROUTING ---
const navTo = (screenId) => {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    // Automatic cleanup side-effects
    if(screenId !== 'screen-report') stopCamera();
};

// --- AUTHENTICATION WIZARD ---
const requestOTP = () => {
    const mobile = document.getElementById('mobile-input').value;
    if (mobile.length !== 10) return alert("Please enter a valid 10 digit mobile number.");
    
    // Generate secure demo OTP
    currentOTP = Math.floor(1000 + Math.random() * 9000).toString();
    document.getElementById('demo-otp-value').innerText = currentOTP;
    navTo('screen-otp');
};

const verifyOTP = () => {
    const input = document.getElementById('otp-input').value;
    if (input === currentOTP) {
        // If profile exists locally, jump straight to dashboard
        const stored = localStorage.getItem('JalCitizenProfile');
        if (stored) {
            profileData = JSON.parse(stored);
            buildDashboard();
            navTo('screen-dashboard');
        } else {
            navTo('screen-profile');
        }
    } else {
        alert("Invalid Security Code. Please try again.");
    }
};

const saveProfile = () => {
    const name = document.getElementById('profile-name').value;
    if (!name) return alert("Name is structurally required by the database.");
    
    profileData = {
        name: name,
        aadhar: document.getElementById('profile-aadhar').value || "Not Provided",
        address: document.getElementById('profile-address').value || "Not Provided"
    };
    
    localStorage.setItem('JalCitizenProfile', JSON.stringify(profileData));
    buildDashboard();
    navTo('screen-dashboard');
};

const logout = () => {
    localStorage.removeItem('JalCitizenProfile');
    navTo('screen-auth');
};

const buildDashboard = () => {
    document.getElementById('welcome-text').innerText = `Welcome, ${profileData.name.split(' ')[0]}`;
};

// --- REPORTING WIZARD (HARDWARE INTEGRATION) ---
const openCameraWizard = () => {
    navTo('screen-report');
    resetFormState();
    startCamera();
};

const startCamera = async () => {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        document.getElementById('camera-feed').srcObject = mediaStream;
    } catch (err) {
        console.warn("Camera API failed/denied. Fallback to file upload possible.", err);
    }
};

const stopCamera = () => {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
};

const snapPhoto = () => {
    const video = document.getElementById('camera-feed');
    const canvas = document.getElementById('photo-canvas');
    const context = canvas.getContext('2d');
    
    // Map dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Extract Blob
    canvas.toBlob((blob) => {
        imageBlob = blob;
        freezePreview(URL.createObjectURL(blob));
    }, 'image/jpeg', 0.8);
};

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
        imageBlob = file;
        freezePreview(URL.createObjectURL(file));
    }
};

const freezePreview = (url) => {
    document.getElementById('camera-feed').style.display = 'none';
    const preview = document.getElementById('photo-preview');
    preview.src = url;
    preview.style.display = 'block';
    
    document.querySelector('.camera-controls').style.display = 'none';
    document.getElementById('report-form-box').style.display = 'flex'; // Reveal form
    stopCamera();
};

const resetFormState = () => {
    imageBlob = null;
    document.getElementById('camera-feed').style.display = 'block';
    document.getElementById('photo-preview').style.display = 'none';
    document.querySelector('.camera-controls').style.display = 'flex';
    document.getElementById('report-form-box').style.display = 'none';
    document.getElementById('issue-desc').value = '';
    document.getElementById('issue-landmark').value = '';
};

// --- SUBMISSION PIPELINE ---
const submitFinalReport = async () => {
    if (!imageBlob) return alert("System requires valid photo logical evidence.");
    
    const uiLoading = document.getElementById('loading-overlay');
    const uiText = document.getElementById('loading-text');
    uiLoading.style.display = 'flex';

    try {
        // Step 1: Capture Secure GPS Automatics
        uiText.innerText = "Triangulating GPS...";
        const coords = await getGPS();

        // Step 2: Upload to Cloudinary (Unsigned API configured with user variables)
        uiText.innerText = "Transmitting Image to Cloudinary...";
        const formData = new FormData();
        formData.append("file", imageBlob);
        formData.append("upload_preset", "JalDristhi"); // Given presigned hook!
        
        const cloudReq = await fetch('https://api.cloudinary.com/v1_1/dlejvcudl/image/upload', {
            method: 'POST', body: formData
        });
        const cloudData = await cloudReq.json();
        if (!cloudData.secure_url) throw new Error("Cloudinary upload rejected.");

        // Step 3: Package final form structure and submit to Express Backend
        uiText.innerText = "Verifying Incident w/ Gemini AI...";
        let userIssueType = document.getElementById('issue-type').value;
        const descriptionTxt = document.getElementById('issue-desc').value;
        
        // Zod validation mapping fallback logic:
        if (userIssueType === "Water Contamination") userIssueType = "Water Quality";
        if (userIssueType === "Other") userIssueType = "Leak"; // Fallback to acceptable ENUM structure
        
        const payload = {
            reporterName: profileData.name,
            aadharNumber: profileData.aadhar,
            landmark: document.getElementById('issue-landmark').value || profileData.address,
            description: descriptionTxt,
            issueType: userIssueType,
            location: coords,
            imageUrl: cloudData.secure_url
        };

        // Standard dynamic routing so it works locally and on Render effortlessly.
        const masterReq = await fetch('/submit-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const masterData = await masterReq.json();

        if (masterReq.ok || (masterReq.status === 400 && masterData.message)) {
            // Usually 400 is AI rejecting the image safety.
            if (!masterReq.ok) {
                alert("AI VALIDATION FAILED: " + (masterData.aiSummary || masterData.message));
            } else {
                alert("SUCCESS! Report Dispatched to Command Dashboard.");
            }
            navTo('screen-dashboard');
        } else {
            throw new Error(masterData.message || "Unknown backend fault.");
        }
        
    } catch (err) {
        console.error(err);
        alert(`Transmission Error: ${err.message}`);
    } finally {
        uiLoading.style.display = 'none';
    }
};

const getGPS = () => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve({ latitude: 28.6139, longitude: 77.2090 }); // Default New Delhi stub
        } else {
            navigator.geolocation.getCurrentPosition(
                (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
                (err) => {
                    console.warn("GPS Disabled by User. Falling back to default locale.", err);
                    resolve({ latitude: 28.6139, longitude: 77.2090 });
                },
                { enableHighAccuracy: true, timeout: 5000 }
            );
        }
    });
};

// Check load states
if (localStorage.getItem('JalCitizenProfile')) {
    profileData = JSON.parse(localStorage.getItem('JalCitizenProfile'));
    buildDashboard();
    navTo('screen-dashboard');
}
