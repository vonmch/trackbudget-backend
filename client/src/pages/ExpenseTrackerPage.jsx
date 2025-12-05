// src/pages/ExpenseTrackerPage.jsx

import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/api';
import { formatCurrency } from '../utils/formatting';
import ExpenseForm from '../components/forms/ExpenseForm';
import Modal from '../components/common/Modal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './TrackerPage.css';

function ExpenseTrackerPage({ isPremium }) {
  const [expenses, setExpenses] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  const fetchExpenses = async () => {
    const response = await authFetch('/expenses');
    const data = await response.json();
    setExpenses(data);
  };

  useEffect(() => { fetchExpenses(); }, []);

  const handleSave = () => { setIsModalOpen(false); setExpenseToEdit(null); fetchExpenses(); };
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      await authFetch(`/expenses/${id}`, { method: 'DELETE' });
      fetchExpenses();
    }
  };

  const openAddModal = () => { setExpenseToEdit(null); setIsModalOpen(true); };
  const openEditModal = (expense) => { setExpenseToEdit(expense); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setExpenseToEdit(null); };

  // --- Calculations ---
  const totalExpenses = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalWant = expenses.filter(e => e.want_or_need === 'want').reduce((sum, item) => sum + Number(item.amount), 0);
  const totalNeed = expenses.filter(e => e.want_or_need === 'need').reduce((sum, item) => sum + Number(item.amount), 0);
  
  const wantPercent = totalExpenses > 0 ? Math.round((totalWant / totalExpenses) * 100) : 0;
  const needPercent = totalExpenses > 0 ? Math.round((totalNeed / totalExpenses) * 100) : 0;

  const chartData = [
    { name: 'Needs', value: totalNeed, color: '#4CAF50' }, // Green
    { name: 'Wants', value: totalWant, color: '#536dfe' }  // Blue
  ]; // Note: Removed .filter() so we show 0 values in list if empty

  // Custom Tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-chart-tooltip">
          <p className="tooltip-label" style={{color: data.color}}>
            <span className="legend-block" style={{backgroundColor: data.color}}></span>
            {data.name}
          </p>
          <p className="tooltip-value">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="tracker-page">
      <div className="tracker-header">
        <h2>Expenses</h2>
      </div>

      <div className="tracker-top-section">
        {/* Left: Table */}
        <div className="data-container table-container">
          <div className="table-header">
              <button className="add-new-btn" onClick={openAddModal}>+ New</button>
          </div>
          <div className="data-table-scrollable">
            <div className="data-table">
              <table>
                <thead>
                  <tr><th>Name</th><th>Amount</th><th>Date</th><th>Type</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {expenses.map(expense => (
                    <tr key={expense.id}>
                      <td>{expense.name}</td>
                      <td>{formatCurrency(expense.amount)}</td>
                      <td>{expense.date}</td>
                      <td>
                        <span className={`badge ${expense.want_or_need === 'want' ? 'badge-want' : 'badge-need'}`}>
                            {expense.want_or_need}
                        </span>
                      </td>
                      <td>
                        <button className="edit-btn" onClick={() => openEditModal(expense)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(expense.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Stats Chart */}
        <div className="data-container stats-container">
          <h3>Stats</h3>
          
          {/* 1. The Graph */}
          <div className="chart-wrapper" style={{ height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.filter(d => d.value > 0)} // Only graph data that exists
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* 2. The New Clean List (Below Graph) */}
          <div className="stats-list">
            
            {/* Total Row */}
            <div className="stat-row total-row">
                <span>Total</span>
                <strong>{formatCurrency(totalExpenses)}</strong>
            </div>

            {/* Legend Rows */}
            {chartData.map((entry, index) => (
                 <div key={index} className="stat-row">
                    <div className="legend-label">
                        {/* The Colored Block */}
                        <span className="legend-block" style={{backgroundColor: entry.color}}></span>
                        {/* Name + Percent */}
                        <span>{entry.name} ({entry.name === 'Wants' ? wantPercent : needPercent}%)</span>
                    </div>
                    {/* Value */}
                    <strong>{formatCurrency(entry.value)}</strong>
                 </div>
            ))}
          </div>

        </div>
      </div>

      {isModalOpen && (
        <Modal onClose={closeModal}>
          <ExpenseForm onSave={handleSave} onCancel={closeModal} expenseToEdit={expenseToEdit} />
        </Modal>
      )}
    </div>
  );
}

export default ExpenseTrackerPage;