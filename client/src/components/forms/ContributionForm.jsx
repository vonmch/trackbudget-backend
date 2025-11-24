// src/components/forms/ContributionForm.jsx

import React, { useState, useEffect } from 'react';
import './ContributionForm.css';
import { authFetch } from '../../utils/api';

const STANDARD_CONTRIB_TYPES = ['401k', '403b', 'Roth IRA', 'Other'];

function ContributionForm({ onSave, onCancel, existingContribution }) {
  const isEditMode = Boolean(existingContribution);

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('401k');
  const [customType, setCustomType] = useState('');

  useEffect(() => {
    if (isEditMode) {
      setAmount(existingContribution.amount);
      setDate(existingContribution.date.split('T')[0]);
      
      if (STANDARD_CONTRIB_TYPES.includes(existingContribution.type)) {
        setType(existingContribution.type);
        setCustomType('');
      } else {
        setType('Other');
        setCustomType(existingContribution.type);
      }
    }
  }, [isEditMode, existingContribution]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const finalType = type === 'Other' ? customType : type;
    
    const formData = {
      amount: parseFloat(amount),
      date: date,
      type: finalType,
    };

    const url = isEditMode
      ? `/retirement/contributions/${existingContribution.id}`
      : '/retirement/contributions';
    
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      await authFetch(url, {
        method: method,
        body: JSON.stringify(formData),
      });
      onSave();
    } catch (error) {
      console.error(`Error saving contribution:`, error);
      alert(`Failed to save contribution.`);
    }
  };

  return (
    <form className="contribution-form" onSubmit={handleSubmit}>
      <h3>{isEditMode ? 'Edit Contribution' : 'Add Contribution'}</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Amount</label>
          <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
      </div>
      <div className="form-group">
        <label>Type</label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="401k">401K</option>
          <option value="403b">403B</option>
          <option value="Roth IRA">Roth IRA</option>
          <option value="Other">Other (Please specify)</option>
        </select>
        {type === 'Other' && (
          <div className="form-group custom-type-input">
            <label>Custom Type:</label>
            <input type="text" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="e.g., Brokerage" required />
          </div>
        )}
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-add">{isEditMode ? 'Save Changes' : 'Add'}</button>
      </div>
    </form>
  );
}

export default ContributionForm;