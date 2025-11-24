// src/pages/RetirementPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './RetirementPage.css';
import './TrackerPage.css';
import Modal from '../components/common/Modal';
import RetirementForm from '../components/forms/RetirementForm';
import GaugeChart from '../components/common/GaugeChart';
import ContributionForm from '../components/forms/ContributionForm';
import { formatCurrency } from '../utils/formatting';
import { authFetch } from '../utils/api'; 

// 1. Accept 'isPremium' prop
function RetirementPage({ isPremium }) {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isContribModalOpen, setIsContribModalOpen] = useState(false);
  const [plan, setPlan] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [contributionToEdit, setContributionToEdit] = useState(null);
  const [summary, setSummary] = useState([]);

  const fetchPlan = async () => {
    try {
      const response = await authFetch('/retirement');
      const data = await response.json();
      setPlan(data);
    } catch (error) {
      console.error('Error fetching retirement plan:', error);
    }
  };
  const fetchContributions = async () => {
    try {
      const response = await authFetch('/retirement/contributions');
      const data = await response.json();
      setContributions(data);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    }
  };
  const fetchSummary = async () => {
    try {
      const response = await authFetch('/retirement/summary');
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error('Error fetching retirement summary:', error);
    }
  };

  useEffect(() => {
    fetchPlan();
    fetchContributions();
    fetchSummary();
  }, []);

  const handlePlanSaved = () => {
    setIsGoalModalOpen(false);
    fetchPlan();
  };
  
  const openCreateContribModal = () => { setContributionToEdit(null); setIsContribModalOpen(true); };
  const openEditContribModal = (contrib) => { setContributionToEdit(contrib); setIsContribModalOpen(true); };
  const closeContribModal = () => { setIsContribModalOpen(false); setContributionToEdit(null); };
  const handleContributionSave = () => {
    closeContribModal();
    fetchPlan();
    fetchContributions();
    fetchSummary();
  };
  
  const handleDeleteContribution = async (contribId) => {
    if (window.confirm('Are you sure you want to delete this contribution?')) {
      try {
        await authFetch(`/retirement/contributions/${contribId}`, {
          method: 'DELETE',
        });
        fetchPlan();
        fetchContributions();
        fetchSummary();
      } catch (error) {
        console.error('Error deleting contribution:', error);
      }
    }
  };

  const projections = useMemo(() => {
    if (!plan || plan.retire_age <= plan.current_age || plan.retirement_goal === 0) {
      return { yearsLeft: 0, monthsLeft: 0, monthlyDeposit: 0, percentageSaved: 0 };
    }
    const goalToSave = plan.retirement_goal - plan.total_saved;
    const totalMonths = (plan.retire_age - plan.current_age) * 12;
    const monthlyDeposit = (goalToSave > 0 && totalMonths > 0) ? goalToSave / totalMonths : 0;
    const percentageSaved = (plan.total_saved / plan.retirement_goal) * 100;
    return {
      yearsLeft: Math.floor(totalMonths / 12),
      monthsLeft: totalMonths % 12,
      monthlyDeposit: monthlyDeposit,
      percentageSaved: percentageSaved,
    };
  }, [plan]);

  // 2. Handle Locks
  const handleAddClick = () => {
    if (isPremium) {
      openCreateContribModal();
    } else {
      alert("Please upgrade to Premium to add retirement contributions!");
    }
  };
  
  const handleAdjustGoalClick = () => {
    if (isPremium) {
      setIsGoalModalOpen(true);
    } else {
      alert("Please upgrade to Premium to adjust your retirement goals!");
    }
  };

  if (!plan) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="retirement-layout">
        <div className="retirement-left-column">
          <div className="stats-container-retirement">
            <h3>Stats</h3>
            {/* 3. Apply Lock to Goal Adjust */}
            <button 
              className="adjust-goal-btn" 
              onClick={handleAdjustGoalClick}
              style={{ cursor: isPremium ? 'pointer' : 'not-allowed', opacity: isPremium ? 1 : 0.6 }}
            >
              {isPremium ? 'Adjust Goal' : 'Locked'}
            </button>
            <div className="monthly-deposit">
              <span>Monthly Deposit To Meet Goal:</span>
              <strong>{formatCurrency(projections.monthlyDeposit)}</strong>
            </div>
            <GaugeChart value={projections.percentageSaved} />
            <div className="retirement-summary">
              <div><span>Goal:</span> <strong>{formatCurrency(plan.retirement_goal)}</strong></div>
              <div><span>Saved:</span> <strong>{formatCurrency(plan.total_saved)}</strong></div>
            </div>
            <div className="time-left">
              {projections.yearsLeft} years, {projections.monthsLeft} months till retirement!
            </div>
          </div>
          
          <div className="breakdown-card">
            <h3>Contribution Breakdown</h3>
            <ul className="breakdown-list">
              {summary.length === 0 ? (
                <li className="breakdown-item empty">No contributions yet.</li>
              ) : (
                summary.map((item) => (
                  <li key={item.type} className="breakdown-item">
                    <span>{item.type}</span>
                    <strong>{formatCurrency(item.total)}</strong>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
        
        <div className="retirement-right-column">
          <div className="data-container">
            <h3>Retirement Savings</h3>
            {/* 4. Apply Lock to Add Button */}
            <button 
              className="add-new-btn" 
              onClick={handleAddClick}
              style={{ opacity: isPremium ? 1 : 0.5, cursor: isPremium ? 'pointer' : 'not-allowed' }}
            >
              {isPremium ? '+ New' : '🔒 Locked'}
            </button>
            <div className="data-table-scrollable">
              <div className="data-table">
                <table>
                  <thead>
                    <tr><th>Amount</th><th>Type</th><th>Date</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {contributions.length === 0 ? (
                      <tr><td colSpan="4">No contributions added yet</td></tr>
                    ) : (
                      contributions.map((item) => (
                        <tr key={item.id}>
                          <td>{formatCurrency(item.amount)}</td>
                          <td>{item.type}</td>
                          <td>{item.date.split('T')[0]}</td>
                          <td>
                            <button className="edit-btn" onClick={() => openEditContribModal(item)}>Edit</button>
                            <button className="delete-btn" onClick={() => handleDeleteContribution(item.id)}>Delete</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isGoalModalOpen && (
        <Modal onClose={() => setIsGoalModalOpen(false)}>
          <RetirementForm onCancel={() => setIsGoalModalOpen(false)} onPlanSaved={handlePlanSaved} plan={plan} />
        </Modal>
      )}
      {isContribModalOpen && (
        <Modal onClose={closeContribModal}>
          <ContributionForm onCancel={closeContribModal} onSave={handleContributionSave} existingContribution={contributionToEdit} />
        </Modal>
      )}
    </>
  );
}

export default RetirementPage;