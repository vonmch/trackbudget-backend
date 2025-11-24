// src/components/forms/BucketForm.jsx

import React, { useState, useEffect } from 'react';
import './BucketForm.css';
import { authFetch } from '../../utils/api';

function BucketForm({ onSave, onCancel, existingBucket }) {
  const isEditMode = Boolean(existingBucket);

  const [bucketName, setBucketName] = useState('');
  const [goal, setGoal] = useState('');
  const [currentAmount, setCurrentAmount] = useState(0);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isEditMode) {
      setBucketName(existingBucket.name);
      setGoal(existingBucket.target_amount);
      setCurrentAmount(existingBucket.current_amount);
      setEndDate(existingBucket.end_date ? existingBucket.end_date.split('T')[0] : '');
    }
  }, [isEditMode, existingBucket]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      name: bucketName,
      target_amount: parseFloat(goal),
      current_amount: parseFloat(currentAmount),
      end_date: endDate || null,
    };

    if (isEditMode) {
      try {
        await authFetch(`/savings/${existingBucket.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
        onSave();
      } catch (error) {
        console.error('Error updating bucket:', error);
        alert('Failed to update bucket.');
      }
    } else {
      const createFormData = {
        name: bucketName,
        target_amount: parseFloat(goal),
        end_date: endDate || null,
      };
      try {
        await authFetch('/savings', {
          method: 'POST',
          body: JSON.stringify(createFormData),
        });
        onSave();
      } catch (error) {
        console.error('Error creating bucket:', error);
        alert('Failed to create bucket.');
      }
    }
  };

  return (
    <form className="bucket-form" onSubmit={handleSubmit}>
      <h3>{isEditMode ? 'Edit Bucket' : 'Create New Bucket'}</h3>
      
      <div className="form-group">
        <label htmlFor="bucket-name">Bucket Name</label>
        <input 
          type="text" 
          id="bucket-name" 
          placeholder="New House" 
          value={bucketName}
          onChange={(e) => setBucketName(e.target.value)}
          required
        />
      </div>
      
      {isEditMode && (
        <div className="form-group">
          <label htmlFor="current-amount">Current Amount</label>
          <input 
            type="number" 
            id="current-amount" 
            placeholder="0.00" 
            value={currentAmount}
            onChange={(e) => setCurrentAmount(e.target.value)}
            required
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="bucket-goal">Goal</label>
          <input 
            type="number" 
            id="bucket-goal" 
            placeholder="5000.00" 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="end-date">End Date (Optional)</label>
          <input 
            type="date" 
            id="end-date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-add">
          {isEditMode ? 'Save Changes' : 'Create'}
        </button>
      </div>
    </form>
  );
}

export default BucketForm;