import { create } from "zustand";
import { Hospital, Provider, Order, RouteRecommendation } from "../api/client";

interface AppState {
  // Data
  hospitals: Hospital[];
  providers: Provider[];
  orders: Order[];
  recommendations: RouteRecommendation[];

  // Selected items
  selectedHospital: Hospital | null;
  selectedProvider: Provider | null;
  selectedRecommendation: RouteRecommendation | null;

  // Model parameters
  alpha: number; // Flood risk weight
  beta: number; // Carbon emission weight

  // UI state
  isLoading: boolean;
  error: string | null;
  filterDevice: string;

  // Actions
  setHospitals: (hospitals: Hospital[]) => void;
  setProviders: (providers: Provider[]) => void;
  setOrders: (orders: Order[]) => void;
  setRecommendations: (recommendations: RouteRecommendation[]) => void;
  setSelectedHospital: (hospital: Hospital | null) => void;
  setSelectedProvider: (provider: Provider | null) => void;
  setSelectedRecommendation: (
    recommendation: RouteRecommendation | null
  ) => void;
  setAlpha: (alpha: number) => void;
  setBeta: (beta: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilterDevice: (device: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  hospitals: [],
  providers: [],
  orders: [],
  recommendations: [],
  selectedHospital: null,
  selectedProvider: null,
  selectedRecommendation: null,
  alpha: 0.6,
  beta: 0.4,
  isLoading: false,
  error: null,
  filterDevice: "",

  // Actions
  setHospitals: (hospitals) => set({ hospitals }),
  setProviders: (providers) => set({ providers }),
  setOrders: (orders) => set({ orders }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setSelectedHospital: (hospital) => set({ selectedHospital: hospital }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setSelectedRecommendation: (recommendation) =>
    set({ selectedRecommendation: recommendation }),
  setAlpha: (alpha) => set({ alpha }),
  setBeta: (beta) => set({ beta }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilterDevice: (device) => set({ filterDevice: device }),
}));
