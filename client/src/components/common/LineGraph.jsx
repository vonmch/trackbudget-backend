// src/components/common/LineGraph.jsx

import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Area,
  Legend 
} from 'recharts';
import { formatCurrency } from '../../utils/formatting'; // Import safe formatter

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`Date: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }}>
            {/* Safe formatting here prevents the crash */}
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function LineGraph({ data, lines }) {
  const hasData = data && data.length > 0;

  return (
    <ResponsiveContainer width="100%" height={250}>
      {hasData ? (
        <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
          
          <defs>
            {lines.map((line) => (
              <linearGradient key={line.dataKey} id={`color${line.dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={line.color} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={line.color} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>

          <XAxis 
            dataKey="name" 
            stroke="#666" 
            fontSize={12} 
            tickLine={false}
          />
          <YAxis 
            stroke="#666" 
            fontSize={12} 
            tickLine={false} 
            tickFormatter={(value) => `$${value}`}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {lines.map((line) => (
            <Area 
              key={`area-${line.dataKey}`}
              type="monotone"
              dataKey={line.dataKey}
              stroke="none"
              fillOpacity={1}
              fill={`url(#color${line.dataKey})`}
              legendType="none" 
            />
          ))}

          {lines.map((line) => (
            <Line 
              key={`line-${line.dataKey}`}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={3}
              dot={false}
            />
          ))}

        </LineChart>
      ) : (
        <div style={{ textAlign: 'center', color: '#999', paddingTop: '100px' }}>
          Not enough data to display a chart.
        </div>
      )}
    </ResponsiveContainer>
  );
}

export default LineGraph;