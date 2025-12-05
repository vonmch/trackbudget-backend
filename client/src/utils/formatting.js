// src/utils/formatting.js

// 1. Currency Formatter (You already had this)
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// 2. NEW: Date Formatter (Converts 2025-12-25 to 12/25/2025)
export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  // Check if it looks like YYYY-MM-DD
  if (dateString.includes('-')) {
    const parts = dateString.split('T')[0].split('-'); // Handle "2025-12-25T00:00:00" too
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${month}/${day}/${year}`;
    }
  }
  
  // Fallback
  return new Date(dateString).toLocaleDateString('en-US');
};