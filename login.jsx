import React, { useState } from 'react';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // 1. Send OTP (Calls your new Node backend)
  const handleSendOTP = async () => {
    if (phone.length !== 10) return setError("Enter valid 10-digit number");
    setError("");
    
    try {
      const response = await fetch("http://localhost:3000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep(2); // Move to OTP screen
        // Arpit, tell Ashu to tell YOU to check your terminal right now for the OTP!
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("Failed to connect to backend server.");
      console.error(err);
    }
  };

  // 2. Verify OTP (Calls your new Node backend)
  const handleVerifyOTP = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone, otp: otp })
      });

      const data = await response.json();

      if (data.success) {
        console.log("JWT for Backend:", data.token);
        alert("Success! Token received.");
        // TODO: Redirect to Dashboard
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Failed to verify OTP.");
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h2 style={styles.title}>Login Account</h2>
        
        {error && <div style={styles.error}>{error}</div>}

        {step === 1 ? (
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input 
              type="text" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="Enter 10-digit number" 
              style={styles.input}
              maxLength={10}
            />
            <button onClick={handleSendOTP} style={styles.button}>Send OTP</button>
          </div>
        ) : (
          <div style={styles.formGroup}>
             <label style={styles.label}>Enter OTP</label>
            <input 
              type="text" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="Enter OTP" 
              style={styles.input}
            />
            <button onClick={handleVerifyOTP} style={styles.button}>Verify OTP</button>
            <button onClick={() => setStep(1)} style={styles.secondaryButton}>Change Phone Number</button>
          </div>
        )}
      </div>
    </div>
  );
};

// Premium glassmorphism aesthetics
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
    fontFamily: "'Inter', 'Roboto', sans-serif"
  },
  glassCard: {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '40px',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '30px',
    fontSize: '2rem',
    fontWeight: '700',
    letterSpacing: '1px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  label: {
    color: '#e0e0e0',
    fontSize: '0.95rem',
    fontWeight: '500',
    marginBottom: '-10px'
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    background: 'rgba(255, 255, 255, 0.08)',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '14px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(90deg, #00d2ff 0%, #3a7bd5 100%)',
    color: '#ffffff',
    fontSize: '1.05rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 15px rgba(0, 210, 255, 0.3)'
  },
  secondaryButton: {
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.4)',
    background: 'transparent',
    color: '#ffffff',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginTop: '5px',
    transition: 'background 0.2s ease'
  },
  error: {
    background: 'rgba(255, 75, 75, 0.15)',
    border: '1px solid rgba(255, 75, 75, 0.3)',
    color: '#ff6b6b',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: '500'
  }
};

export default Login;
