// src/components/common/HorizontalStackedBar.jsx

import React from 'react';
import { ResponsiveContainer, BarChart, Bar, Tooltip, Legend, XAxis, YAxis, Cell } from 'recharts';

// 1. We've changed the props:
//    - 'types' is the list of unique asset types (e.g., ['Cash', 'Vehicle', 'NFTs'])
//    - 'typeColorMap' is an object (e.g., { Cash: '#0088FE', Vehicle: '#FF8042', NFTs: '#...'})
function HorizontalStackedBar({ data, types, typeColorMap }) {
  
  // This is the data for the chart, e.g. [{ name: 'Net Worth', Cash: 5000, Vehicle: 15000, ... }]
  const chartData = [data];

  return (
    <ResponsiveContainer width="100%" height={80}>
      <BarChart
        layout="vertical"
        data={chartData} 
        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
      >
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" hide />
        
        <Tooltip formatter={(value, name) => [`$${value.toFixed(2)}`, name]} />
        <Legend />
        
        {/* 2. We dynamically create a <Bar> for each asset type */}
        {types.map((type) => (
          <Bar
            key={type}
            dataKey={type}
            stackId="a" // This is what stacks them
            fill={typeColorMap[type] || '#A9A9A9'} // 3. We use the color map!
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export default HorizontalStackedBar;