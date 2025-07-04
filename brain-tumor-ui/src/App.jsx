import React, { useState, useEffect, createContext, useContext } from 'react';
import { Brain, Upload, Download, Moon, Sun } from 'lucide-react';

// ---------------- THEME CONTEXT ---------------- //
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-gray-700" />}
    </button>
  );
};

// ---------------- UPLOAD ZONE ---------------- //
const UploadZone = ({ setResults }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = async (files) => {
    setIsUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      const enriched = data.map((item, i) => ({
        ...item,
        size: files[i].size,
        timestamp: new Date().toISOString(),
      }));
      setResults(prev => [...prev, ...enriched]);
    } catch (err) {
      alert('Upload failed. Backend not responding.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="max-w-4xl mx-auto mb-10">
      <div
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition ${
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
            : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto text-blue-600 dark:text-blue-400 mb-4" size={36} />
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Drag and drop MRI images here</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">or click to browse</p>
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={(e) => handleFiles(Array.from(e.target.files))}
          className="hidden"
        />
        <label
          htmlFor="file-upload"
          className="inline-block mt-2 px-6 py-2 bg-blue-600 text-white rounded-md cursor-pointer hover:bg-blue-700"
        >
          Choose Files
        </label>

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-2xl">
            <div>
              <div className="animate-spin border-t-4 border-blue-600 rounded-full h-10 w-10 mx-auto mb-2"></div>
              <p className="text-sm text-gray-700 dark:text-gray-200">Analyzing images...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------- PREDICTION CARD ---------------- //
const PredictionCard = ({ result }) => {
  const confidence = parseFloat(result.confidence);
  const badgeColor =
    confidence >= 90
      ? 'text-green-600 bg-green-100 dark:bg-green-900/20'
      : confidence >= 80
      ? 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20'
      : 'text-red-600 bg-red-100 dark:bg-red-900/20';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg border dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100">{result.filename}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(result.timestamp).toLocaleString()}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
          {confidence.toFixed(1)}% confidence
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Prediction</p>
          <p className="font-semibold text-gray-800 dark:text-white">{result.prediction}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">File Size</p>
          <p className="font-semibold text-gray-800 dark:text-white">{(result.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      </div>
    </div>
  );
};

// ---------------- EXPORT CSV ---------------- //
const ExportCSV = ({ data }) => {
  const handleExport = () => {
    const header = ['Filename', 'Prediction', 'Confidence (%)', 'Size (MB)', 'Timestamp'];
    const rows = data.map((r) => [
      r.filename,
      r.prediction,
      parseFloat(r.confidence).toFixed(1),
      (r.size / 1024 / 1024).toFixed(2),
      new Date(r.timestamp).toLocaleString(),
    ]);
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `brain_tumor_predictions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md shadow"
    >
      <Download className="mr-2" size={16} />
      Export Results
    </button>
  );
};

// ---------------- MAIN APP ---------------- //
const AppContent = () => {
  const [results, setResults] = useState([]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <Brain className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                CerebroScan🧠
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">ML Based Brain Tumor Classifier</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        <UploadZone setResults={setResults} />

        {results.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Analysis Results</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{results.length} file(s) processed</p>
              </div>
              <ExportCSV data={results} />
            </div>
            <div className="grid gap-4">
              {results.map((r, i) => (
                <PredictionCard key={i} result={r} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            <p>Upload MRI scans to begin diagnosis.</p>
          </div>
        )}
      </main>
    </div>
  );
};

// ---------------- APP ROOT ---------------- //
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
