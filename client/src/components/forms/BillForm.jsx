// src/components/forms/BillForm.jsx

import React, { useState, useEffect } from 'react';
import './BillForm.css';
import { authFetch } from '../../utils/api'; // Import authFetch

const STANDARD_BILL_TYPES = ['Utility Bill', 'Insurance', 'Rent', 'Mortgage', 'Subscription', 'Other'];

function BillForm({ onSave, onCancel, existingBill }) {
  const isEditMode = Boolean(existingBill);

  const [type, setType] = useState('Utility Bill');
  const [customType, setCustomType] = useState(''); 
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminder, setReminder] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setName(existingBill.name);
      setAmount(existingBill.amount);
      setDueDate(existingBill.due_date.split('T')[0]);
      setReminder(existingBill.reminder);

      if (STANDARD_BILL_TYPES.includes(existingBill.type)) {
        setType(existingBill.type);
        setCustomType('');
      } else {
        setType('Other');
        setCustomType(existingBill.type);
      }
    }
  }, [isEditMode, existingBill]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const finalType = type === 'Other' ? customType : type;

    const formData = {
      name,
      amount: parseFloat(amount),
      due_date: dueDate,
      type: finalType,
      reminder,
    };

    const url = isEditMode ? `/bills/${existingBill.id}` : '/bills';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      await authFetch(url, {
        method: method,
        body: JSON.stringify(formData),
      });
      onSave(); 
    } catch (error) {
      console.error(`Error saving bill:`, error);
      alert(`Failed to save bill.`);
    }
  };

  return (
    <form className="bill-form" onSubmit={handleSubmit}>
      <h3>{isEditMode ? 'Edit Bill' : 'Add New Bill'}</h3>
      
      <div className="form-group">
        <label>Bill Name</label>
        <input type="text" placeholder="Apartment Rent" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Bill Amount</label>
          <input type="number" placeholder="5.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </div>
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label>Bill Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Utility Bill">Utility Bill</option>
            <option value="Insurance">Insurance</option>
            <option value="Rent">Rent</option>
            <option value="Mortgage">Mortgage</option>
            <option value="Subscription">Subscription</option>
            <option value="Other">Other (Please specify)</option>
          </select>
          
          {type === 'Other' && (
            <div className="form-group custom-type-input">
              <label>Custom Bill Type:</label>
              <input 
                type="text" 
                value={customType} 
                onChange={(e) => setCustomType(e.target.value)}
                placeholder="e.g., Gym Membership"
                required 
              />
            </div>
          )}
        </div>
        
        <div className="form-group-checkbox">
          <label>Reminder?</label>
          <input 
            type="checkbox" 
            checked={reminder}
            onChange={(e) => setReminder(e.target.checked)}
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

export default BillForm;