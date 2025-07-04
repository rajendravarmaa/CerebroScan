import React, { useRef, useState } from 'react';
import axios from 'axios';

export default function UploadZone({ setResults }) {
  const fileRef = useRef();
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [loadingPhase, setLoadingPhase] = useState(""); // "uploading" | "processing" | ""

  const handleFiles = async (files) => {
    const formData = new FormData();
    Array.from(files).forEach(file => formData.append("images", file));

    setProgress(0);
    setStatusText("Uploading...");
    setLoadingPhase("uploading");

    let responseData = null;

    try {
      // Upload without progress bar, just spinner
      const res = await axios.post("http://localhost:5000/predict", formData);
      responseData = res.data;
    } catch (err) {
      console.error("🔥 Axios error:", err);
      alert("Backend error. Is Flask running?");
      setStatusText("❌ Upload failed.");
      setLoadingPhase("");
      return;
    }

    // Simulate processing after upload
    setProgress(0);
    setStatusText("Processing...");
    setLoadingPhase("processing");

    const totalSteps = files.length * 10;
    let current = 0;
    const interval = setInterval(() => {
      current++;
      setProgress((100 * current) / totalSteps);
      if (current >= totalSteps) {
        clearInterval(interval);
        setStatusText("✅ Done!");
        setLoadingPhase("");
        setProgress(0);
        setResults(responseData);
        setTimeout(() => setStatusText(""), 1000);
      }
    }, 60);
  };

  return (
    <div 
      className="border-4 border-dashed border-blue-400 p-10 text-center rounded-lg bg-white shadow"
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
    >
      <p className="text-gray-600">Drag and drop MRI images here or</p>
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileRef}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        className="mt-3 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => fileRef.current.click()}
      >
        Browse Files
      </button>

      {/* Spinner for uploading */}
      {loadingPhase === "uploading" && (
        <div className="mt-6 flex justify-center items-center gap-2 text-sm text-gray-700">
          <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l5-5-5-5v4a12 12 0 00-12 12h4z"/>
          </svg>
          Uploading...
        </div>
      )}

      {/* Progress bar for processing */}
      {loadingPhase === "processing" && (
        <>
          <div className="mt-6 w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-700">Processing...</p>
        </>
      )}
    </div>
  );
}
