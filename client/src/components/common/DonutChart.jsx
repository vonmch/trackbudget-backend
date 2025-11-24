// src/components/common/DonutChart.jsx

import React from 'react';
// 1. Import the components you need from 'recharts'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 2. Define the colors for your chart
const COLORS = {
  wants: '#5465ff', // A blue for "Wants"
  needs: '#2ed47a', // A green for "Needs"
};

function DonutChart({ data }) {
  // Check if data is empty or all values are zero
  const isDataEmpty = !data || data.every(item => item.value === 0);

  return (
    // 3. ResponsiveContainer makes the chart fit its parent box
    <ResponsiveContainer width="100%" height={250}>
      {isDataEmpty ? (
        <div style={{ textAlign: 'center', color: '#999', paddingTop: '100px' }}>
          No data to display
        </div>
      ) : (
        <PieChart>
          {/* 4. This is the <Pie> component that draws the chart */}
          <Pie
            data={data}
            cx="50%" // center X
            cy="50%" // center Y
            innerRadius={60} // This makes it a "donut"
            outerRadius={90}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value" // Tells it which part of your data to use for size
          >
            {/* 5. This maps over your data and gives each slice a color */}
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()]} />
            ))}
          </Pie>
          {/* 6. This adds the pop-up on hover */}
          <Tooltip />
          {/* 7. This adds the legend at the bottom */}
          <Legend />
        </PieChart>
      )}
    </ResponsiveContainer>
  );
}

export default DonutChart;