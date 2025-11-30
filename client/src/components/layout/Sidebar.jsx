// src/components/layout/Sidebar.jsx

import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; // <--- Import Auth to check email

// Define the Admins here (Must match Server)
const ADMIN_EMAILS = ['vjshah0411@gmail.com', 'HindreenOfficial@gmail.com'];

function Sidebar() {
  const { user } = useAuth(); // Get the current user info

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          🏠 Dashboard
        </NavLink>
        
        <NavLink 
          to="/expenses" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          📊 Expense Tracker
        </NavLink>
        
        <NavLink 
          to="/income" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          💰 Income Tracker
        </NavLink>
        
        <NavLink 
          to="/savings" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          🏦 Savings Tracker
        </NavLink>
        
        <NavLink 
          to="/networth" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          📈 Net Worth Tracker
        </NavLink>
        
        <NavLink 
          to="/bills" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          🧾 Bill Reminder
        </NavLink>
        
        <NavLink 
          to="/retirement" 
          className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
        >
          🏝️ Retirement Planner
        </NavLink>

        {/* --- ADMIN PANEL LINK (Only visible to you and client) --- */}
        {user && ADMIN_EMAILS.includes(user.email) && (
          <NavLink 
            to="/admin" 
            className={({ isActive }) => isActive ? "sidebar-link active" : "sidebar-link"}
            style={{ marginTop: '20px', borderTop: '1px solid #444', paddingTop: '10px', color: '#ff9f43' }}
          >
            🛡️ Admin Panel
          </NavLink>
        )}
        {/* -------------------------------------------------------- */}

      </nav>
    </aside>
  );
}

export default Sidebar;