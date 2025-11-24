// src/components/common/UpcomingBillsCard.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './UpcomingBillsCard.css';
import { formatCurrency } from '../../utils/formatting';
import { authFetch } from '../../utils/api'; // <--- 1. IMPORT THIS

const formatDueDate = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Due Today';
  if (diffDays === 1) return 'Due Tomorrow';
  return `Due in ${diffDays} days`;
};

function UpcomingBillsCard() {
  const [upcomingBills, setUpcomingBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        // 2. USE authFetch
        const response = await authFetch('/notifications');
        const data = await response.json();
        setUpcomingBills(data);
      } catch (error) {
        console.error("Failed to fetch upcoming bills:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBills();
  }, []);

  return (
    <div className="dashboard-card">
      <div className="upcoming-bills-header">
        <h3 className="card-title">Upcoming Bills</h3>
        <Link to="/bills" className="view-all-link">View All</Link>
      </div>

      <div className="upcoming-bills-content">
        {isLoading && <p>Loading bills...</p>}
        
        {!isLoading && upcomingBills.length === 0 && (
          <p className="no-bills-message">🎉 You're all caught up! No bills due in the next 7 days.</p>
        )}

        {!isLoading && upcomingBills.length > 0 && (
          <ul className="upcoming-bills-list">
            {upcomingBills.map((bill) => (
              <li key={bill.id} className="upcoming-bill-item">
                <div className="bill-info">
                  <span className="bill-name">{bill.name}</span>
                  <span className="bill-due">{formatDueDate(bill.due_date)}</span>
                </div>
                <div className="bill-amount">
                  {formatCurrency(bill.amount)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default UpcomingBillsCard;