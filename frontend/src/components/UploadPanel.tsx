import { useState } from "react";
import api from "../api/client";

export default function UploadPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<
    "hospitals" | "providers" | "orders"
  >("orders");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.name.endsWith(".csv")) {
        setSelectedFile(file);
        setMessage(null);
      } else {
        setMessage({ type: "error", text: "Please select a CSV file" });
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: "error", text: "Please select a file first" });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      await api.uploadCSV(selectedFile, uploadType);

      setMessage({
        type: "success",
        text: `Successfully uploaded ${uploadType} data! Please refresh the page to see changes.`,
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error) {
      console.error("Upload failed:", error);
      setMessage({
        type: "error",
        text: "Upload failed. Please check the file format and try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        📤 Upload Data
      </h2>

      <div className="space-y-4">
        {/* Data Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Data Type
          </label>
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as any)}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="hospitals">Hospitals</option>
            <option value="providers">Providers</option>
            <option value="orders">Orders</option>
          </select>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            CSV File
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Selected: {selectedFile.name} (
              {(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {uploading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Uploading...
            </span>
          ) : (
            "Upload File"
          )}
        </button>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Format Instructions */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            CSV Format Requirements
          </h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            {uploadType === "hospitals" && (
              <p>
                Required columns: hospital_id, name, address, city, state, zip,
                latitude, longitude
              </p>
            )}
            {uploadType === "providers" && (
              <p>
                Required columns: provider_id, name, type, address, city, state,
                zip, latitude, longitude, transport_mode
              </p>
            )}
            {uploadType === "orders" && (
              <p>
                Required columns: order_id, hospital_id, provider_id,
                device_name, quantity, order_date, delivery_date
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
