import { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import api, { Order } from "../api/client";

export default function OrderDashboard() {
  const {
    orders,
    setOrders,
    filterDevice,
    setFilterDevice,
    isLoading,
    setIsLoading,
    setError,
  } = useAppStore();
  const [devices, setDevices] = useState<string[]>([]);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    // Extract unique device names
    const uniqueDevices = Array.from(new Set(orders.map((o) => o.device_name)));
    setDevices(uniqueDevices.sort());
  }, [orders]);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await api.getOrders();
      setOrders(data);
      setError(null);
    } catch (error) {
      console.error("Failed to load orders:", error);
      setError("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = filterDevice
    ? orders.filter((order) =>
        order.device_name.toLowerCase().includes(filterDevice.toLowerCase())
      )
    : orders;

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case "high":
        return "text-red-500";
      case "moderate-high":
      case "moderate":
        return "text-yellow-500";
      case "minimal":
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          📦 Orders Dashboard
        </h2>
        <button
          onClick={loadOrders}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Filter by Device
        </label>
        <select
          value={filterDevice}
          onChange={(e) => setFilterDevice(e.target.value)}
          className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
        >
          <option value="">All Devices</option>
          {devices.map((device) => (
            <option key={device} value={device}>
              {device}
            </option>
          ))}
        </select>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white">
                Device
              </th>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white">
                Hospital
              </th>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white">
                Provider
              </th>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white">
                Risk Level
              </th>
              <th className="px-4 py-3 text-left text-gray-900 dark:text-white">
                Delivery Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {isLoading ? "Loading orders..." : "No orders found"}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr
                  key={order.order_id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                >
                  <td className="px-4 py-3 text-gray-900 dark:text-white font-medium">
                    {order.device_name}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {order.hospital?.name || order.hospital_id}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {order.provider?.name || order.provider_id}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {order.quantity}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${getRiskColor(
                      order.provider?.risk_level
                    )}`}
                  >
                    {order.provider?.risk_level || "Unknown"}
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                    {new Date(order.delivery_date).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredOrders.length} of {orders.length} orders
        </p>
      </div>
    </div>
  );
}
