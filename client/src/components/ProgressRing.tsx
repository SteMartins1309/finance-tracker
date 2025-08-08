// src/components/ProgressRing.tsx
import React from 'react';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number; // Percentage from 0 to 100
  color: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress, color }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg
      height={radius * 2}
      width={radius * 2}
      viewBox={`0 0 ${radius * 2} ${radius * 2}`}
    >
      <circle
        stroke="#e6e6e6" // Background ring color
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color} // Progress ring color
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        transform={`rotate(-90 ${radius} ${radius})`} // Start from top
      />
      {/* Optional: Add text in the center */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={radius * 0.4}
        fill="#333"
        fontWeight="bold"
      >
        {`${Math.round(progress)}%`}
      </text>
    </svg>
  );
};

export default ProgressRing;