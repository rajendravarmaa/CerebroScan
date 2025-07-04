import React from 'react';
import ChartBar from './ChartBar';

export default function PredictionCard({ result }) {
  return (
    <div className="bg-white shadow-lg p-4 rounded-lg mb-6">
      <p className="text-lg font-medium mb-1">📄 <strong>{result.filename}</strong></p>
      <p className="text-blue-700 font-bold text-xl">🧠 Prediction: {result.prediction}</p>
      <p className="text-gray-600 mb-3">Confidence: {result.confidence}%</p>

      {result.scores && <ChartBar scores={result.scores} />}

      {result.heatmap && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-1">Grad-CAM Heatmap:</p>
          <img
            src={`data:image/png;base64,${result.heatmap}`}
            alt="GradCAM"
            className="rounded-md border"
          />
        </div>
      )}
    </div>
  );
}
