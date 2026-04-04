// Initialize Leaflet Map Centered near New Delhi (default backend test location)
const map = L.map('map', {
    zoomControl: false // Move zoom control later if needed
}).setView([28.7041, 77.1025], 11);

// Add Dark Theme CartoDB Tile Layer for a premium aesthetic
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

// Add zoom control to top right so it doesn't overlap sidebar
L.control.zoom({ position: 'topright' }).addTo(map);

// Global State
let renderedReportIds = new Set();
let isFirstLoad = true;

/**
 * Core Engine: Fetch strictly validated reports from the Master Server
 */
const fetchReports = async () => {
    try {
        const res = await fetch('https://jaldristhi-8.onrender.com/api/reports');
        if (!res.ok) throw new Error("API Network response irregular.");
        const data = await res.json();
        
        if (data.success) {
            document.getElementById('total-count').innerText = data.data.length;
            processAndRenderReports(data.data);
            
            // Sync UI active state
            const statusNode = document.getElementById('live-status');
            if (statusNode.innerText === "Offline") {
                statusNode.innerText = "Monitoring Live";
                statusNode.classList.remove('error');
            }
        }
    } catch (err) {
        console.error("Dashboard Sync Failed:", err);
        const statusNode = document.getElementById('live-status');
        statusNode.innerText = "Offline";
        statusNode.classList.add('error');
    }
};

/**
 * Handle new data and trigger flash animations for anything previously unseen
 */
const processAndRenderReports = (reports) => {
    let unacknowledgedDrops = false;
    let latestReportCoords = null;

    // Reports are assumed sorted purely newest-first from the API endpoint
    // Reverse iterating to render oldest-first in DOM so newest appear on top
    reports.slice().reverse().forEach(report => {
        if (!renderedReportIds.has(report._id)) {
            renderedReportIds.add(report._id);
            
            // If it's not the initial browser load, it's a REAL-TIME incoming report!
            const isFreshRealTimeDrop = !isFirstLoad;
            
            plotMarkerOnMap(report, isFreshRealTimeDrop);
            injectSidebarCard(report, isFreshRealTimeDrop);
            
            if (isFreshRealTimeDrop) {
                unacknowledgedDrops = true;
                latestReportCoords = [report.location.latitude, report.location.longitude];
            }
        }
    });
    
    // Aesthetic Feedback System
    if (unacknowledgedDrops) {
        triggerTextFlash();
        // Dynamically fly the map camera to the newest problem zone
        if (latestReportCoords) {
            map.flyTo(latestReportCoords, 14, { animate: true, duration: 1.5 });
        }
    }
    
    isFirstLoad = false;
};

/**
 * Visual Beacon Map Renderer
 */
const plotMarkerOnMap = (report, shouldFlash) => {
    const lat = report.location?.latitude || 28.7041;
    const lng = report.location?.longitude || 77.1025;
    
    // Calculate CSS Classes
    let baseTheme = 'standard';
    if (report.issueType === 'Leak') baseTheme = 'leak';
    if (report.issueType === 'Clogging') baseTheme = 'clogging';
    if (report.issueType === 'Water Quality') baseTheme = 'waterquality';
    
    let containerClasses = `beacon ${baseTheme}`;
    // If it's new, give it the massive glowing green strobe effect!
    if (shouldFlash) {
        containerClasses += ' flashing';
    }

    const htmlIcon = L.divIcon({
        className: 'custom-icon-wrapper',
        html: `<div class="${containerClasses}"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10], // perfectly center
        popupAnchor: [0, -15]
    });

    const marker = L.marker([lat, lng], { icon: htmlIcon }).addTo(map);
    
    // Build tooltip with Gemini AI confidence ratings
    const aiConf = report.aiValidation?.confidence ? `${Math.round(report.aiValidation.confidence)}%` : 'N/A';
    
    marker.bindPopup(`
        <div class="popup-content">
            <h3>${report.issueType}</h3>
            <p><strong>Reporter:</strong> ${report.reporterName || 'Anonymous'}</p>
            <p><strong>Status:</strong> ${report.status || 'Pending'}</p>
            <p><strong>AI Verified:</strong> ${aiConf}</p>
            <p style="font-size: 11px; opacity: 0.7; margin-top: 5px;">${new Date(report.createdAt).toLocaleString()}</p>
        </div>
    `);

    // Self-destruct flashing mechanism after 10 seconds so it blends into normal views over time
    if (shouldFlash) {
        setTimeout(() => {
            const updatedIcon = L.divIcon({
                className: 'custom-icon-wrapper',
                html: `<div class="beacon ${baseTheme}"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10],
                popupAnchor: [0, -15]
            });
            marker.setIcon(updatedIcon);
        }, 12000); 
    }
};

/**
 * Activity Feed Builder
 */
const injectSidebarCard = (report, animate) => {
    const container = document.getElementById('feeds-container');
    const div = document.createElement('div');
    div.className = 'feed-card';
    if (animate) div.classList.add('new-feed-anim');
    
    const timeStr = new Date(report.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    div.innerHTML = `
        <span>${timeStr}</span>
        <h4>${report.issueType}</h4>
        <p>${report.reporterName || 'Anonymous Citizen'}</p>
    `;

    // Snap to zone on click
    div.onclick = () => {
        map.flyTo([report.location.latitude, report.location.longitude], 15, { duration: 1 });
    };

    // Prepend puts newest at the top
    container.prepend(div);
};

const triggerTextFlash = () => {
    const statusEl = document.getElementById('live-status');
    statusEl.innerText = "🚨 NEW REPORT ACTIVE";
    statusEl.classList.add('flashing-text');
    
    setTimeout(() => {
        statusEl.innerText = "Monitoring Live";
        statusEl.classList.remove('flashing-text');
    }, 6000);
};

// Application Boot Sequence
console.log("🌊 JalDristhi Command Center Initializing...");
fetchReports(); // Genesis block load

// Telemetry heartbeat (Sync backend states every 5 seconds)
setInterval(fetchReports, 5000);
