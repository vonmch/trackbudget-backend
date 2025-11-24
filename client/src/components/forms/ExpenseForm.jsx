// src/components/forms/ExpenseForm.jsx

import React, { useState, useEffect } from 'react';
import './ExpenseForm.css';
import { authFetch } from '../../utils/api'; // Note the double dot ../../

function ExpenseForm({ onSave, onCancel, existingExpense }) {
  const isEditMode = Boolean(existingExpense); 

  const [expenseName, setExpenseName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [wantOrNeed, setWantOrNeed] = useState('want');

  useEffect(() => {
    if (isEditMode) {
      setExpenseName(existingExpense.name);
      setAmount(existingExpense.amount);
      setDate(existingExpense.date);
      setWantOrNeed(existingExpense.want_or_need);
    }
  }, [isEditMode, existingExpense]);

  const handleSubmit = async (event) => {
    event.preventDefault(); 

    const formData = {
      name: expenseName,
      amount: parseFloat(amount),
      date: date,
      want_or_need: wantOrNeed,
    };

    if (isEditMode) {
      try {
        await authFetch(`/expenses/${existingExpense.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        onSave(); 
      } catch (error) {
        console.error('Error updating expense:', error);
        alert('Failed to update expense.');
      }
    } else {
      try {
        await authFetch('/expenses', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
        onSave();
      } catch (error) {
        console.error('Error sending data to backend:', error);
        alert('Failed to add expense.');
      }
    }
  };

  return (
    <form className="expense-form" onSubmit={handleSubmit}>
      <h3>{isEditMode ? 'Edit Expense' : 'Add New Expense'}</h3>
      
      <div className="form-group">
        <label htmlFor="expense-name">Expense Name</label>
        <input 
          type="text" 
          id="expense-name" 
          placeholder="Fast food"
          value={expenseName}
          onChange={(e) => setExpenseName(e.target.value)}
          required
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="expense-amount">Expense Amount</label>
          <input 
            type="number" 
            id="expense-amount" 
            placeholder="5.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="expense-date">Date</label>
          <input 
            type="date" 
            id="expense-date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group-radio">
        <label>Want or Need?</label>
        <div className="radio-options">
          <input 
            type="radio" 
            id="want" 
            name="want-need" 
            value="want"
            checked={wantOrNeed === 'want'}
            onChange={(e) => setWantOrNeed(e.target.value)}
          />
          <label htmlFor="want">Want</label>
          
          <input 
            type="radio" 
            id="need" 
            name="want-need" 
            value="need"
            checked={wantOrNeed === 'need'}
            onChange={(e) => setWantOrNeed(e.target.value)}
          />
          <label htmlFor="need">Need</label>
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

export default ExpenseForm;