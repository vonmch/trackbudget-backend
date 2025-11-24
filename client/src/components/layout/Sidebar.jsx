// src/components/layout/Sidebar.jsx

import React from 'react';
import './Sidebar.css';
// 1. We import 'NavLink' instead of 'Link'
import { NavLink } from 'react-router-dom'; 

function Sidebar() {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {/* 2. We replace our <li> and <Link> with a single <NavLink>.
             The className prop is now a function.
             React Router will tell us if the link 'isActive',
             and we can give it our "sidebar-link-active" class!
        */}
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          🏠 Dashboard
        </NavLink>
        
        <NavLink 
          to="/expenses" 
          className={({ isActive }) => 
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          📊 Expense Tracker
        </NavLink>
        
        <NavLink 
          to="/income" 
          className={({ isActive }) => 
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          💰 Income Tracker
        </NavLink>
        
        <NavLink 
          to="/savings" 
          className={({ isActive }) => 
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          🏦 Savings Tracker
        </NavLink>
        
        <NavLink 
          to="/networth" 
          className={({ isActive }) => 
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          📈 Net Worth Tracker
        </NavLink>
        
        <NavLink 
          to="/bills" 
          className={({ isActive }) => 
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          🧾 Bill Reminder
        </NavLink>
        
        <NavLink 
          to="/retirement" 
          className={({ isActive }) => 
            isActive ? "sidebar-link active" : "sidebar-link"
          }
        >
          🏝️ Retirement Planner
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;