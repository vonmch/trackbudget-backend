// src/components/forms/RetirementForm.jsx

import React, { useState } from 'react';
import './BucketForm.css';
import { authFetch } from '../../utils/api';

function RetirementForm({ onCancel, onPlanSaved, plan }) {
  const [currentAge, setCurrentAge] = useState(plan.current_age || 0);
  const [retireAge, setRetireAge] = useState(plan.retire_age || 0);
  const [currentSavings, setCurrentSavings] = useState(plan.current_savings || 0);
  const [goal, setGoal] = useState(plan.retirement_goal || 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = {
      current_age: parseInt(currentAge),
      retire_age: parseInt(retireAge),
      current_savings: parseFloat(currentSavings),
      retirement_goal: parseFloat(goal),
    };

    try {
      await authFetch('/retirement', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      onPlanSaved();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan.');
    }
  };

  return (
    <form className="bucket-form" onSubmit={handleSubmit}>
      <h3>Retirement Planner</h3>
      <div className="form-row">
        <div className="form-group">
          <label>Current Age</label>
          <input type="number" value={currentAge} onChange={(e) => setCurrentAge(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Retire Age</label>
          <input type="number" value={retireAge} onChange={(e) => setRetireAge(e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Current Savings</label>
          <input type="number" value={currentSavings} onChange={(e) => setCurrentSavings(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Retirement Goal</label>
          <input type="number" value={goal} onChange={(e) => setGoal(e.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-add">Save</button>
      </div>
    </form>
  );
}

export default RetirementForm;