import React, {  useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import ScanQR from  "./components/ScanQR"
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import Play from './components/Play';
const App = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/scan-qr" element={<ScanQR  />} />
          <Route path="/play" element={<Play />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
