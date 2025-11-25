// src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import './TrackerPage.css';
import { formatCurrency } from '../utils/formatting'; // Import formatter
import { authFetch } from '../utils/api';

function ProfilePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await authFetch('/profile');
        const data = await response.json();
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setJobDescription(data.job_description || '');
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    const fetchHistory = async () => {
      try {
        const response = await authFetch('/history');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Failed to fetch history:", error);
      }
    };
    fetchProfile();
    fetchHistory();
  }, []);

  const handleProfileSave = async (event) => {
    event.preventDefault();
    const profileData = { full_name: fullName, email: email, job_description: jobDescription };
    try {
      await authFetch('/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });
      alert('Profile Saved!');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile.');
    }
  };

  return (
    <div className="profile-page-grid">
      <div className="profile-card data-container">
        <h3>My Profile</h3>
        <form onSubmit={handleProfileSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Job Description</label>
            <textarea rows="3" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}/>
          </div>
          <button type="submit" className="btn-save-profile">Save Profile</button>
        </form>
      </div>

      <div className="history-card data-container">
        <h3>Transaction History</h3>
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Name</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan="4">No transaction history yet.</td></tr>
              ) : (
                history.map((item, index) => (
                  <tr key={index}>
                    <td className={`type-${item.transaction_type}`}>{item.transaction_type}</td>
                    <td>{item.name}</td>
                    <td>{item.date}</td>
                    <td className={`amount-${item.transaction_type}`}>
                      {item.transaction_type === 'income' ? '+' : '-'}
                      {formatCurrency(item.amount).substring(1)} {/* Remove extra $ */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;