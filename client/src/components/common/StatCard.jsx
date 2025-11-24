// src/components/common/StatCard.jsx

import React from 'react';
import './StatCard.css';

// We'll pass in an icon, title, value, and a % change
function StatCard({ icon, title, value, change }) {
  // Determine color for the percentage change
  const isPositive = change && change.startsWith('+');
  const isNegative = change && change.startsWith('-');
  const changeColor = isPositive ? 'text-green' : isNegative ? 'text-red' : 'text-grey';

  return (
    <div className="stat-card">
      <div className="stat-icon-container">
        {icon}
      </div>
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <strong className="stat-value">{value}</strong>
        {change && (
          <span className={`stat-change ${changeColor}`}>
            {change}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatCard;