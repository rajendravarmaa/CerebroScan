import React from 'react';

export default function ExportCSV({ data }) {
  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    const headers = ["Filename", "Prediction", "Confidence", ...Object.keys(data[0].scores)];
    const rows = data.map(item => {
      const scores = Object.values(item.scores).map(score => score.toFixed(4));
      return [item.filename, item.prediction, item.confidence.toFixed(4), ...scores];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "brain_tumor_predictions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={downloadCSV}
      className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      📥 Export CSV
    </button>
  );
}
