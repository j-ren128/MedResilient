import { useState, useEffect } from "react";
import { useAppStore } from "../store/appStore";
import api, { RouteRecommendation } from "../api/client";

export default function RecommendationPanel() {
  const {
    hospitals,
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
    isLoading,
    setIsLoading,
    setError,
  } = useAppStore();

  const [limit, setLimit] = useState(5);

  useEffect(() => {
    if (selectedHospital) {
      loadRecommendations();
    }
  }, [selectedHospital, alpha, beta]);

  const loadRecommendations = async () => {
    if (!selectedHospital) return;

    try {
      setIsLoading(true);
      const data = await api.getRecommendations(
        selectedHospital.hospital_id,
        alpha,
        beta,
        limit
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        ⚙️ Supplier Recommendations
      </h2>

      {/* Hospital Selection */}
      <div className="mb-6">
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Ranked Suppliers
            </h3>
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
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">
              No recommendations available
            </p>
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
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        #{index + 1} {rec.provider.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {rec.provider.city} • {rec.transport_mode}
                      </p>
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
        </div>
      )}
    </div>
  );
}
