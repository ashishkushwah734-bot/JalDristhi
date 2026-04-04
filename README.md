# 🌊 JalDristhi: Live Infrastructure Command Center

**JalDristhi** is a robust, full-stack intelligence platform built to monitor, report, and analyze urban water infrastructure anomalies (such as pipeline leakages, drain clogging, and severe water contamination). 

It bridges the gap between active citizens and government officials through a secure reporting workflow, utilizing cutting-edge **Google Gemini AI** to automatically validate all photographic evidence.

---

## 🏗 System Architecture

JalDristhi is composed of a unified monolithic backend that securely serves two independent, highly premium frontend environments:

1. **The Citizen Portal (Input App)**: A mobile-first Progressive Web App (PWA) available at `/citizen`. It features native HTML5 GPS scraping, direct Cloudinary file-stream uploading, and a clean interface for citizens to submit incident reports.
2. **The Official Dashboard (Command Center)**: A dark-themed, glassmorphic mapping hub available at `/`. It utilizes Leaflet.js to plot, monitor, and flash incoming reports dynamically in real-time.
3. **The Core Logic (Backend)**: An Express.js node pushing all architecture securely to MongoDB. 
4. **AI Validation Layer**: Every report submission is routed through a Google Gemini 2.5 integration that mathematically assesses the provided image to verify whether it genuinely depicts a water infrastructure failure, assigning it a confidence score and a summarized diagnostic text.

---

## 🚀 Features
- **AI Image Integrity:** Automatically rejects spam or unrelated image uploads by running visual AI models on citizen payloads.
- **Dynamic Flashing Beacons:** Official map updates dynamically every 5 seconds. New reports trigger a highly visible green-beacon flash across the command dashboard.
- **One-Click Official Reports:** Government officials can instantly download formatted `.txt` dossiers outlining specific Aadhaar profiles, AI confidence variables, and geolocation mapping data directly from the system map. 
- **Cloudinary Hooked:** Safely handles file sizes by instantly routing user images to a Cloudinary CDN and caching only the optimal secure URL to the primary database.

---

## 💻 Local Setup & Deployment

1. **Clone the Directory:**
```sh
git clone https://github.com/ashishkushwah734-bot/JalDristhi.git
cd JalDristhi
```

2. **Install Module Dependencies:**
```sh
npm install
```

3. **Configure Environment Variables:**
Create a `.env` file tightly secured in your root directory containing:
```
PORT=5000
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0...
GEMINI_API_KEY=AIzaSyA_...
```

4. **Initialize Master Server:**
```sh
node server.js
```
The server will now simultaneously host:
- Government Dashboard: `http://localhost:5000/`
- Citizen Data Application: `http://localhost:5000/citizen/`

---

## 📡 Essential REST APIs

* `GET /api/reports`: Pulls the complete master log array from MongoDB.
* `POST /submit-report`: The central ingestion point. Triggers Gemini AI model evaluation, ensures validity, logs standard Aadhar/Description bounds, and generates a new record.
* `POST /api/send-otp`: Simple authentication tunnel routing.
* `PATCH /api/reports/:id/status`: Manual command interface allowing updates to report life cycles (`Pending`, `In Progress`, `Resolved`).

*This project heavily relies on secure `.env` configurations. Never deploy to production platforms like Render without migrating your active MongoDB and Gemini API constants first!*
