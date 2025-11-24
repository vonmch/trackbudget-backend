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
  Cell // 1. Import 'Cell'
} from 'recharts';

// 2. Define our specific colors for each bill type
const COLOR_MAP = {
  'Utility Bill': '#0088FE', // Blue
  'Insurance': '#00C49F', // Teal
  'Rent': '#FFBB28', // Yellow
  'Mortgage': '#FF8042', // Orange
  'Subscription': '#8884D8', // Purple
  'Other': '#A9A9A9', // Grey
};

// Custom Tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    // 3. The 'fill' color is now passed in the payload!
    const barColor = payload[0].fill; 
    return (
      <div className="custom-tooltip">
        <p className="label">{`${label}`}</p>
        <p className="intro" style={{ color: barColor }}>
          {`Total: $${payload[0].value.toFixed(2)}`}
        </p>
      </div>
    );
  }
  return null;
};

function SimpleBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart 
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis dataKey="name" stroke="#666" fontSize={12} />
        <YAxis 
          stroke="#666" 
          fontSize={12} 
          tickFormatter={(value) => `$${value}`} 
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* 4. This is the magic! */}
        <Bar dataKey="total">
          {/* We map over the data and give each bar a unique 'Cell' with a color */}
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLOR_MAP[entry.name] || '#A9A9A9'} // Find the color in our map, or default to grey
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default SimpleBarChart;