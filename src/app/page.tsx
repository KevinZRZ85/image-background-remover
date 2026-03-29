"use client";

import { useState, useRef } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!file && !imageUrl) {
      setError("Please upload an image or enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    if (file) {
      formData.append("image", file);
    } else {
      formData.append("imageUrl", imageUrl);
    }

    try {
      const res = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to process image");
      }

      setResult(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith("image/")) {
      setFile(droppedFile);
      setImageUrl("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          🖼️ Remove Background
        </h1>
        <p className="text-center text-gray-500 mb-6">
          AI-powered background removal
        </p>

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <div className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt="Preview"
                className="max-h-40 mx-auto rounded-lg"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-600">
                Drag & drop image here
                <br />
                or <span className="text-indigo-500 font-medium">click to browse</span>
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              setFile(e.target.files[0]);
              setImageUrl("");
            }
          }}
        />

        <p className="text-center text-gray-400 my-4">— OR —</p>

        {/* URL Input */}
        <input
          type="text"
          placeholder="Paste image URL here..."
          value={imageUrl}
          onChange={(e) => {
            setImageUrl(e.target.value);
            if (e.target.value) setFile(null);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
        />

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || (!file && !imageUrl)}
          className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Remove Background"}
        </button>

        {/* Loading */}
        {loading && (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-indigo-500"></div>
            <p className="text-gray-500 mt-2">Processing your image...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="mt-6 text-center">
            <p className="font-medium text-gray-700 mb-3">Result:</p>
            <img
              src={result}
              alt="Result"
              className="max-w-full rounded-lg shadow-lg mx-auto"
            />
            <a
              href={result}
              download="removed-bg.png"
              className="inline-block mt-4 px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  );
}