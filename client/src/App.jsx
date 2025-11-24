// src/App.jsx

import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import { AuthProvider, useAuth } from './context/AuthContext';
import { authFetch } from './utils/api'; // Import authFetch

// Import Pages
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
import SignUpPage from './pages/SignUpPage';

// --- Protected Layout Component ---
// This handles the Sidebar, Navbar, and checking Premium status
const ProtectedLayout = () => {
  const { user, loading } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  // 1. Fetch Premium Status when the user loads
  useEffect(() => {
    const checkPremiumStatus = async () => {
      if (user) {
        try {
          const response = await authFetch('/profile');
          const data = await response.json();
          
          // --- THE FIX IS HERE ---
          // We use '!!' to force the database value (0 or 1) into a real Boolean (false or true)
          setIsPremium(!!data.is_premium); 
          console.log("Premium Status:", !!data.is_premium);
          
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
            <Route path="/" element={<DashboardPage />} /> 
            {/* Pass isPremium to all trackers */}
            <Route path="/expenses" element={<ExpenseTrackerPage isPremium={isPremium} />} />
            <Route path="/income" element={<IncomeTrackerPage isPremium={isPremium} />} />
            <Route path="/savings" element={<SavingsBucketsPage isPremium={isPremium} />} />
            <Route path="/retirement" element={<RetirementPage isPremium={isPremium} />} />
            <Route path="/bills" element={<BillReminderPage isPremium={isPremium} />} />
            <Route path="/networth" element={<NetWorthPage isPremium={isPremium} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/success" element={<SuccessPage />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

function App() {
  useEffect(() => {
    // Initialize Dark Mode from local storage
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
        <Route path="/login" element={<div>Login Page (Use Signup for now)</div>} /> 

        {/* Protected Routes (Dashboard & Trackers) */}
        <Route path="/*" element={<ProtectedLayout />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;