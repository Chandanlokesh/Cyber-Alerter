import React from 'react';
import { BrowserRouter as Router, Route, Routes as RouterRoutes } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
// import ScanPage from './pages/ScanPage';
import QuickScanPage from './pages/quickScanPage';
import MonitoPage from './pages/monitorScanPage';
import UserPage from './pages/UserPage';


const AppRoutes = () => (
  <Router>
    <RouterRoutes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/Quickscan" element={<QuickScanPage />} />
      <Route path="/Monitorscan" element={<MonitoPage />} />
      <Route path="/user" element={<UserPage />} />
    </RouterRoutes>
  </Router>
);

export default AppRoutes;
