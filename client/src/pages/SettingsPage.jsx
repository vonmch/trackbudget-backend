// src/pages/SettingsPage.jsx (Final Version with Logout)

import React, { useState, useEffect } from 'react';
import './SettingsPage.css';
import './TrackerPage.css';
import { authFetch } from '../utils/api'; 
import { useAuth } from '../context/AuthContext'; // <--- ADDED THIS IMPORT

function SettingsPage() {
  const { logout } = useAuth(); // <--- ADDED THIS HOOK
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isPremium, setIsPremium] = useState(false); 

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
    
    // Check if user is already premium
    const checkPremium = async () => {
      try {
        const response = await authFetch('/profile');
        const data = await response.json();
        setIsPremium(data.is_premium === true || data.is_premium === 1);
      } catch (error) { console.error(error); }
    };
    checkPremium();
  }, [isDarkMode]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch('/profile/password', {
        method: 'PUT',
        body: JSON.stringify({ newPassword }),
      });
      if (response.ok) {
        alert('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        alert('Failed to update password.');
      }
    } catch (error) {
      alert('Error changing password.');
    }
  };

  // --- HANDLER: UPGRADE TO PREMIUM ---
  const handleUpgrade = async () => {
    try {
      const response = await authFetch('/create-checkout-session', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe
      }
    } catch (error) {
      console.error('Error starting checkout:', error);
      alert('Failed to start checkout.');
    }
  };

  // --- HANDLER: MANAGE EXISTING SUBSCRIPTION ---
  const handleManageSubscription = async () => {
    try {
      const response = await authFetch('/create-portal-session', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Customer Portal
      } else {
        alert(data.error || 'Could not find subscription history.');
      }
    } catch (error) {
      console.error('Error opening portal:', error);
      alert('Failed to open subscription settings.');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('WARNING: This will delete ALL your data. Are you sure?')) {
      if (window.confirm('Are you REALLY sure?')) {
        try {
          const response = await authFetch('/account', { method: 'DELETE' });
          if (response.ok) {
            localStorage.removeItem('token');
            window.location.href = '/signup';
          }
        } catch (error) { console.error('Error deleting account:', error); }
      }
    }
  };

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      
      <div className="data-container">
        <h3>Account</h3>
        <form className="settings-form" onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label>Change Password</label>
            <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            <input type="password" placeholder="New Password" style={{marginTop: '10px'}} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-save-settings">Save Password</button>
        </form>
      </div>
      
      <div className="data-container">
        <h3>Subscription</h3>
        {isPremium ? (
          <div>
            <p className="premium-badge">🌟 You are a Premium Member!</p>
            <p style={{marginBottom: '15px'}}>Thank you for supporting TrackBudgetBuild.</p>
            
            <button className="btn-manage-subscription" onClick={handleManageSubscription} style={{backgroundColor: '#555'}}>
              Manage Subscription / Cancel
            </button>

          </div>
        ) : (
          <div>
            <p>You are currently on the **Free Tier**.</p>
            <p style={{marginBottom: '15px', color: '#777'}}>
              Upgrade to Premium ($24.99) to unlock all features.
            </p>
            <button className="btn-manage-subscription" onClick={handleUpgrade}>
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>

      <div className="data-container">
        <h3>Preferences</h3>
        <div className="preference-item">
          <label>Dark Mode</label>
          <div className="toggle-switch">
            <input type="checkbox" id="darkModeToggle" checked={isDarkMode} onChange={() => setIsDarkMode(!isDarkMode)} />
            <label htmlFor="darkModeToggle" className="slider"></label>
          </div>
        </div>
      </div>
      
      {/* --- ADDED LOGOUT SECTION HERE --- */}
      <div className="data-container" style={{ textAlign: 'center' }}>
        <h3>Session</h3>
        <button 
          onClick={logout} 
          className="btn-save-settings" 
          style={{ backgroundColor: '#666', width: '100%', marginTop: '10px' }}
        >
          Log Out
        </button>
      </div>
      {/* -------------------------------- */}

      <div className="data-container danger-zone">
        <h3>Danger Zone</h3>
        <p>Deleting your account is permanent.</p>
        <button className="btn-delete-account" onClick={handleDeleteAccount}>Delete My Account</button>
      </div>
    </div>
  );
}

export default SettingsPage;