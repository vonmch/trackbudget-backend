// src/pages/DashboardPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './DashboardPage.css';
import StatCard from '../components/common/StatCard';
import DonutChart from '../components/common/DonutChart';
import LineGraph from '../components/common/LineGraph';
import { Link } from 'react-router-dom';
import UpcomingBillsCard from '../components/common/UpcomingBillsCard';
import { formatCurrency } from '../utils/formatting';
import { authFetch } from '../utils/api'; // <--- 1. IMPORT THIS

const NetWorthIcon = () => <span>💰</span>;
const IncomeIcon = () => <span>📈</span>;
const ExpensesIcon = () => <span>📉</span>;

const dashboardGraphLines = [
  { dataKey: 'Income', color: '#2ed47a' },
  { dataKey: 'Expenses', color: '#ff4d4f' }
];

function DashboardPage() {
  const [assets, setAssets] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // 2. USE authFetch (and remove the full URL part)
        const [assetsRes, incomeRes, expensesRes] = await Promise.all([
          authFetch('/assets'),
          authFetch('/income'),
          authFetch('/expenses')
        ]);
        const assetsData = await assetsRes.json();
        const incomeData = await incomeRes.json();
        const expensesData = await expensesRes.json();
        setAssets(assetsData);
        setIncome(incomeData);
        setExpenses(expensesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const dashboardData = useMemo(() => {
    const totalNetWorth = assets.reduce((sum, asset) => sum + asset.worth, 0);
    const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
    const donutData = [
      { name: 'Wants', value: expenses.filter(e => e.want_or_need === 'want').reduce((sum, e) => sum + e.amount, 0) },
      { name: 'Needs', value: expenses.filter(e => e.want_or_need === 'need').reduce((sum, e) => sum + e.amount, 0) },
    ];
    const dailyTotals = {};
    income.forEach(item => {
      const date = item.date;
      dailyTotals[date] = { ...dailyTotals[date], Income: (dailyTotals[date]?.Income || 0) + item.amount };
    });
    expenses.forEach(item => {
      const date = item.date;
      dailyTotals[date] = { ...dailyTotals[date], Expenses: (dailyTotals[date]?.Expenses || 0) + item.amount };
    });
    const dataArray = Object.keys(dailyTotals).map(date => ({
      date: date,
      Income: dailyTotals[date].Income || 0,
      Expenses: dailyTotals[date].Expenses || 0,
    }));
    dataArray.sort((a, b) => new Date(a.date) - new Date(b.date));
    const lineData = dataArray.map(item => ({
      name: new Date(item.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }),
      Income: item.Income,
      Expenses: item.Expenses,
    }));
    return { totalNetWorth, totalIncome, totalExpenses, donutData, lineData };
  }, [assets, income, expenses]);

  if (isLoading) {
    return <div className="dashboard-page"><h2>Loading Dashboard Data...</h2></div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid-3-col">
        <Link to="/networth" className="dashboard-link">
          <StatCard 
            icon={<NetWorthIcon />} 
            title="Total Net Worth" 
            value={formatCurrency(dashboardData.totalNetWorth)}
          />
        </Link>
        <Link to="/income" className="dashboard-link">
          <StatCard 
            icon={<IncomeIcon />} 
            title="Total Income" 
            value={formatCurrency(dashboardData.totalIncome)} 
          />
        </Link>
        <Link to="/expenses" className="dashboard-link">
          <StatCard 
            icon={<ExpensesIcon />} 
            title="Total Expenses" 
            value={formatCurrency(dashboardData.totalExpenses)} 
          />
        </Link>
      </div>

      <div className="dashboard-grid-2-col">
        <div className="dashboard-card">
          <h3 className="card-title">Expense Breakdown</h3>
          <DonutChart data={dashboardData.donutData} />
        </div>
        <div className="dashboard-card">
          <h3 className="card-title">Income vs. Expense</h3>
          <LineGraph data={dashboardData.lineData} lines={dashboardGraphLines} />
        </div>
      </div>
      
      <div className="dashboard-grid-1-col">
        <UpcomingBillsCard />
      </div>
    </div>
  );
}

export default DashboardPage;