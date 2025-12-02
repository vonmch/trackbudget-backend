// src/pages/AdminPanelPage.jsx

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/api';
import './AdminPanelPage.css';

function AdminPanelPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authFetch('/admin/users');
        if (!response.ok) {
          if (response.status === 403) throw new Error("Access Denied. Admin only.");
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  // --- THE FILTER LOGIC ---
  // Create a new list containing ONLY subscribed users
  const subscribedUsers = users.filter(user => user.is_premium === true);

  if (loading) return <div className="admin-container">Loading users...</div>;
  if (error) return <div className="admin-container error-text">Error: {error}</div>;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Admin Panel (Subscribed Users Only)</h2>
        <p>{subscribedUsers.length} active subscribers</p>
      </div>

      <div className="user-table-container">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client Name</th>
              <th>Email</th>
              <th>Join Date</th>
              <th>Last Login</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {subscribedUsers.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>No active subscribers found.</td></tr>
            ) : (
              subscribedUsers.map((user) => (
                <tr key={user.id}>
                  <td>#{user.id}</td>
                  <td>
                    <div className="client-info">
                      <div className="client-avatar">
                        {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span>{user.full_name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>{formatDate(user.last_login)}</td>
                  <td>
                    <span className="status-badge subscribed">
                      Subscribed
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminPanelPage;