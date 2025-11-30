// src/pages/DashboardPage.jsx (Fixed Layout)

import React, { useState, useEffect } from 'react';
import './DashboardPage.css';
import { Link } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import SimpleLineChart from '../components/common/SimpleLineChart';
import { authFetch } from '../utils/api'; 
import { formatCurrency } from '../utils/formatting';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

function DashboardPage() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [netWorth, setNetWorth] = useState(0);
  const [bills, setBills] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [pieData, setPieData] = useState([]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Expenses
        const expenseRes = await authFetch('/expenses');
        const expenseData = await expenseRes.json();
        const expenseSum = expenseData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        setTotalExpenses(expenseSum);

        const expensesByCategory = expenseData.reduce((acc, item) => {
            const cat = item.want_or_need || 'Other';
            acc[cat] = (acc[cat] || 0) + (parseFloat(item.amount) || 0);
            return acc;
        }, {});
        setPieData(Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] })));

        // 2. Fetch Income
        const incomeRes = await authFetch('/income');
        const incomeData = await incomeRes.json();
        const incomeSum = incomeData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
        setTotalIncome(incomeSum);

        // 3. Fetch Assets
        const assetRes = await authFetch('/assets');
        const assetData = await assetRes.json();
        const assetSum = assetData.reduce((sum, item) => sum + (parseFloat(item.worth) || 0), 0);
        setNetWorth(assetSum);

        // 4. Fetch Bills
        const billsRes = await authFetch('/bills');
        const billsData = await billsRes.json();
        // Get 4 upcoming unpaid bills
        setBills(billsData.filter(bill => !bill.is_paid).slice(0, 4)); 

        // 5. Line Chart Data
        const dateMap = {};
        const addToMap = (dataArr, type) => {
            dataArr.forEach(item => {
                if (!item.date) return;
                const shortDate = item.date.substring(5); // "MM-DD"
                if (!dateMap[shortDate]) {
                    dateMap[shortDate] = { name: shortDate, Income: 0, Expenses: 0 };
                }
                dateMap[shortDate][type] += parseFloat(item.amount) || 0;
            });
        };
        addToMap(incomeData, 'Income');
        addToMap(expenseData, 'Expenses');
        const sortedChartData = Object.values(dateMap).sort((a, b) => a.name.localeCompare(b.name));
        
        if (sortedChartData.length === 0) {
            setLineData([{ name: 'No Data', Income: 0, Expenses: 0 }]);
        } else {
            setLineData(sortedChartData);
        }

      } catch (error) { console.error("Error loading dashboard data:", error); }
    };
    fetchData();
  }, []);

  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      
      {/* Stats */}
      <div className="stats-grid">
        <Link to="/networth" style={{ textDecoration: 'none' }}><StatCard title="Total Net Worth" value={formatCurrency(netWorth)} icon="💰" color="#FFD700" /></Link>
        <Link to="/income" style={{ textDecoration: 'none' }}><StatCard title="Total Income" value={formatCurrency(totalIncome)} icon="📈" color="#4CAF50" /></Link>
        <Link to="/expenses" style={{ textDecoration: 'none' }}><StatCard title="Total Expenses" value={formatCurrency(totalExpenses)} icon="📉" color="#F44336" /></Link>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3>Expense Breakdown</h3>
          <div style={{ width: '100%', height: '300px' }}>
            {pieData.length > 0 ? (
                <ResponsiveContainer>
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            ) : <p className="no-data">No expenses to display</p>}
          </div>
        </div>

        <div className="chart-card">
          <h3>Income vs. Expenses (Timeline)</h3>
          <div style={{ width: '100%', height: '300px' }}>
             <SimpleLineChart data={lineData} />
          </div>
        </div>
      </div>

      {/* NEW SINGLE BILLS LIST SECTION */}
      <div className="bills-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3>Upcoming Bills</h3>
            <Link to="/bills" style={{ color: '#1677ff', textDecoration: 'none' }}>View All</Link>
        </div>
        
        {/* ONE container for all bills */}
        <div className="upcoming-bill-card" style={{ padding: '0 20px', display: 'block' }}>
          {bills.length === 0 ? (
            <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>No upcoming bills found.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    {bills.map(bill => (
                        <tr key={bill.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '15px 0' }}>
                                <strong>{bill.name}</strong><br/>
                                <span style={{ fontSize: '0.85em', opacity: 0.7 }}>Due {bill.due_date}</span>
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                {formatCurrency(bill.amount)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;