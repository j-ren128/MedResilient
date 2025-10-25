import { useAppStore } from "../store/appStore";

export default function SavingsDashboard() {
  const { confirmedSelections, clearConfirmedSelections } = useAppStore();

  // Calculate total savings
  const totalCarbonSaved = confirmedSelections.reduce(
    (sum, selection) => sum + selection.carbonSaved,
    0
  );

  const totalTimeSaved = confirmedSelections.reduce(
    (sum, selection) => sum + selection.timeSaved,
    0
  );

  if (confirmedSelections.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📊 Optimization Savings Dashboard
        </h2>
        <button
          onClick={clearConfirmedSelections}
          className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
        >
          Clear All
        </button>
      </div>

      {/* Total Savings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-lg border-2 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-700 dark:text-green-200 uppercase tracking-wide">
                Total CO₂ Saved
              </h3>
              <p className="text-4xl font-bold text-green-900 dark:text-green-100 mt-2">
                {totalCarbonSaved.toFixed(2)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                kg CO₂
              </p>
            </div>
            <div className="text-5xl">🌱</div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-300 mt-3">
            Equivalent to planting {Math.round(totalCarbonSaved / 21)} trees*
          </p>
        </div>

        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg border-2 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-700 dark:text-blue-200 uppercase tracking-wide">
                Total Time Saved
              </h3>
              <p className="text-4xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                {totalTimeSaved.toFixed(0)}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                minutes
              </p>
            </div>
            <div className="text-5xl">⏱️</div>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-300 mt-3">
            {(totalTimeSaved / 60).toFixed(1)} hours of faster delivery
          </p>
        </div>
      </div>

      {/* Detailed Selections Table */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Confirmed Selections ({confirmedSelections.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3">Hospital</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Device</th>
                <th className="px-4 py-3">Distance</th>
                <th className="px-4 py-3">CO₂ Saved</th>
                <th className="px-4 py-3">Time Saved</th>
                <th className="px-4 py-3">Confirmed At</th>
              </tr>
            </thead>
            <tbody>
              {confirmedSelections.map((selection) => (
                <tr
                  key={selection.id}
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {selection.recommendation.hospital.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {selection.recommendation.provider.name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {selection.device}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {selection.recommendation.distance_km.toFixed(1)} km
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded font-semibold">
                      {selection.carbonSaved.toFixed(2)} kg
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded font-semibold">
                      {selection.timeSaved.toFixed(0)} min
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                    {new Date(selection.confirmedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
        * Based on average tree absorbing ~21 kg CO₂ per year
      </p>
    </div>
  );
}
