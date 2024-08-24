import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const getDeviceId = () => {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = `device-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
};


const Dashboard = () => {
  const [qrCodeURL, setQrCodeURL] = useState('');
 
  const navigate = useNavigate();
 
  const socket = io("https://localhost:5000", {
    secure: true,
    rejectUnauthorized: false, // Only use for testing
    withCredentials: true
  });

  useEffect(() => {
    const userId = sessionStorage.getItem("userId")
   
    if(userId){
      navigate("/play")
    }
   
    // Generate QR code with QR token and device ID
    let deviceId = ""
    const generateQRCode = async () => {
      const token = "qrhunmai@1234@sii&bsij^isb"; // Replace with an actual unique token for the user
   
      deviceId = localStorage.getItem('deviceId'); // Ensure deviceId is available
   
      const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now
      if(!deviceId) {
        const deviceId = getDeviceId()
   
        localStorage.setItem('deviceId', deviceId);
      }
   
      const qrData = JSON.stringify({ token, deviceId, expirationTime});
   
      console.log(qrData, "from dashboard");
   
      const qrCodeDataURL = await QRCode.toDataURL(qrData);
   
      setQrCodeURL(qrCodeDataURL);
    };

    generateQRCode();

    // Join room with device ID
    socket.emit('join-room', { deviceId });

    socket.on('login-success', ({ userId, accessToken, refreshToken }) => {
   
      //access token and refresh token as cookies
      Cookies.set("accessToken", accessToken, { sameSite: 'Strict',expires: 1 , secure: true})
      Cookies.set("refreshToken", refreshToken, { sameSite: 'Strict',expires: 1, secure: true })
      sessionStorage.setItem('userId', userId);
      // console.log(Cookies.get())
      console.log("fromy dahsboard on login success");
      // path=/: The cookie is accessible site-wide (across the entire domain).
      // Redirect to home 
      navigate('/play');
    });

    socket.on('login-failed', (message) => {
      alert(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate]);

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Dashboard</h2>
      <h3 style={styles.subHeading}>Scan this QR code to log in:</h3>
      {qrCodeURL && (
        <div style={styles.qrContainer}>
          <img src={qrCodeURL} alt="QR Code" style={styles.qrCode} />
          <a href={qrCodeURL} download="login-qr-code.png" style={styles.downloadButton}>
            Download QR Code
          </a>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f0f0f0',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '10px',
  },
  subHeading: {
    fontSize: '18px',
    marginBottom: '20px',
  },
  qrContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  qrCode: {
    width: '300px',  // Adjust width as needed
    height: '300px', // Adjust height as needed
    border: '2px solid #000', // Optional: border around QR code
  },
  downloadButton: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    border: 'none',
    textAlign: 'center',
  },
};

export default Dashboard;






