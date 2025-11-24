// src/components/common/GaugeChart.jsx

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const GaugeChart = ({ value }) => {
  // Ensure value is between 0 and 100
  const percentage = Math.max(0, Math.min(100, value));
  
  const data = [
    { name: 'Filled', value: percentage },
    { name: 'Remaining', value: 100 - percentage },
  ];

  return (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          startAngle={90}
          endAngle={-270} // This makes it a full circle
          innerRadius="70%"
          outerRadius="90%"
          paddingAngle={0}
          dataKey="value"
        >
          <Cell fill="#5465ff" /> {/* Blue fill */}
          <Cell fill="#f0f0f0" /> {/* Grey background */}
        </Pie>
        {/* This is the text in the middle */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="2rem"
          fontWeight="600"
        >
          {`${percentage.toFixed(0)}%`}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GaugeChart;