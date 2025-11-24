// src/components/layout/Navbar.jsx

import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';
import { Link } from 'react-router-dom';
import NotificationPopover from './NotificationPopover';
import { authFetch } from '../../utils/api'; // <--- 1. IMPORT THIS

function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
    };
  }, [ref, handler]);
}

function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const popoverRef = useRef(null);
  
  useClickOutside(popoverRef, () => setIsPopoverOpen(false));

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // 2. USE authFetch
        const response = await authFetch('/notifications');
        const data = await response.json();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 300000);
    return () => clearInterval(interval);

  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">trackbudgetbuild</div>
      <div className="navbar-icons">
        <div className="notification-wrapper" ref={popoverRef}>
          <button 
            className="navbar-icon-button" 
            onClick={() => setIsPopoverOpen(!isPopoverOpen)}
          >
            🔔
            {notifications.length > 0 && (
              <span className="notification-badge">
                {notifications.length}
              </span>
            )}
          </button>
          {isPopoverOpen && (
            <NotificationPopover notifications={notifications} />
          )}
        </div>
        <Link to="/settings" className="navbar-icon-link">⚙️</Link>
        <Link to="/profile" className="navbar-icon-link">👤</Link>
      </div>
    </nav>
  );
}

export default Navbar;