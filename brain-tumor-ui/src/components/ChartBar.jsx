import React from 'react';

export default function ChartBar({ scores }) {
  if (!scores || typeof scores !== 'object') {
    return <p className="text-sm text-red-500">No confidence scores available.</p>;
  }

  return (
    <div className="space-y-2">
      {Object.entries(scores).map(([label, percent]) => (
        <div key={label}>
          <p className="text-sm font-medium">{label} – {percent}%</p>
          <div className="w-full bg-gray-200 h-2 rounded">
            <div className="bg-blue-500 h-2 rounded" style={{ width: `${percent}%` }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
