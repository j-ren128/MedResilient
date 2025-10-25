import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Hospital {
  hospital_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  flood_zone?: string;
  risk_level?: string;
}

export interface Provider {
  provider_id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  transport_mode: string;
  flood_zone?: string;
  risk_level?: string;
  risk_score?: number;
  devices_supplied?: string[];
}

export interface Order {
  order_id: string;
  hospital_id: string;
  provider_id: string;
  device_name: string;
  quantity: number;
  order_date: string;
  delivery_date: string;
  hospital?: Hospital;
  provider?: Provider;
}

export interface RouteRecommendation {
  provider: Provider;
  hospital: Hospital;
  distance_km: number;
  transport_mode: string;
  carbon_emission_kg: number;
  flood_risk: number;
  weighted_score: number;
  route_polyline: string | null;
  estimated_time: string | null;
  requested_device?: string | null;
  offered_device?: string | null;
  is_substitute?: boolean;
}

export interface MapData {
  hospitals: Hospital[];
  providers: Provider[];
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const api = {
  // Health check
  healthCheck: async () => {
    const response = await apiClient.get("/health");
    return response.data;
  },

  // Hospitals
  getHospitals: async (): Promise<Hospital[]> => {
    const response = await apiClient.get("/hospitals");
    return response.data.hospitals;
  },

  getHospital: async (hospitalId: string): Promise<Hospital> => {
    const response = await apiClient.get(`/hospitals/${hospitalId}`);
    return response.data.hospital;
  },

  // Providers
  getProviders: async (): Promise<Provider[]> => {
    const response = await apiClient.get("/providers");
    return response.data.providers;
  },

  getProvider: async (providerId: string): Promise<Provider> => {
    const response = await apiClient.get(`/providers/${providerId}`);
    return response.data.provider;
  },

  // Orders
  getOrders: async (filters?: {
    hospital_id?: string;
    device_name?: string;
  }): Promise<Order[]> => {
    const response = await apiClient.get("/orders", { params: filters });
    return response.data.orders;
  },

  // Recommendations
  getRecommendations: async (
    hospitalId: string,
    alpha?: number,
    beta?: number,
    limit?: number,
    device?: string
  ): Promise<RouteRecommendation[]> => {
    const response = await apiClient.post("/recommendations", {
      hospital_id: hospitalId,
      alpha,
      beta,
      limit,
      device,
    });
    return response.data.recommendations;
  },

  // Analyze specific provider
  analyzeProvider: async (hospitalId: string, providerId: string) => {
    const response = await apiClient.post("/analyze-provider", {
      hospital_id: hospitalId,
      provider_id: providerId,
    });
    return response.data;
  },

  // Map data
  getMapData: async (): Promise<MapData> => {
    const response = await apiClient.get("/mapdata");
    return response.data;
  },

  // Flood risk for location
  getFloodRisk: async (latitude: number, longitude: number) => {
    const response = await apiClient.post("/flood-risk", {
      latitude,
      longitude,
    });
    return response.data;
  },

  // Upload CSV
  uploadCSV: async (file: File, type: "hospitals" | "providers" | "orders") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const response = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

export default api;
