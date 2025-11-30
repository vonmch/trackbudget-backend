// src/components/common/SimpleBarChart.jsx

import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  Cell 
} from 'recharts';

// 1. Keep your specific colors for Bills
const BILL_COLOR_MAP = {
  'Utility Bill': '#0088FE',
  'Insurance': '#00C49F',
  'Rent': '#FFBB28',
  'Mortgage': '#FF8042',
  'Subscription': '#8884D8',
  'Other': '#A9A9A9',
};

// 2. Custom Tooltip (Only used for Bills)
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <p style={{ fontWeight: 'bold', margin: 0, color: '#333' }}>{label}</p>
        <p style={{ margin: 0, color: payload[0].fill }}>
          {`Total: $${payload[0].value.toFixed(2)}`}
        </p>
      </div>
    );
  }
  return null;
};

function SimpleBarChart({ data }) {
  // SAFETY CHECK: If no data, return empty container
  if (!data || data.length === 0) return <div style={{ height: '300px' }}></div>;

  // 3. SMART DETECTION: Are we on the Dashboard?
  // We check if the first item has "Income" or "Expenses" keys
  const isDashboardData = 'Income' in data[0] || 'Expenses' in data[0];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
        
        {/* Axis Styles */}
        <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} fontSize={12} />
        <YAxis 
          stroke="#888" 
          tick={{ fill: '#888' }} 
          fontSize={12} 
          tickFormatter={(value) => `$${value}`} 
        />

        {/* 4. CONDITIONAL RENDER: Dashboard vs Bills */}
        {isDashboardData ? (
          <>
            {/* --- DASHBOARD MODE (Income vs Expense) --- */}
            <Tooltip 
              contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px', color: '#fff' }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => `$${value.toFixed(2)}`}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Bar dataKey="Income" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Income" />
            <Bar dataKey="Expenses" fill="#F44336" radius={[4, 4, 0, 0]} name="Expenses" />
          </>
        ) : (
          <>
            {/* --- BILL MODE (Original Logic) --- */}
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="total" name="Total Bill">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={BILL_COLOR_MAP[entry.name] || '#A9A9A9'} 
                />
              ))}
            </Bar>
          </>
        )}

      </BarChart>
    </ResponsiveContainer>
  );
}

export default SimpleBarChart;