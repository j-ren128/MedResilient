import { useEffect, useState } from "react";
import { useAppStore } from "./store/appStore";
import api from "./api/client";
import MapView from "./components/MapView";
import OrderDashboard from "./components/OrderDashboard";
import RecommendationPanel from "./components/RecommendationPanel";
import UploadPanel from "./components/UploadPanel";
import SavingsDashboard from "./components/SavingsDashboard";

function App() {
  const { setHospitals, setProviders, setOrders, setError } = useAppStore();
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "recommendations" | "upload"
  >("dashboard");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Load map data (hospitals and providers)
      const mapData = await api.getMapData();
      setHospitals(mapData.hospitals);
      setProviders(mapData.providers);

      // Load orders data
      const ordersData = await api.getOrders();
      setOrders(ordersData);

      setIsInitialized(true);
    } catch (error) {
      console.error("Failed to initialize data:", error);
      setError("Failed to load initial data");
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-white">Loading MedResilient...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🏥 MedAlt</h1>
              <p className="text-sm text-blue-100">
                Google Earth AI for Healthcare Supply Chain Sustainability
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => initializeData()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                🔄 Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Section - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                🌎 Interactive Map
              </h2>
              <div className="h-[600px]">
                <MapView />
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === "dashboard"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("recommendations")}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === "recommendations"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  Optimize
                </button>
                <button
                  onClick={() => setActiveTab("upload")}
                  className={`flex-1 px-4 py-2 rounded-lg font-semibold transition ${
                    activeTab === "upload"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                  }`}
                >
                  Upload
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "dashboard" && <OrderDashboard />}
            {activeTab === "recommendations" && <RecommendationPanel />}
            {activeTab === "upload" && <UploadPanel />}
          </div>
        </div>

        {/* Savings Dashboard - Shows when selections are confirmed */}
        <SavingsDashboard />

        {/* Bottom Section - Full Width Dashboard (Optional) */}
        {activeTab === "dashboard" && (
          <div className="mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                📊 System Overview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Total Hospitals
                  </h3>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-300 mt-2">
                    {useAppStore.getState().hospitals.length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                    Total Providers
                  </h3>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-300 mt-2">
                    {useAppStore.getState().providers.length}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    Active Orders
                  </h3>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-300 mt-2">
                    {useAppStore.getState().orders.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            MedResilient © 2025 | Powered by Google Earth Engine, FEMA Data &
            Google Maps
          </p>
          <p className="text-xs mt-2">
            Helping hospitals build climate-resilient, low-carbon supply chains
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
