// src/pages/RetirementPage.jsx

import React, { useState, useEffect } from 'react';
import './RetirementPage.css';
import './TrackerPage.css';
import { authFetch } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatting';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Modal from '../components/common/Modal';
import RetirementForm from '../components/forms/RetirementForm';
import ContributionForm from '../components/forms/ContributionForm';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

function RetirementPage({ isPremium }) {
  const [plan, setPlan] = useState({ 
    current_age: 30, retire_age: 65, current_savings: 0, retirement_goal: 1000000 
  });
  const [contributions, setContributions] = useState([]);
  const [breakdown, setBreakdown] = useState([]);
  const [isPlanModalOpen, setPlanModalOpen] = useState(false);
  const [isContribModalOpen, setContribModalOpen] = useState(false);
  const [contribToEdit, setContribToEdit] = useState(null);

  const fetchData = async () => {
    try {
      const planRes = await authFetch('/retirement');
      const planData = await planRes.json();
      setPlan(planData);

      const contribRes = await authFetch('/retirement/contributions');
      const contribData = await contribRes.json();
      setContributions(contribData);

      const summaryRes = await authFetch('/retirement/summary');
      const summaryData = await summaryRes.json();
      setBreakdown(summaryData.map(item => ({ name: item.type, value: parseFloat(item.total) })));

    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const yearsLeft = plan.retire_age - plan.current_age;
  const totalSaved = plan.total_saved || 0;
  const goal = parseFloat(plan.retirement_goal);
  const progress = Math.min((totalSaved / goal) * 100, 100);
  const monthlyNeeded = yearsLeft > 0 ? (goal - totalSaved) / (yearsLeft * 12) : 0;

  const handleDelete = async (id) => {
    if(window.confirm("Delete this contribution?")) {
        await authFetch(`/retirement/contributions/${id}`, { method: 'DELETE' });
        fetchData();
    }
  };

  const handleAddClick = () => {
      if(isPremium) { setContribToEdit(null); setContribModalOpen(true); } 
      else { alert("Upgrade to Premium to add savings!"); }
  };

  return (
    <div className="retirement-page">
      {/* --- LEFT COLUMN --- */}
      <div className="retirement-left-col">
        <div className="retirement-card stats-card-retirement">
          <div className="stats-header">
            <h3>Stats</h3>
            <button className="edit-btn-small" onClick={() => setPlanModalOpen(true)}>Adjust Goal</button>
          </div>
          
          <div className="stats-body">
            <p>Monthly Deposit To Meet Goal:</p>
            <h2 style={{color: '#4CAF50', margin: '10px 0'}}>{formatCurrency(monthlyNeeded)}</h2>
            
            <div style={{width: '100%', height: '200px'}}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie 
                            data={[{name: 'Saved', value: totalSaved}, {name: 'Remaining', value: goal - totalSaved}]} 
                            innerRadius={60} outerRadius={80} 
                            dataKey="value"
                        >
                            <Cell fill="#0088FE" />
                            <Cell fill="#333" />
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                </ResponsiveContainer>
                <div className="chart-overlay"><strong>{progress.toFixed(0)}%</strong></div>
            </div>

            <div className="goal-summary">
                <div><span>Goal:</span><br/><strong>{formatCurrency(goal)}</strong></div>
                <div><span>Saved:</span><br/><strong>{formatCurrency(totalSaved)}</strong></div>
            </div>
            <p style={{marginTop: '15px', fontSize: '0.9em', color: '#888'}}>
                {yearsLeft} years till retirement!
            </p>
          </div>
        </div>

        <div className="retirement-card" style={{padding: '20px'}}>
            <h3>Contribution Breakdown</h3>
            {breakdown.map((item, index) => (
                <div key={index} style={{display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #444'}}>
                    <span>{item.name}</span>
                    <span>{formatCurrency(item.value)}</span>
                </div>
            ))}
        </div>
      </div>

      {/* --- RIGHT COLUMN (Now uses retirement-card class) --- */}
      <div className="retirement-right-col">
        <div className="retirement-card" style={{height: '100%', minHeight: '500px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                <h3>Retirement Savings</h3>
                <button className="add-new-btn" onClick={handleAddClick}>+ New</button>
            </div>
            
            <div className="data-table">
                <table>
                    <thead>
                        <tr><th>Amount</th><th>Type</th><th>Date</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {contributions.map(c => (
                            <tr key={c.id}>
                                <td>{formatCurrency(c.amount)}</td>
                                <td>{c.type}</td>
                                <td>{formatDate(c.date)}</td>
                                <td>
                                    <button className="edit-btn" onClick={() => { setContribToEdit(c); setContribModalOpen(true); }}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDelete(c.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      {/* Modals */}
      {isPlanModalOpen && (
        <Modal onClose={() => setPlanModalOpen(false)}>
            <RetirementForm initialData={plan} onSave={() => { setPlanModalOpen(false); fetchData(); }} onCancel={() => setPlanModalOpen(false)} />
        </Modal>
      )}
      {isContribModalOpen && (
        <Modal onClose={() => setContribModalOpen(false)}>
            <ContributionForm existingContrib={contribToEdit} onSave={() => { setContribModalOpen(false); fetchData(); }} onCancel={() => setContribModalOpen(false)} />
        </Modal>
      )}
    </div>
  );
}

export default RetirementPage;