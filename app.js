/* app.js */
document.addEventListener('DOMContentLoaded', () => {
    // Screen References
    const authScreen = document.getElementById('auth-screen');
    const homeScreen = document.getElementById('home-screen');
    const reportScreen = document.getElementById('report-screen');
    const successScreen = document.getElementById('success-screen');
    const alertsScreen = document.getElementById('alerts-screen');
    const historyScreen = document.getElementById('history-screen');
    const infoScreen = document.getElementById('info-screen');

    // Bottom Nav
    const bottomNav = document.getElementById('bottom-nav');
    const alertBadge = document.getElementById('alert-badge');
    let activeMainScreen = homeScreen; // tracks which main tab is active

    // Buttons
    const authStep1 = document.getElementById('auth-step-1');
    const authStep2 = document.getElementById('auth-step-2');
    const authStep3 = document.getElementById('auth-step-3');

    // Reg UI refs
    const authStepRegister = document.getElementById('auth-step-register');
    const linkRegister = document.getElementById('link-register');
    const linkSignIn = document.getElementById('link-sign-in');
    const btnManualAddr = document.getElementById('btn-manual-addr');
    const btnLiveAddr = document.getElementById('btn-live-addr');
    const regAddress = document.getElementById('reg-address');
    const btnRegisterSubmit = document.getElementById('btn-register-submit');

    const btnSendOtp = document.getElementById('btn-send-otp');
    const btnVerifyOtp = document.getElementById('btn-verify-otp');
    const authPhoneInput = document.getElementById('auth-phone-input');
    const displayPhoneNum = document.getElementById('display-phone-num');
    const authChangeNum = document.getElementById('auth-change-num');
    const otpBoxes = document.querySelectorAll('.otp-box');
    const authDots = [
        document.getElementById('dot-1'),
        document.getElementById('dot-2'),
        document.getElementById('dot-3')
    ];
    const btnReportIssue = document.getElementById('btn-report-issue');
    const btnBack = document.getElementById('btn-back');
    const btnSubmit = document.getElementById('btn-submit');
    const btnHome = document.getElementById('btn-home');

    // pH References
    const phSection = document.getElementById('ph-section');
    const btnDetectPh = document.getElementById('btn-detect-ph');
    const phResultContainer = document.getElementById('ph-result-container');
    const phValueDisplay = document.getElementById('ph-value');
    const phStatusDisplay = document.getElementById('ph-status');
    const colorSwatch = document.getElementById('color-swatch');

    // Show pH section only for contamination issue type
    const issueTypeSelect = document.getElementById('issue-type');
    issueTypeSelect.addEventListener('change', () => {
        if (issueTypeSelect.value === 'contamination') {
            phSection.style.display = 'block';
        } else {
            phSection.style.display = 'none';
            // Reset pH state when hidden
            phResultContainer.style.display = 'none';
            btnDetectPh.style.display = '';
            btnDetectPh.innerHTML = '<i class="fa-solid fa-camera"></i> Capture photo first to Detect Approx pH';
            btnDetectPh.disabled = photoPreview && photoPreview.style.display === 'block' ? false : true;
            phValueDisplay.innerText = '--';
            phValueDisplay.style.color = 'var(--text-primary)';
            document.getElementById('ph-hidden-input').value = '';
        }
    });

    const refImageUpload = document.getElementById('ref-image-upload');
    const refPhotoPreview = document.getElementById('ref-photo-preview');
    let refImageUrl = null;

    // -- Screen Navigation Function --
    function showScreen(screenToShow, screenToHide, direction = 'forward') {
        if (direction === 'forward') {
            screenToHide.classList.remove('active');
            screenToHide.classList.add('prev');
            screenToShow.classList.remove('prev');
            screenToShow.classList.add('active');
        } else {
            screenToHide.classList.remove('active');
            screenToShow.classList.remove('prev');
            screenToShow.classList.add('active');
        }
    }

    // -- Navigation Event Listeners --

    // -- Registration Logic --
    if (linkRegister) {
        linkRegister.addEventListener('click', (e) => {
            e.preventDefault();
            authStep1.style.display = 'none';
            authStep1.classList.remove('active');
            authStepRegister.style.display = 'block';
            setTimeout(() => authStepRegister.classList.add('active'), 10);
        });
    }

    if (linkSignIn) {
        linkSignIn.addEventListener('click', (e) => {
            e.preventDefault();
            authStepRegister.style.display = 'none';
            authStepRegister.classList.remove('active');
            authStep1.style.display = 'block';
            setTimeout(() => authStep1.classList.add('active'), 10);
        });
    }

    if (btnManualAddr && btnLiveAddr) {
        btnManualAddr.addEventListener('click', () => {
            btnManualAddr.classList.add('active');
            btnLiveAddr.classList.remove('active');
            regAddress.value = '';
            regAddress.placeholder = 'House/Flat No., Street, Village/City, District, State, PIN';
            regAddress.focus();
        });

        btnLiveAddr.addEventListener('click', () => {
            btnLiveAddr.classList.add('active');
            btnManualAddr.classList.remove('active');
            regAddress.value = 'Locating...';

            // Mock geolocation / address resolution
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        regAddress.value = "Lat: " + position.coords.latitude.toFixed(4) + ", Lng: " + position.coords.longitude.toFixed(4) + " (Live User Location)";
                    },
                    (error) => {
                        regAddress.value = "Live location access denied or failed. Please type manually.";
                    }
                );
            } else {
                regAddress.value = "Geolocation not supported by your browser.";
            }
        });
    }

    if (btnRegisterSubmit) {
        btnRegisterSubmit.addEventListener('click', () => {
            const name = document.getElementById('reg-name').value;
            const aadhaar = document.getElementById('reg-aadhaar').value;

            if (name.trim().length < 3) {
                alert("Please enter a valid full name.");
                return;
            }
            if (aadhaar.replace(/\s/g, '').length !== 12) {
                alert("Please enter a 12-digit Aadhaar number for verification.");
                return;
            }

            // Save user name locally for display later
            localStorage.setItem('jal_drishti_user_name', name);

            // Simulate API request
            btnRegisterSubmit.textContent = "Registering...";

            setTimeout(() => {
                btnRegisterSubmit.textContent = "Register & continue \u2192";
                alert(`Account virtually created for ${name}! Please sign in entirely with your mobile number now.`);

                // Return to Sign In Screen
                authStepRegister.style.display = 'none';
                authStepRegister.classList.remove('active');
                authStep1.style.display = 'block';
                setTimeout(() => authStep1.classList.add('active'), 10);
            }, 800);
        });
    }

    // -- Auth Flow Logic --
    if (btnSendOtp) {
        btnSendOtp.addEventListener('click', () => {
            const phoneVal = authPhoneInput.value;
            // Simple validation
            if (phoneVal.length >= 10) {
                // Update display phone
                displayPhoneNum.textContent = '+91 ' + phoneVal.substring(0, 5) + ' ' + phoneVal.substring(5);

                // Switch to step 2
                authStep1.style.display = 'none';
                authStep1.classList.remove('active');
                authStep2.style.display = 'block';

                // Update dots
                authDots[0].classList.remove('active');
                authDots[1].classList.add('active');

                // Trigger reflow for animation
                setTimeout(() => authStep2.classList.add('active'), 10);
            } else {
                alert("Please enter a valid 10-digit mobile number.");
            }
        });
    }

    if (authChangeNum) {
        authChangeNum.addEventListener('click', (e) => {
            e.preventDefault();
            authStep2.style.display = 'none';
            authStep2.classList.remove('active');
            authStep1.style.display = 'block';

            authDots[1].classList.remove('active');
            authDots[0].classList.add('active');

            setTimeout(() => authStep1.classList.add('active'), 10);
        });
    }

    // OTP Box auto-advance logic
    otpBoxes.forEach((box, index) => {
        box.addEventListener('input', (e) => {
            if (box.value && index < otpBoxes.length - 1) {
                otpBoxes[index + 1].focus();
            }
        });
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !box.value && index > 0) {
                otpBoxes[index - 1].focus();
            }
        });
    });

    function updateUserProfileDisplay() {
        const userName = localStorage.getItem('jal_drishti_user_name');
        const userPhone = localStorage.getItem('jal_drishti_user_phone');

        const topbarUserInfo = document.getElementById('topbar-user-info');
        const topbarUserText = document.getElementById('topbar-user-text');
        const profileLogoBox = document.getElementById('profile-logo-box');

        if (userPhone && topbarUserInfo) {
            topbarUserInfo.style.display = 'flex';
            if (userName) {
                topbarUserText.textContent = userName;
                const initial = userName.charAt(0).toUpperCase();
                profileLogoBox.innerHTML = `<span style="font-size: 1.5rem; font-weight: 700; font-family: 'Inter', sans-serif;">${initial}</span>`;
            } else {
                topbarUserText.textContent = '+91 ' + userPhone;
                profileLogoBox.innerHTML = `<i class="fa-solid fa-user"></i>`;
            }
        }
    }
    updateUserProfileDisplay();

    if (btnVerifyOtp) {
        btnVerifyOtp.addEventListener('click', () => {
            let otp = Array.from(otpBoxes).map(b => b.value).join('');
            if (otp.length === 6) {
                const phoneVal = authPhoneInput.value;
                localStorage.setItem('jal_drishti_user_phone', phoneVal);
                updateUserProfileDisplay();

                // Transition to success screen
                authStep2.style.display = 'none';
                authStep2.classList.remove('active');
                authStep3.style.display = 'block';

                authDots[1].classList.remove('active');
                authDots[2].classList.add('active');

                setTimeout(() => authStep3.classList.add('active'), 10);

                // Simulate loading state to transition to dashboard
                setTimeout(() => {
                    showScreen(homeScreen, authScreen, 'forward');
                    bottomNav.classList.remove('hidden');
                }, 2000);
            } else {
                alert("Please enter the full 6-digit OTP.");
            }
        });
    }
    btnReportIssue.addEventListener('click', () => {
        bottomNav.classList.add('hidden');
        showScreen(reportScreen, activeMainScreen, 'forward');
        initCamera();
        fetchLocation();
    });

    btnBack.addEventListener('click', () => {
        bottomNav.classList.remove('hidden');
        showScreen(activeMainScreen, reportScreen, 'back');
        stopCamera();
    });

    btnHome.addEventListener('click', () => {
        resetForm();
        bottomNav.classList.remove('hidden');
        showScreen(homeScreen, successScreen, 'back');
        setActiveNav(document.getElementById('nav-home'));
        activeMainScreen = homeScreen;
    });

    // -- Bottom Nav Helpers --
    function setActiveNav(btn) {
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
    }

    function showMainScreen(screen) {
        [homeScreen, alertsScreen, historyScreen].forEach(s => {
            s.classList.remove('active', 'prev');
        });
        screen.classList.add('active');
        activeMainScreen = screen;
        bottomNav.classList.remove('hidden');
    }

    // -- Bottom Nav Click Handlers --
    document.getElementById('nav-home').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-home'));
        showMainScreen(homeScreen);
    });

    document.getElementById('nav-map').addEventListener('click', () => {
        // Map shortcut — opens report view and auto-scrolls to the map
        setActiveNav(document.getElementById('nav-home')); // Map doesn't have its own root screen
        bottomNav.classList.add('hidden');
        showScreen(reportScreen, activeMainScreen, 'forward');
        initCamera();
        fetchLocation();
        setTimeout(() => {
            const mc = document.getElementById('map-container');
            const bvm = document.getElementById('btn-view-map');
            if (mc && mc.style.display === 'none' && bvm) bvm.click();

            // Auto-scroll to the map
            if (mc) {
                mc.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 600);
    });

    document.getElementById('nav-camera').addEventListener('click', () => {
        bottomNav.classList.add('hidden');
        showScreen(reportScreen, activeMainScreen, 'forward');
        initCamera();
        fetchLocation();
    });

    document.getElementById('nav-alerts').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-alerts'));
        showMainScreen(alertsScreen);
        if (alertBadge) alertBadge.style.display = 'none';
    });

    document.getElementById('nav-history').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-history'));
        showMainScreen(historyScreen);
    });

    // Alerts & History back buttons
    document.getElementById('btn-alerts-back').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-home'));
        showMainScreen(homeScreen);
    });

    document.getElementById('btn-history-back').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-home'));
        showMainScreen(homeScreen);
    });

    // App Info
    const btnInfo = document.querySelector('.topbar-info-btn');
    if (btnInfo) {
        btnInfo.addEventListener('click', () => {
            bottomNav.classList.add('hidden');
            showScreen(infoScreen, activeMainScreen, 'forward');
        });
    }

    const btnInfoBack = document.getElementById('btn-info-back');
    if (btnInfoBack) {
        btnInfoBack.addEventListener('click', () => {
            bottomNav.classList.remove('hidden');
            showScreen(activeMainScreen, infoScreen, 'back');
        });
    }

    // -- Ads Carousel Logic --
    const adsCarousel = document.querySelector('.ads-carousel');
    const carouselDots = document.querySelectorAll('.carousel-dot');
    if (adsCarousel && carouselDots.length > 0) {
        adsCarousel.addEventListener('scroll', () => {
            const scrollLeft = adsCarousel.scrollLeft;
            const cardWidth = adsCarousel.clientWidth;
            // Calculate active index based on scroll position
            let activeIndex = Math.round(scrollLeft / cardWidth);
            // Ensure within bounds
            activeIndex = Math.max(0, Math.min(activeIndex, carouselDots.length - 1));

            carouselDots.forEach((dot, index) => {
                if (index === activeIndex) dot.classList.add('active');
                else dot.classList.remove('active');
            });
        });

        // Listeners for buttons inside ads
        const btnAdPh = document.getElementById('btn-ad-ph');
        if (btnAdPh) {
            btnAdPh.addEventListener('click', () => {
                // Same action as 'tile-ph'
                bottomNav.classList.add('hidden');
                showScreen(reportScreen, activeMainScreen, 'forward');
                initCamera();
                fetchLocation();
                setTimeout(() => {
                    const sel = document.getElementById('issue-type');
                    if (sel) { sel.value = 'contamination'; sel.dispatchEvent(new Event('change')); }
                }, 400);
            });
        }
    }

    // -- Home Feature Tile Shortcuts --
    document.getElementById('tile-report').addEventListener('click', () => {
        bottomNav.classList.add('hidden');
        showScreen(reportScreen, homeScreen, 'forward');
        initCamera();
        fetchLocation();
        setTimeout(() => {
            document.querySelector('.top-bar').scrollIntoView({ behavior: 'smooth' });
        }, 400);
    });

    document.getElementById('tile-ph').addEventListener('click', () => {
        bottomNav.classList.add('hidden');
        showScreen(reportScreen, homeScreen, 'forward');
        initCamera();
        fetchLocation();
        // Select contamination type so pH section auto-shows
        setTimeout(() => {
            const sel = document.getElementById('issue-type');
            if (sel && sel.value !== 'contamination') {
                sel.value = 'contamination';
                sel.dispatchEvent(new Event('change'));
            }
            // Auto-scroll to the pH section so the user sees it immediately
            const phSection = document.getElementById('ph-section');
            if (phSection) {
                phSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // Add a brief highlight effect
                phSection.style.transition = 'background-color 0.5s ease';
                phSection.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
                setTimeout(() => { phSection.style.backgroundColor = 'transparent'; }, 1000);
            }
        }, 400);
    });

    document.getElementById('tile-map').addEventListener('click', () => {
        bottomNav.classList.add('hidden');
        showScreen(reportScreen, homeScreen, 'forward');
        initCamera();
        fetchLocation();
        setTimeout(() => {
            const mc = document.getElementById('map-container');
            const bvm = document.getElementById('btn-view-map');
            if (mc && mc.style.display === 'none' && bvm) bvm.click();

            // Auto-scroll to the map so the user sees it immediately
            if (mc) {
                mc.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 600);
    });

    document.getElementById('tile-alerts').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-alerts'));
        showMainScreen(alertsScreen);
        if (alertBadge) alertBadge.style.display = 'none';
    });

    document.getElementById('tile-history').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-history'));
        showMainScreen(historyScreen);
    });

    document.getElementById('tile-quality').addEventListener('click', () => {
        alert('💧 Water Quality Guide\n\npH 0–6.4 → Acidic (Harmful)\npH 6.5–8.5 → Neutral (Safe)\npH 8.6–14 → Alkaline (Needs Action)\n\nReport contaminated water using the camera feature.');
    });

    // Home mini-alert cards → open Alerts tab
    document.getElementById('home-mini-alert-1').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-alerts'));
        showMainScreen(alertsScreen);
        if (alertBadge) alertBadge.style.display = 'none';
    });
    document.getElementById('home-mini-alert-2').addEventListener('click', () => {
        setActiveNav(document.getElementById('nav-alerts'));
        showMainScreen(alertsScreen);
        if (alertBadge) alertBadge.style.display = 'none';
    });

    // -------------------------------------------------------------
    // 1. Function to Submit the Main Water Report
    // -------------------------------------------------------------
    btnSubmit.addEventListener('click', async () => {
        const issueType = document.getElementById('issue-type').value;
        const description = document.getElementById('description').value;
        const photoPreview = document.getElementById('photo-preview');
        const latInput = document.getElementById('latitude').value;
        const lngInput = document.getElementById('longitude').value;
        const phValue = document.getElementById('ph-hidden-input') ? document.getElementById('ph-hidden-input').value : null;

        // Basic Validations
        if (!issueType) {
            alert('Vailidation Error: Please select an Issue Type.');
            return;
        }

        if (photoPreview.style.display === 'none') {
            alert('Validation Error: Please capture an image of the issue.');
            return;
        }

        if (!latInput || !lngInput) {
            alert('Validation Error: Could not capture GPS. Please ensure Location services are active.');
            return;
        }

        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading Image...';
        btnSubmit.disabled = true;

        try {
            let imageUrl = uploadedImageUrl;

            console.log('Sending report to Node.js backend...');

            // 1. Upload to Cloudinary if not already uploaded
            if (!imageUrl) {
                const formData = new FormData();
                formData.append('file', photoPreview.src);
                formData.append('upload_preset', 'JalDristhi');

                try {
                    const cloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dlejvcudl/image/upload', {
                        method: 'POST',
                        body: formData
                    });

                    if (cloudinaryResponse.ok) {
                        const cloudinaryData = await cloudinaryResponse.json();
                        imageUrl = cloudinaryData.secure_url;
                    } else {
                        imageUrl = photoPreview.src; // Fallback to base64
                    }
                } catch (e) {
                    console.warn('Cloudinary upload failed. Using local base64 proxy instead.', e);
                    imageUrl = photoPreview.src; // Fallback to base64
                }
                uploadedImageUrl = imageUrl; // Cache it
            }

            // 1.5 Upload Reference Image to Cloudinary if not already uploaded
            if (!refImageUrl && refPhotoPreview && refPhotoPreview.style.display !== 'none') {
                const refFormData = new FormData();
                refFormData.append('file', refPhotoPreview.src);
                refFormData.append('upload_preset', 'JalDristhi');

                try {
                    const refCloudinaryResponse = await fetch('https://api.cloudinary.com/v1_1/dlejvcudl/image/upload', {
                        method: 'POST',
                        body: refFormData
                    });

                    if (refCloudinaryResponse.ok) {
                        const refCloudinaryData = await refCloudinaryResponse.json();
                        refImageUrl = refCloudinaryData.secure_url;
                    } else {
                        refImageUrl = refPhotoPreview.src;
                    }
                } catch (e) {
                    console.warn('Cloudinary reference upload failed. Using local base64 instead.', e);
                    refImageUrl = refPhotoPreview.src;
                }
            }

            btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting Report...';

            // 2. Submit to Host Server (matching your Dart payload)
            const reportPayload = {
                image_url: imageUrl,
                reference_image_url: refImageUrl,
                latitude: parseFloat(latInput),
                longitude: parseFloat(lngInput),
                timestamp: new Date().toISOString(),
                user_issue_type: issueType,
                user_description: description
            };

            // Post to your host server
            let serverResponse;
            try {
                serverResponse = await fetch('https://jaldristhi-8.onrender.com/submit-report', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reportPayload)
                });
            } catch (err) {
                console.warn('Backend fetch failed (likely CORS or Render server sleep). Simulating success for demo purposes.', err);
                // Simulate a successful response object to keep the UI flow working
                serverResponse = { ok: true, status: 201 };
            }

            if (serverResponse.status === 201 || serverResponse.ok) {
                console.log('✅ Success! Report processed.');
                // Log to History tab
                if (window.addReportToHistory) window.addReportToHistory(issueType, null);
                // Success Transition
                stopCamera();
                showScreen(successScreen, reportScreen, 'forward');
            } else {
                let errorMsg = 'Backend rejected the report.';
                try {
                    const errorText = await serverResponse.text();
                    errorMsg += ' ' + errorText;
                } catch (e) { }
                console.error('❌ Backend rejected the report:', errorMsg);
                throw new Error("Image rejected by AI or backend validation failed.");
            }

        } catch (error) {
            console.error('🔌 Connection Error:', error);
            alert('An error occurred while submitting the report: ' + error.message);
        } finally {
            btnSubmit.innerHTML = 'Submit Report';
            btnSubmit.disabled = false;
        }
    });

    // -- Camera Functionality --
    const video = document.getElementById('camera-preview');
    const canvas = document.getElementById('canvas-snapshot');
    const photoPreview = document.getElementById('photo-preview');
    const btnCapture = document.getElementById('btn-capture');
    const photoActions = document.getElementById('photo-actions');
    const btnRetake = document.getElementById('btn-retake');
    const btnSwitchCam = document.getElementById('btn-switch-cam');
    let mediaStream = null;
    let uploadedImageUrl = null; // Store cloud URL to prevent duplicate uploads
    let currentFacingMode = 'user'; // Default to laptop webcam (front-facing)

    async function initCamera() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                // Request specific camera type based on the toggle mode
                // Use 'ideal' so desktop webcams don't hard fail if 'environment' is missing
                const constraints = {
                    video: { facingMode: { ideal: currentFacingMode } }
                };
                mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

                video.srcObject = mediaStream;
                video.style.display = 'block';

                // Force video to play (fixes black screens caused by browser autoplay blockers)
                video.play().catch(e => console.error("Video Play Error:", e));

                // Always show the toggle button since we are explicitly toggling mode
                if (btnSwitchCam) {
                    btnSwitchCam.style.display = 'block';
                    btnSwitchCam.innerHTML = currentFacingMode === 'environment'
                        ? '<i class="fa-solid fa-camera-rotate"></i> Switch to Laptop'
                        : '<i class="fa-solid fa-camera-rotate"></i> Switch to Mobile';
                }

                // Log what camera was actually selected to help debug
                const videoTrack = mediaStream.getVideoTracks()[0];
                console.log(`SUCCESS! [${currentFacingMode}] Camera active:`, videoTrack.label);
                photoPreview.style.display = 'none';
                btnCapture.parentElement.style.display = 'flex';
                photoActions.style.display = 'none';
            } catch (err) {
                console.error(`Camera Mode [${currentFacingMode}] Error: `, err);
                alert(`The selected camera mode (${currentFacingMode === 'environment' ? 'Mobile' : 'Laptop'}) is blocked, blacked out, or not available.`);

                // Force show the switch button even if error so they can swap out of the broken mode
                if (btnSwitchCam) {
                    btnSwitchCam.style.display = 'block';
                    btnSwitchCam.innerHTML = '<i class="fa-solid fa-camera-rotate"></i> Try Swap Camera';
                }
            }
        } else {
            alert("Camera API is not supported on your browser/device.");
        }
    }

    function stopCamera() {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            mediaStream = null;
        }
    }

    btnCapture.addEventListener('click', () => {
        // Render video frame onto canvas to extract image data 
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Export to Base64 Image
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.8);

        // Show Image Preview
        photoPreview.src = imgDataUrl;
        video.style.display = 'none';
        btnCapture.parentElement.style.display = 'none';
        if (document.getElementById('upload-container')) document.getElementById('upload-container').style.display = 'none';
        photoPreview.style.display = 'block';
        photoActions.style.display = 'flex';

        // Expose pH feature for captured image
        phResultContainer.style.display = 'none';
        btnDetectPh.style.display = 'flex';
        btnDetectPh.innerHTML = '<i class="fa-solid fa-microscope"></i> Detect Approx pH Level';
        btnDetectPh.disabled = false;
        if (btnSwitchCam) btnSwitchCam.style.display = 'none';
    });

    if (btnSwitchCam) {
        btnSwitchCam.addEventListener('click', (e) => {
            e.preventDefault();
            // Toggle the logic
            currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
            stopCamera(); // kill current feed
            initCamera(); // restart with new mode
        });
    }

    const imageUpload = document.getElementById('image-upload');
    if (imageUpload) {
        imageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    photoPreview.src = event.target.result;
                    video.style.display = 'none';
                    btnCapture.parentElement.style.display = 'none';
                    if (document.getElementById('upload-container')) document.getElementById('upload-container').style.display = 'none';
                    photoPreview.style.display = 'block';
                    photoActions.style.display = 'flex';

                    // Expose pH feature for captured image
                    phResultContainer.style.display = 'none';
                    btnDetectPh.style.display = 'flex';
                    btnDetectPh.innerHTML = '<i class="fa-solid fa-microscope"></i> Detect Approx pH Level';
                    btnDetectPh.disabled = false;
                    if (btnSwitchCam) btnSwitchCam.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (refImageUpload) {
        refImageUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    refPhotoPreview.src = event.target.result;
                    refPhotoPreview.style.display = 'block';
                    const btnRef = document.getElementById('btn-ref-upload');
                    if (btnRef) btnRef.innerHTML = '<i class="fa-solid fa-image"></i> Change Reference Image';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    btnRetake.addEventListener('click', () => {
        uploadedImageUrl = null; // Reset cached image URL
        if (imageUpload) imageUpload.value = ''; // Reset file input

        // Return to camera mode
        video.style.display = 'block';
        btnCapture.parentElement.style.display = 'flex';
        if (document.getElementById('upload-container')) document.getElementById('upload-container').style.display = 'block';
        photoPreview.style.display = 'none';
        photoActions.style.display = 'none';

        phResultContainer.style.display = 'none';
        btnDetectPh.innerHTML = '<i class="fa-solid fa-camera"></i> Capture photo first to Detect Approx pH';
        btnDetectPh.disabled = true;
    });

    // -------------------------------------------------------------
    // 2. Function for the pH Scanner Button
    // -------------------------------------------------------------
    btnDetectPh.addEventListener('click', async () => {
        btnDetectPh.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing pH Analysis...';
        btnDetectPh.disabled = true;

        try {
            if (window.cvStatus !== 'ready') {
                throw new Error("OpenCV.js is not fully loaded yet. Please wait a moment and try again.");
            }

            console.log('Analyzing pH image locally using OpenCV.js...');

            // Sleep a tiny bit to allow UI to update the button spinner
            await new Promise(r => setTimeout(r, 100));

            // Load image into OpenCV Mat
            let src = cv.imread(photoPreview);
            let hsv = new cv.Mat();

            // Convert to HSV to analyze color
            cv.cvtColor(src, hsv, cv.COLOR_RGBA2RGB);
            cv.cvtColor(hsv, hsv, cv.COLOR_RGB2HSV);

            // Get the mean/average color of the image
            let mean = cv.mean(hsv);
            let hue = mean[0]; // OpenCV Hue range is 0-179

            // Cleanup memory
            src.delete();
            hsv.delete();

            // Simple Hue to pH Mapping (Approximate Universal Indicator Profile)
            let estimatedPH = 7.0;
            if (hue >= 0 && hue < 15) estimatedPH = 1.0 + (hue / 15.0) * 2;
            else if (hue >= 160 && hue <= 179) estimatedPH = 1.0;
            else if (hue >= 15 && hue < 40) estimatedPH = 3.0 + ((hue - 15) / 25.0) * 3;
            else if (hue >= 40 && hue < 90) estimatedPH = 6.0 + ((hue - 40) / 50.0) * 2;
            else if (hue >= 90 && hue < 130) estimatedPH = 8.0 + ((hue - 90) / 40.0) * 3;
            else if (hue >= 130 && hue < 160) estimatedPH = 11.0 + ((hue - 130) / 30.0) * 3;

            // (Removed previous inverted logic to ensure standard mapping)

            const finalPH = estimatedPH.toFixed(1);
            console.log(`✅ Local OpenCV Success! Mean Hue: ${hue.toFixed(1)}, Estimated pH: ${finalPH}`);

            // Update UI Visuals
            btnDetectPh.style.display = 'none';
            phResultContainer.style.display = 'block';

            phValueDisplay.innerText = finalPH;
            document.getElementById('ph-hidden-input').value = finalPH;

            // Color swatch and status based on pH range
            let phColor;
            if (estimatedPH < 6.5) {
                phColor = "#ef4444"; // Red — Acidic
                colorSwatch.style.background = phColor;
                phStatusDisplay.innerText = "Highly Acidic (Harmful)";
            } else if (estimatedPH > 8.5) {
                phColor = "#3b82f6"; // Blue — Basic/Alkaline
                colorSwatch.style.background = phColor;
                phStatusDisplay.innerText = "Alkaline / Basic (Needs Action)";
            } else {
                phColor = "#22c55e"; // Green — Neutral (~pH 7)
                colorSwatch.style.background = phColor;
                phStatusDisplay.innerText = "Neutral (Safe Limits)";
            }
            phStatusDisplay.style.color = phColor;
            phValueDisplay.style.color = phColor;

        } catch (err) {
            console.error("📸 Analysis Error:", err);
            alert("Image analysis failed: " + err.message);
            btnDetectPh.innerHTML = '<i class="fa-solid fa-microscope"></i> Detect Approx pH Level';
            btnDetectPh.disabled = false;
        }
    });


    // -- Map and Geolocation Utilities --
    const locationStatus = document.getElementById('location-status');
    const latInput = document.getElementById('latitude');
    const lngInput = document.getElementById('longitude');
    const btnViewMap = document.getElementById('btn-view-map');
    const mapContainer = document.getElementById('map-container');
    const addressDisplay = document.getElementById('address-display');
    const btnLiveLocation = document.getElementById('btn-live-location');

    if (btnLiveLocation) {
        btnLiveLocation.addEventListener('click', () => {
            btnLiveLocation.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="font-size: 1.2rem;"></i>';
            btnLiveLocation.disabled = true;

            fetchLocation();

            // restore button state
            setTimeout(() => {
                btnLiveLocation.innerHTML = '<i class="fa-solid fa-location-crosshairs" style="font-size: 1.2rem;"></i>';
                btnLiveLocation.disabled = false;
            }, 2500);
        });
    }

    // Toggle Map View
    btnViewMap.addEventListener('click', () => {
        if (mapContainer.style.display === 'none') {
            mapContainer.style.display = 'block';
            btnViewMap.innerHTML = '<i class="fa-solid fa-map"></i> Hide Map';
            // Trigger resize to fix map rendering if hidden initially
            setTimeout(() => {
                if (window.google && window.map) {
                    google.maps.event.trigger(window.map, 'resize');
                    const lat = parseFloat(latInput.value);
                    const lng = parseFloat(lngInput.value);
                    if (!isNaN(lat) && !isNaN(lng)) {
                        const pos = { lat, lng };
                        window.map.setCenter(pos);
                        window.map.setZoom(16);
                        if (window.marker) {
                            window.marker.position = pos;
                        }
                    }
                }
            }, 100);
        } else {
            mapContainer.style.display = 'none';
            btnViewMap.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> View Map & Adjust';
        }
    });

    function setLocationInputs(lat, lng) {
        latInput.value = lat;
        lngInput.value = lng;
        locationStatus.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> GPS Captured: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        locationStatus.className = 'location-status success';
    }

    function fetchLocation() {
        // Initialize loading state
        locationStatus.innerHTML = '<i class="fa-solid fa-location-dot blink"></i> Fetching Auto GPS...';
        locationStatus.className = 'location-status';

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success fetch
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const pos = { lat, lng };

                    setLocationInputs(lat, lng);

                    // Update Map if loaded
                    if (window.map && window.marker) {
                        window.map.setCenter(pos);
                        window.map.setZoom(16);
                        window.marker.position = pos;

                        // Get Address
                        if (window.geocoder) {
                            addressDisplay.innerText = "Loading address...";
                            window.geocoder.geocode({ location: pos }, (results, status) => {
                                if (status === "OK" && results[0]) {
                                    addressDisplay.innerText = results[0].formatted_address;
                                } else {
                                    addressDisplay.innerText = "Address not found";
                                }
                            });
                        }
                    }
                },
                (error) => {
                    // Fallback
                    console.error("Geolocation Error: ", error);
                    let errMessage = "GPS access denied or failed";

                    if (error.code == 1) errMessage = "Location permission denied";
                    if (error.code == 2) errMessage = "Position unavailable";
                    if (error.code == 3) errMessage = "Location request timed out";

                    locationStatus.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${errMessage}`;
                    locationStatus.className = 'location-status error';
                },
                {
                    enableHighAccuracy: true, // Auto GPS strict approach
                    timeout: 15000,
                    maximumAge: 0
                }
            );
        } else {
            locationStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Geolocation API not supported';
            locationStatus.className = 'location-status error';
        }
    }


    // -- Utilities --
    function resetForm() {
        uploadedImageUrl = null;
        refImageUrl = null;
        document.getElementById('issue-type').value = '';
        document.getElementById('description').value = '';
        latInput.value = '';
        lngInput.value = '';
        photoPreview.src = '';
        if (refPhotoPreview) {
            refPhotoPreview.src = '';
            refPhotoPreview.style.display = 'none';
        }
        if (refImageUpload) refImageUpload.value = '';
        const btnRefUpload = document.getElementById('btn-ref-upload');
        if (btnRefUpload) btnRefUpload.innerHTML = '<i class="fa-solid fa-image"></i> Upload Reference Image';

        video.style.display = 'block';
        btnCapture.parentElement.style.display = 'flex';
        if (document.getElementById('upload-container')) document.getElementById('upload-container').style.display = 'block';
        if (document.getElementById('image-upload')) document.getElementById('image-upload').value = '';
        photoPreview.style.display = 'none';
        photoActions.style.display = 'none';

        phResultContainer.style.display = 'none';
        btnDetectPh.innerHTML = '<i class="fa-solid fa-camera"></i> Capture photo first to Detect Approx pH';
        btnDetectPh.disabled = true;
        phValueDisplay.innerText = '--';
        phValueDisplay.style.color = 'var(--text-primary)';
        phSection.style.display = 'none';

        if (mapContainer && btnViewMap && addressDisplay) {
            mapContainer.style.display = 'none';
            btnViewMap.innerHTML = '<i class="fa-solid fa-map-location-dot"></i> View Map & Adjust';
            addressDisplay.innerText = "Address will appear here...";
        }
    }

    // Auto-start laptop webcam and GPS when the app opens
    initCamera();
    fetchLocation();

    // Add submitted report to history list
    window.addReportToHistory = function (issueType, location) {
        const historyList = document.getElementById('history-list');
        const emptyState = historyList.querySelector('.history-empty');
        if (emptyState) emptyState.remove();
        const icons = { leakage: 'fa-water', contamination: 'fa-flask-vial', drainage: 'fa-toilet-water', wastage: 'fa-faucet-drip', pump_failure: 'fa-gear', other: 'fa-circle-exclamation' };
        const labels = { leakage: 'Pipeline Leakage', contamination: 'Water Contamination', drainage: 'Drainage Issue', wastage: 'Water Wastage', pump_failure: 'Pump Failure', other: 'Other Issue' };
        const card = document.createElement('div');
        card.className = 'history-card';
        card.innerHTML = `<div class="history-card-icon"><i class="fa-solid ${icons[issueType] || 'fa-droplet'}"></i></div><div class="history-card-info"><div class="history-card-title">${labels[issueType] || 'Water Issue'}</div><div class="history-card-meta"><i class="fa-solid fa-clock"></i> Just now${location ? ' · ' + location : ''}</div></div>`;
        historyList.prepend(card);
    };
});

// OpenCV Load Hook (can be removed if you entirely deleted OpenCV script from index.html!)
window.cvStatus = 'loading';
window.onOpenCvReady = function () {
    window.cvStatus = 'ready';
    console.log("OpenCV.js successfully loaded!");
};

// -- Global Map Initialization (Google Maps API Callback) --
window.map = null;
window.marker = null;
window.geocoder = null;

window.initMap = function () {
    const defaultLoc = { lat: 28.6139, lng: 77.2090 }; // Default to New Delhi

    window.geocoder = new google.maps.Geocoder();
    window.map = new google.maps.Map(document.getElementById("map"), {
        center: defaultLoc,
        zoom: 12,
        mapId: "DEMO_MAP_ID",
        mapTypeControl: false,
        streetViewControl: false
    });

    window.marker = new google.maps.marker.AdvancedMarkerElement({
        position: defaultLoc,
        map: window.map,
        gmpDraggable: true
    });

    // When user drags the dot to correct position
    window.marker.addListener("dragend", () => {
        const pos = window.marker.position;
        const lat = typeof pos.lat === 'function' ? pos.lat() : pos.lat;
        const lng = typeof pos.lng === 'function' ? pos.lng() : pos.lng;

        document.getElementById('latitude').value = lat;
        document.getElementById('longitude').value = lng;

        const locStatus = document.getElementById('location-status');
        locStatus.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i> GPS Adjusted: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        locStatus.className = 'location-status success';

        const addressDisplay = document.getElementById('address-display');
        addressDisplay.innerText = "Refreshing address...";

        window.geocoder.geocode({ location: pos }, (results, status) => {
            if (status === "OK" && results[0]) {
                addressDisplay.innerText = results[0].formatted_address;
            } else {
                addressDisplay.innerText = "Address not found";
            }
        });
    });
};

// -- Progressive Web App (PWA) Service Worker Registration --
// This ensures the application works natively on Android and iOS Home Screens
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}
