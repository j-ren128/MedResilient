import { useState, useEffect, useMemo } from "react";
import { useAppStore } from "../store/appStore";
import api, { RouteRecommendation } from "../api/client";

export default function RecommendationPanel() {
  const {
    hospitals,
    orders,
    alpha,
    beta,
    setAlpha,
    setBeta,
    recommendations,
    setRecommendations,
    selectedHospital,
    setSelectedHospital,
    selectedRecommendation,
    setSelectedRecommendation,
    confirmSelection,
    isLoading,
    setIsLoading,
    setError,
  } = useAppStore();

  const [limit] = useState(5);
  const [selectedDevice, setSelectedDevice] = useState("");

  useEffect(() => {
    if (selectedHospital) {
      loadRecommendations();
    }
  }, [selectedHospital, alpha, beta, selectedDevice]);

  const loadRecommendations = async () => {
    if (!selectedHospital) return;

    try {
      setIsLoading(true);
      const data = await api.getRecommendations(
        selectedHospital.hospital_id,
        alpha,
        beta,
        limit,
        selectedDevice || undefined
      );
      setRecommendations(data);
      setError(null);
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      setError("Failed to load recommendations");
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadgeColor = (risk: number) => {
    if (risk > 0.6) return "bg-red-500";
    if (risk > 0.3) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score > 0.6)
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (score > 0.4)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
  };

  // Get unique devices from orders, optionally filtered by hospital
  const availableDevices = useMemo(() => {
    let filteredOrders = orders;
    if (selectedHospital) {
      filteredOrders = orders.filter(
        (order) => order.hospital_id === selectedHospital.hospital_id
      );
    }
    const devices = [
      ...new Set(filteredOrders.map((order) => order.device_name)),
    ];
    return devices.sort();
  }, [orders, selectedHospital]);

  // Calculate savings compared to worst option
  const calculateSavings = (selectedRec: RouteRecommendation) => {
    if (recommendations.length === 0) return { carbonSaved: 0, timeSaved: 0 };

    const worstRec = recommendations[recommendations.length - 1];
    const carbonSaved =
      worstRec.carbon_emission_kg - selectedRec.carbon_emission_kg;

    // Estimate time saved based on distance (assuming 60 km/h average speed)
    const worstTime = worstRec.distance_km / 60; // hours
    const selectedTime = selectedRec.distance_km / 60;
    const timeSaved = (worstTime - selectedTime) * 60; // minutes

    return {
      carbonSaved: Math.max(0, carbonSaved),
      timeSaved: Math.max(0, timeSaved),
    };
  };

  const handleConfirmSelection = () => {
    if (!selectedRecommendation || !selectedDevice) {
      setError("Please select both a provider and a device");
      return;
    }

    const { carbonSaved, timeSaved } = calculateSavings(selectedRecommendation);
    confirmSelection(
      selectedRecommendation,
      selectedDevice,
      carbonSaved,
      timeSaved
    );

    // Clear selections after confirmation
    setSelectedRecommendation(null);
    setSelectedDevice("");

    // Show success message
    alert(
      `✅ Selection confirmed!\n\nCO₂ Saved: ${carbonSaved.toFixed(
        2
      )} kg\nTime Saved: ${timeSaved.toFixed(0)} minutes`
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ⚙️ Supplier Recommendations
      </h2>

      {/* Filters Section */}
      <div className="mb-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h3>

        {/* Hospital Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Hospital
          </label>
          <select
            value={selectedHospital?.hospital_id || ""}
            onChange={(e) => {
              const hospital = hospitals.find(
                (h) => h.hospital_id === e.target.value
              );
              setSelectedHospital(hospital || null);
              setSelectedDevice(""); // Reset device when hospital changes
            }}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
          >
            <option value="">Choose a hospital...</option>
            {hospitals.map((hospital) => (
              <option key={hospital.hospital_id} value={hospital.hospital_id}>
                {hospital.name} - {hospital.city}
              </option>
            ))}
          </select>
        </div>

        {/* Device Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Device
          </label>
          <select
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
            disabled={!selectedHospital}
            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">All devices...</option>
            {availableDevices.map((device) => (
              <option key={device} value={device}>
                {device}
              </option>
            ))}
          </select>
          {!selectedHospital && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select a hospital first to see available devices
            </p>
          )}
          {selectedDevice && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              ℹ️ Results include providers offering substitute products
            </p>
          )}
        </div>
      </div>

      {/* Weight Controls */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Model Weights
        </h3>

        {/* Alpha - Flood Risk */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              α (Flood Risk Weight)
            </label>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {alpha.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={alpha}
            onChange={(e) => {
              const newAlpha = parseFloat(e.target.value);
              setAlpha(newAlpha);
              setBeta(1 - newAlpha);
            }}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
        </div>

        {/* Beta - Carbon Emission */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              β (Carbon Weight)
            </label>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              {beta.toFixed(2)}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={beta}
            onChange={(e) => {
              const newBeta = parseFloat(e.target.value);
              setBeta(newBeta);
              setAlpha(1 - newBeta);
            }}
            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600"
          />
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Score = α × Flood Risk + β × Carbon Emission (normalized)
        </p>
      </div>

      {/* Recommendations List */}
      {selectedHospital && (
        <div>
          <div className="flex justify-between items-center mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Ranked Suppliers
              </h3>
              {selectedDevice && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  🔍 Filtered for "{selectedDevice}"
                </p>
              )}
            </div>
            <button
              onClick={loadRecommendations}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {isLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="spinner"></div>
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                {selectedDevice
                  ? `No providers found that supply "${selectedDevice}"`
                  : "No recommendations available"}
              </p>
              {selectedDevice && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Try selecting "All devices" or a different device
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recommendations.map((rec, index) => (
                <div
                  key={`${rec.provider.provider_id}-${index}`}
                  onClick={() => setSelectedRecommendation(rec)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                    selectedRecommendation?.provider.provider_id ===
                    rec.provider.provider_id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          #{index + 1} {rec.provider.name}
                        </h4>
                        {rec.is_substitute && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs rounded font-semibold">
                            Substitute
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.provider.city} • {rec.transport_mode}
                      </p>
                      {rec.is_substitute && rec.offered_device && (
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                          ⚠️ Offers: {rec.offered_device}
                        </p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${getScoreBadgeColor(
                        rec.weighted_score
                      )}`}
                    >
                      Score: {rec.weighted_score.toFixed(3)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Distance:
                      </span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                        {rec.distance_km.toFixed(1)} km
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">
                        Emission:
                      </span>
                      <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                        {rec.carbon_emission_kg.toFixed(1)} kg CO₂
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Flood Risk:
                      </span>
                      <div className="ml-2 flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getRiskBadgeColor(
                            rec.flood_risk
                          )}`}
                          style={{ width: `${rec.flood_risk * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-bold text-gray-900 dark:text-white">
                        {(rec.flood_risk * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {rec.estimated_time && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Est. Time: {rec.estimated_time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Confirm Selection Button */}
          {selectedRecommendation && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border-2 border-blue-500">
              <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                Ready to confirm selection?
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-200 mb-3">
                Selected:{" "}
                <strong>{selectedRecommendation.provider.name}</strong>
                {selectedDevice && (
                  <span className="block mt-1">
                    Device: <strong>{selectedDevice}</strong>
                  </span>
                )}
              </p>
              {!selectedDevice && (
                <p className="text-xs text-red-600 dark:text-red-400 mb-2">
                  ⚠️ Please select a device above to continue
                </p>
              )}
              <button
                onClick={handleConfirmSelection}
                disabled={!selectedDevice}
                className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                ✓ Confirm Selection & Save to Dashboard
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
