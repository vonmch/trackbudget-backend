// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import StatCard from '../components/common/StatCard';
import SimpleBarChart from '../components/common/SimpleBarChart';
import UpcomingBillsCard from '../components/common/UpcomingBillsCard';
import { authFetch } from '../utils/api'; 
import { formatCurrency } from '../utils/formatting';

function DashboardPage() {
  // State for the Totals
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  
  // State for Charts & Lists
  const [bills, setBills] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]); // For chart

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Expenses
        const expenseRes = await authFetch('/expenses');
        const expenseData = await expenseRes.json();
        const expenseSum = expenseData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        setTotalExpenses(expenseSum);

        // 2. Fetch Income
        const incomeRes = await authFetch('/income');
        const incomeData = await incomeRes.json();
        const incomeSum = incomeData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        setTotalIncome(incomeSum);

        // 3. Fetch Assets (Net Worth)
        const assetRes = await authFetch('/assets');
        const assetData = await assetRes.json();
        const assetSum = assetData.reduce((sum, item) => sum + (parseFloat(item.worth) || 0), 0);
        setNetWorth(assetSum);

        // 4. Fetch Bills
        const billsRes = await authFetch('/bills');
        const billsData = await billsRes.json();
        // Filter for unpaid bills only
        const unpaidBills = billsData.filter(bill => !bill.is_paid);
        setBills(unpaidBills.slice(0, 3)); // Show top 3

        // 5. Setup Chart Data (Simple comparison)
        // (This assumes you want to show Income vs Expense for the whole history)
        // Ideally, you'd filter this by month, but this works for a total overview
        setRecentTransactions([
            { name: 'Total', Income: incomeSum, Expenses: expenseSum }
        ]);

      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      
      {/* STAT CARDS ROW */}
      <div className="stats-grid">
        <StatCard 
          title="Total Net Worth" 
          value={formatCurrency(netWorth)} 
          icon="💰" 
          color="#FFD700" 
        />
        <StatCard 
          title="Total Income" 
          value={formatCurrency(totalIncome)} 
          icon="📈" 
          color="#4CAF50" 
        />
        <StatCard 
          title="Total Expenses" 
          value={formatCurrency(totalExpenses)} 
          icon="📉" 
          color="#F44336" 
        />
      </div>

      {/* CHARTS ROW */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Income vs. Expenses</h3>
          {/* Reusing your bar chart logic */}
          <div style={{ width: '100%', height: '300px' }}>
             <SimpleBarChart data={recentTransactions} />
          </div>
        </div>
      </div>

      {/* BILLS ROW */}
      <div className="bills-section">
        <h3>Upcoming Bills</h3>
        <div className="bills-grid">
          {bills.length === 0 ? (
            <p style={{ color: '#888', padding: '20px' }}>No upcoming bills found.</p>
          ) : (
            bills.map(bill => (
              <UpcomingBillsCard 
                key={bill.id} 
                name={bill.name} 
                amount={bill.amount} 
                dueDate={bill.due_date} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;