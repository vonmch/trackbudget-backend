// src/components/layout/NotificationPopover.jsx (Fixed Crash)

import React from 'react';
import './NotificationPopover.css';
import { Link } from 'react-router-dom';

function NotificationPopover({ notifications }) {
  
  const daysFromNow = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  return (
    <div className="notification-popover">
      <div className="popover-header">
        You have {notifications.length} new notification(s)
      </div>
      <div className="popover-content">
        {notifications.length === 0 ? (
          <div className="no-notifications">
            You're all caught up!
          </div>
        ) : (
          <ul className="notification-list">
            {notifications.map((bill) => (
              <li key={bill.id} className="notification-item">
                <Link to="/bills">
                  {/* --- THE FIX IS HERE --- */}
                  {/* We convert the text string to a float number before formatting */}
                  <strong>{bill.name}</strong> (${parseFloat(bill.amount).toFixed(2)}) 
                  is {daysFromNow(bill.due_date)}.
                  {/* ----------------------- */}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default NotificationPopover;