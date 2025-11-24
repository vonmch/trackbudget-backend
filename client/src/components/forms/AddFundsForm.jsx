// src/components/forms/AddFundsForm.jsx
// Note: This form is unique because the handleAddFunds logic is in the parent Page component.
// But we should still ensure it imports the CSS correctly.

import React, { useState } from 'react';
import './BucketForm.css'; 

function AddFundsForm({ onSave, onCancel, bucketName }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    // This form passes the amount back to the Page component to handle the API call.
    // Ensure SavingsBucketsPage.jsx is using authFetch (it should be from the previous step).
    try {
      await onSave(parseFloat(amount)); 
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Failed to add funds.');
    }
  };

  return (
    <form className="bucket-form" onSubmit={handleSubmit}>
      <h3>Add Funds to "{bucketName}"</h3>
      
      <div className="form-group">
        <label htmlFor="fund-amount">Amount to Add</label>
        <input 
          type="number" 
          id="fund-amount" 
          placeholder="50.00" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-add">
          Add Funds
        </button>
      </div>
    </form>
  );
}

export default AddFundsForm;