// src/components/layout/NotificationPopover.jsx

import React from 'react';
import './NotificationPopover.css'; // We'll create this next
import { Link } from 'react-router-dom';

function NotificationPopover({ notifications }) {
  
  // A helper function to calculate "days from now"
  const daysFromNow = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    // Calculate the difference in milliseconds, then convert to days
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
                  <strong>{bill.name}</strong> (${bill.amount.toFixed(2)}) 
                  is {daysFromNow(bill.due_date)}.
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