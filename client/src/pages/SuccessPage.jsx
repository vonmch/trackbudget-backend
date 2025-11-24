// src/pages/SuccessPage.jsx

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrackerPage.css';
import { authFetch } from '../utils/api'; // Use authFetch

function SuccessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const unlockFeatures = async () => {
      try {
        // Call the backend to flip the "is_premium" switch
        await authFetch('/profile/upgrade', {
          method: 'PUT'
        });
        
        // Wait 3 seconds then go to dashboard
        setTimeout(() => {
          navigate('/');
          window.location.reload(); // Reload to refresh permission state
        }, 3000);
      } catch (error) {
        console.error('Error activating premium:', error);
      }
    };

    unlockFeatures();
  }, [navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '80vh', 
      flexDirection: 'column',
      textAlign: 'center'
    }}>
      <div className="data-container" style={{maxWidth: '500px', padding: '40px'}}>
        <h1 style={{color: '#2ed47a', fontSize: '4rem', marginBottom: '10px'}}>🎉</h1>
        <h2 style={{margin: '0 0 20px 0'}}>Payment Successful!</h2>
        <p style={{fontSize: '1.1rem'}}>Thank you for subscribing to TrackBudgetBuild.</p>
        <p style={{color: '#777'}}>We are activating your premium features now...</p>
      </div>
    </div>
  );
}

export default SuccessPage;