// src/components/forms/IncomeForm.jsx

import React, { useState, useEffect } from 'react';
import './IncomeForm.css';
import { authFetch } from '../../utils/api'; // Import authFetch

function IncomeForm({ onSave, onCancel, existingIncome }) {
  const isEditMode = Boolean(existingIncome);

  const [incomeName, setIncomeName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isEditMode) {
      setIncomeName(existingIncome.name);
      setAmount(existingIncome.amount);
      setDate(existingIncome.date);
    }
  }, [isEditMode, existingIncome]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      name: incomeName,
      amount: parseFloat(amount),
      date: date,
    };

    if (isEditMode) {
      try {
        // Use authFetch and short path
        await authFetch(`/income/${existingIncome.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        onSave();
      } catch (error) {
        console.error('Error updating income:', error);
        alert('Failed to update income.');
      }
    } else {
      try {
        // Use authFetch and short path
        await authFetch('/income', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        onSave();
      } catch (error) {
        console.error('Error sending data to backend:', error);
        alert('Failed to add income.');
      }
    }
  };

  return (
    <form className="income-form" onSubmit={handleSubmit}>
      <h3>{isEditMode ? 'Edit Income' : 'Add New Income'}</h3>
      
      <div className="form-group">
        <label htmlFor="income-name">Income Name</label>
        <input 
          type="text" 
          id="income-name" 
          placeholder="Paycheck"
          value={incomeName}
          onChange={(e) => setIncomeName(e.target.value)}
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="income-amount">Income Amount</label>
          <input 
            type="number" 
            id="income-amount" 
            placeholder="5.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="income-date">Date</label>
          <input 
            type="date" 
            id="income-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-add">
          {isEditMode ? 'Save Changes' : 'Add'}
        </button>
      </div>
    </form>
  );
}

export default IncomeForm;