import {useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import QRScanner from 'qr-scanner';



const ScanQR = () => {
  const [isScannerActive, setIsScannerActive] = useState(false);
  
  const [qrScanner, setQrScanner] = useState(null);
  const scannerRef = useRef(null);
  const navigate = useNavigate();


  
  // const socket = io("https://localhost:5000"); // Connect to the socket server

  const userId = sessionStorage.getItem('userId')
  
  console.log( userId, "access and userID from scan \n")
  
  const socket = io("https://localhost:5000", {
    secure: true,
    rejectUnauthorized: false, // Only use for testing
    withCredentials: true
  });

  useEffect(() => {
    if (!userId) return; // If userId is not present, do not initialize QR scanner
  
    console.log(userId, "userId from useEffect \n")
    
     // Join room with access token
     socket.emit('join-room', { userId });

    const handleScanSuccess = (qrCode) => {
      try {
        const qrData = JSON.parse(qrCode); // Parse QR code data
        
        const { token, deviceId, expirationTime } = qrData; 
    
        console.log('Parsed QR Code Data:', { token, deviceId }); // Log parsed QR code data
        
        if (!deviceId) {
          console.error("Device ID is missing in QR code data");
          alert("Invalid QR code: Missing device ID.");
          return;
        }
       
        if (Date.now() > expirationTime) {
          alert("QR code has expired.");
          return;
        }

        console.log('Emitting scan-qr event sockert-id is', socket.id);
  
        socket.emit('scan-qr', { qrToken: token, deviceId, userId });
        
        console.log('scan-qr event emitted');
      
        // socket.emit('scan-qr', { qrToken: token, deviceId, userId });

        socket.on('scanned-success', ({ userName }) => {
          console.log("Login success  closing scanner")
          scannerRef.current.stop();
          setIsScannerActive(false)
          alert(`Scanner stopped successfully, ${userName} Logged In on his dashboard`)
          // navigate('/home'); // Redirect to home or another page upon successful login
        });

        socket.on('login-failed', (message) => {
          scannerRef.current.stop();
          // setIsScannerActive(!isScannerActive)
          setIsScannerActive(false);
          alert(message, "Login failed on dashboard");
        });
      } catch (error) {
        console.error("Failed to parse QR code:", error);
        scannerRef.current.stop();
        // setIsScannerActive(!isScannerActive)
        setIsScannerActive(false);
        alert("Invalid QR code.");
      }
    };

    const videoElement = document.getElementById('video');
    const scanner = new QRScanner(videoElement, handleScanSuccess);
    // setQrScanner(scanner);
    scannerRef.current = scanner; 
    // Log when disconnected
    socket.on('disconnect', () => {
      alert('Disconnected from server');
    });
    return () => {
      // if (qrScanner) {
      //   qrScanner.stop();
      // }
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
      socket.disconnect();
    };
  }, [userId, navigate]);

  const toggleScanner = () => {
    if (isScannerActive) {
      // qrScanner.stop();
      scannerRef.current.stop();
    } else {
      // qrScanner.start().then(() => {
      //   console.log('QR scanner started');
      // }).catch(err => {
      //   console.error('Failed to start QR scanner:', err);
      // });
      scannerRef.current.start().then(() => {
        console.log('QR scanner started');
      }).catch(err => {
        console.error('Failed to start QR scanner:', err);
      });
    }
    setIsScannerActive(!isScannerActive);
  };

  if (!userId) {
    return <h1>Please log in first to scan QR codes.</h1>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.videoWrapper}>
        <video id="video" style={styles.video}></video>
      </div>
      <button onClick={toggleScanner} style={styles.button}>
        {isScannerActive ? 'Stop Scanner' : 'Start Scanner'}
      </button>
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
  videoWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '30%',
  },
  video: {
    width: '30vw',  // Set width to 30% of viewport width
    height: '100%', // Full height of the video wrapper
    border: '2px solid #000', // Optional: border around video
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    fontSize: '16px',
    cursor: 'pointer',
  }
};


export default ScanQR;





// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { io } from 'socket.io-client';
// import QRScanner from 'qr-scanner';

// const ScanQR = () => {
//   const [isScannerActive, setIsScannerActive] = useState(false);
//   const [qrScanner, setQrScanner] = useState(null);
//   const navigate = useNavigate();
//   const userId = localStorage.getItem('userId');
//   const socket = io("https://localhost:5000", {
//     secure: true,
//     rejectUnauthorized: false,
//     withCredentials: true
//   });

//   useEffect(() => {
//     if (!userId) return; // If userId is not present, do not initialize QR scanner
//     const handleScanSuccess = (qrCode) => {
//       try {
//         const qrData = JSON.parse(qrCode); // Parse QR code data
//         const { token, deviceId } = qrData;
//         console.log('Parsed QR Code Data:', { token, deviceId }); // Log parsed QR code data

//         if (!deviceId) {
//           console.error("Device ID is missing in QR code data");
//           alert("Invalid QR code: Missing device ID.");
//           return;
//         }

//         console.log('Emitting scan-qr event with socket ID', socket.id);
//         socket.emit('scan-qr', { qrToken: token, deviceId, userId });
//         console.log('scan-qr event emitted');

//         socket.on('scanned-success', ({ userName }) => {
//           console.log("Login success, closing scanner");
//           qrScanner.stop();
//           alert(`Scanner stopped successfully, ${userName} logged in on their dashboard`);
//         });

//         socket.on('login-failed', (message) => {
//           alert(message);
//         });
//       } catch (error) {
//         console.error("Failed to parse QR code:", error);
//         alert("Invalid QR code.");
//       }
//     };

//     const videoElement = document.getElementById('video');
//     const scanner = new QRScanner(videoElement, handleScanSuccess);
//     setQrScanner(scanner);

//     socket.on('disconnect', () => {
//       alert('Disconnected from server');
//     });

//     return () => {
//       if (qrScanner) {
//         qrScanner.stop();
//       }
//       socket.disconnect();
//     };
//   }, [userId, navigate, socket]);

//   const toggleScanner = () => {
//     if (isScannerActive) {
//       qrScanner.stop();
//     } else {
//       qrScanner.start().then(() => {
//         console.log('QR scanner started');
//       }).catch(err => {
//         console.error('Failed to start QR scanner:', err);
//       });
//     }
//     setIsScannerActive(!isScannerActive);
//   };

//   if (!userId) {
//     return <h1>Please log in first to scan QR codes.</h1>;
//   }

//   return (
//     <div style={styles.container}>
//       <div style={styles.videoWrapper}>
//         <video id="video" style={styles.video}></video>
//       </div>
//       <button onClick={toggleScanner} style={styles.button}>
//         {isScannerActive ? 'Stop Scanner' : 'Start Scanner'}
//       </button>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
//     justifyContent: 'center',
//     height: '100vh',
//     width: '100vw',
//     backgroundColor: '#f0f0f0',
//   },
//   videoWrapper: {
//     position: 'relative',
//   },
//   video: {
//     width: '400px', // Adjust as needed
//     height: '300px', // Adjust as needed
//   },
//   button: {
//     marginTop: '20px',
//     padding: '10px 20px',
//     fontSize: '16px',
//     cursor: 'pointer',
//   }
// };

// export default ScanQR;
