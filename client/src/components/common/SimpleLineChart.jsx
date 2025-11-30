// src/components/common/SimpleLineChart.jsx

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SimpleLineChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#888" 
          tick={{ fill: '#888' }} 
          fontSize={12}
        />
        <YAxis 
          stroke="#888" 
          tick={{ fill: '#888' }} 
          fontSize={12}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px', color: '#fff' }}
          itemStyle={{ color: '#fff' }}
          formatter={(value) => `$${value.toFixed(2)}`}
        />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        
        {/* The Two Lines */}
        <Line 
          type="monotone" // This makes it wavy/smooth
          dataKey="Income" 
          stroke="#4CAF50" // Green
          strokeWidth={3}
          dot={{ r: 4, fill: '#4CAF50' }}
          activeDot={{ r: 6 }} 
        />
        <Line 
          type="monotone" 
          dataKey="Expenses" 
          stroke="#F44336" // Red
          strokeWidth={3}
          dot={{ r: 4, fill: '#F44336' }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SimpleLineChart;