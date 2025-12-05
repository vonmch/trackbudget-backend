// src/components/common/HorizontalStackedBar.jsx

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
// Import your formatter to get the commas and $ sign
import { formatCurrency } from '../../utils/formatting';

const HorizontalStackedBar = ({ data, types, typeColorMap }) => {
  // Recharts expects an array of data objects
  const chartData = [data];

  return (
    <div style={{ width: '100%', height: '120px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          layout="vertical" 
          data={chartData} 
          margin={{ top: 10, right: 0, left: 0, bottom: 10 }}
        >
          {/* Hide the Axes for a clean "Progress Bar" look */}
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" hide />
          
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            // --- THE FIX: Format the numbers with commas and $ ---
            formatter={(value) => formatCurrency(value)}
            // ----------------------------------------------------
            contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                backgroundColor: '#fff',
                color: '#333'
            }}
          />
          
          <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="square" />

          {/* Render a stacked bar segment for each asset type */}
          {types.map((type, index) => (
            <Bar 
              key={type} 
              dataKey={type} 
              stackId="a" 
              fill={typeColorMap[type]} 
              barSize={40} // Controls the thickness of the bar
              // Add rounded corners to the first and last segments
              radius={
                index === 0 ? [10, 0, 0, 10] : 
                index === types.length - 1 ? [0, 10, 10, 0] : 
                [0, 0, 0, 0]
              }
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HorizontalStackedBar;