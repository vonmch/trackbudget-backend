// src/pages/ExpenseTrackerPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './TrackerPage.css';
import Modal from '../components/common/Modal';
import ExpenseForm from '../components/forms/ExpenseForm'; 
import DonutChart from '../components/common/DonutChart';
import { formatCurrency } from '../utils/formatting';
import { authFetch } from '../utils/api'; 

function ExpenseTrackerPage({ isPremium }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const fetchExpenses = async () => {
    try {
      const response = await authFetch('/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(Array.isArray(data) ? data : []);
      } else {
        setExpenses([]); 
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setExpenses([]);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const chartData = useMemo(() => {
    const totals = { Wants: 0, Needs: 0 };
    if (!expenses || expenses.length === 0) {
      return [{ name: 'Wants', value: 0 }, { name: 'Needs', value: 0 }];
    }

    expenses.forEach(expense => {
      // FIX: Parse string to number!
      const amount = parseFloat(expense.amount);
      if (expense.want_or_need === 'want') totals.Wants += amount;
      else if (expense.want_or_need === 'need') totals.Needs += amount;
    });
    
    return [
      { name: 'Wants', value: totals.Wants },
      { name: 'Needs', value: totals.Needs },
    ];
  }, [expenses]);

  const totalWants = chartData[0]?.value || 0;
  const totalNeeds = chartData[1]?.value || 0;
  const totalExpenses = totalWants + totalNeeds;

  const openCreateModal = () => { setExpenseToEdit(null); setIsModalOpen(true); };
  const openEditModal = (expense) => { setExpenseToEdit(expense); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setExpenseToEdit(null); };
  const handleSave = () => { closeModal(); fetchExpenses(); };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await authFetch(`/expenses/${expenseId}`, { method: 'DELETE' });
        fetchExpenses();
      } catch (error) { console.error('Error deleting expense:', error); }
    }
  };

  const handleAddClick = () => {
    if (isPremium) {
      openCreateModal();
    } else {
      alert("Please upgrade to Premium to add new expenses!");
    }
  };

  return (
    <>
      <div className="data-container" style={{ marginTop: '24px' }}>
        <h3>Expenses</h3>
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
                <tr><th>Name</th><th>Amount</th><th>Date</th><th>Want/Need</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {!expenses || expenses.length === 0 ? (
                  <tr><td colSpan="5">No data available in table</td></tr>
                ) : (
                  expenses.map((expense) => (
                    <tr key={expense.id}>
                      <td>{expense.name}</td>
                      <td>{formatCurrency(expense.amount)}</td>
                      <td>{expense.date}</td>
                      <td className="want-need-cell">{expense.want_or_need}</td>
                      <td>
                        <button className="edit-btn" onClick={() => openEditModal(expense)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteExpense(expense.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <div className="stats-container" style={{ marginTop: '24px' }}>
        <h3>Stats</h3>
        <div className="chart-container">
          <DonutChart data={chartData} />
          <div className="chart-total">
            Total<br/><span>{formatCurrency(totalExpenses)}</span>
          </div>
        </div>
        <div className="stats-legend">
          <div>
            <span className="legend-dot" style={{ backgroundColor: '#5465ff' }}></span>
            Wants ({totalExpenses > 0 ? ((totalWants / totalExpenses) * 100).toFixed(0) : 0}%)
            <span>{formatCurrency(totalWants)}</span>
          </div>
          <div>
            <span className="legend-dot" style={{ backgroundColor: '#2ed47a' }}></span>
            Needs ({totalExpenses > 0 ? ((totalNeeds / totalExpenses) * 100).toFixed(0) : 0}%)
            <span>{formatCurrency(totalNeeds)}</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <ExpenseForm onCancel={closeModal} onSave={handleSave} existingExpense={expenseToEdit} />
        </Modal>
      )}
    </>
  );
}

export default ExpenseTrackerPage;