// src/App.jsx

import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import { authFetch } from './utils/api';
import './App.css';

// Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
import LandingPage from './pages/LandingPage'; // <--- NEW IMPORT
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import ExpenseTrackerPage from './pages/ExpenseTrackerPage'; 
import IncomeTrackerPage from './pages/IncomeTrackerPage';
import SavingsBucketsPage from './pages/SavingsBucketsPage';
import RetirementPage from './pages/RetirementPage';
import BillReminderPage from './pages/BillReminderPage';
import NetWorthPage from './pages/NetWorthPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SuccessPage from './pages/SuccessPage';
import AdminPanelPage from './pages/AdminPanelPage';

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (user) {
        try {
          const response = await authFetch('/profile');
          const data = await response.json();
          setIsPremium(!!data.is_premium); 
        } catch (error) {
          console.error("Failed to check subscription:", error);
        }
      }
    };
    checkPremiumStatus();
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" />; // Redirect to Login if not authenticated

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-view">
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Default Protected Page is now Dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="/dashboard" element={<DashboardPage />} /> 
            <Route path="/expenses" element={<ExpenseTrackerPage isPremium={isPremium} />} />
            <Route path="/income" element={<IncomeTrackerPage isPremium={isPremium} />} />
            <Route path="/savings" element={<SavingsBucketsPage isPremium={isPremium} />} />
            <Route path="/retirement" element={<RetirementPage isPremium={isPremium} />} />
            <Route path="/bills" element={<BillReminderPage isPremium={isPremium} />} />
            <Route path="/networth" element={<NetWorthPage isPremium={isPremium} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/success" element={<SuccessPage />} />
            
            {/* Admin Route */}
            <Route path="/admin" element={<AdminPanelPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
    }
  }, []);

  return (
    <AuthProvider>
      <Routes>
        {/* --- PUBLIC ROUTES (No Sidebar/Navbar) --- */}
        <Route path="/" element={<LandingPage />} /> {/* The Front Door */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* --- PROTECTED ROUTES (Has Sidebar/Navbar) --- */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;