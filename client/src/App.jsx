// src/App.jsx (Final Version with Admin Route)

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import { authFetch } from './utils/api';
import './App.css';

// Layout
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';

// Pages
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
import AdminPanelPage from './pages/AdminPanelPage'; // <--- Admin Page Import

const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (user) {
        try {
          const response = await authFetch('/profile');
          const data = await response.json();
          // Force boolean (true/false)
          setIsPremium(!!data.is_premium); 
        } catch (error) {
          console.error("Failed to check subscription:", error);
        }
      }
    };
    checkPremiumStatus();
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/signup" />;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-view">
        <Navbar />
        <div className="main-content">
          <Routes>
            {/* Redirect root "/" to "/dashboard" immediately */}
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
            
            {/* --- NEW ADMIN ROUTE --- */}
            <Route path="/admin" element={<AdminPanelPage />} />
            {/* ----------------------- */}

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
        {/* Public Routes */}
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected Routes */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;