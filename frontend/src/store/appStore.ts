import { create } from "zustand";
import { Hospital, Provider, Order, RouteRecommendation } from "../api/client";

interface ConfirmedSelection {
  id: string;
  recommendation: RouteRecommendation;
  device: string;
  confirmedAt: Date;
  carbonSaved: number;
  timeSaved: number;
}

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

  // Confirmed selections and savings
  confirmedSelections: ConfirmedSelection[];

  // Model parameters
  alpha: number; // Flood risk weight
  beta: number; // Carbon emission weight

  // UI state
  isLoading: boolean;
  error: string | null;
  filterDevice: string;
  filterHospital: string;

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
  confirmSelection: (
    recommendation: RouteRecommendation,
    device: string,
    carbonSaved: number,
    timeSaved: number
  ) => void;
  clearConfirmedSelections: () => void;
  setAlpha: (alpha: number) => void;
  setBeta: (beta: number) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilterDevice: (device: string) => void;
  setFilterHospital: (hospital: string) => void;
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
  confirmedSelections: [],
  alpha: 0.6,
  beta: 0.4,
  isLoading: false,
  error: null,
  filterDevice: "",
  filterHospital: "",

  // Actions
  setHospitals: (hospitals) => set({ hospitals }),
  setProviders: (providers) => set({ providers }),
  setOrders: (orders) => set({ orders }),
  setRecommendations: (recommendations) => set({ recommendations }),
  setSelectedHospital: (hospital) => set({ selectedHospital: hospital }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),
  setSelectedRecommendation: (recommendation) =>
    set({ selectedRecommendation: recommendation }),
  confirmSelection: (recommendation, device, carbonSaved, timeSaved) =>
    set((state) => ({
      confirmedSelections: [
        ...state.confirmedSelections,
        {
          id: `${recommendation.provider.provider_id}-${Date.now()}`,
          recommendation,
          device,
          confirmedAt: new Date(),
          carbonSaved,
          timeSaved,
        },
      ],
    })),
  clearConfirmedSelections: () => set({ confirmedSelections: [] }),
  setAlpha: (alpha) => set({ alpha }),
  setBeta: (beta) => set({ beta }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setFilterDevice: (device) => set({ filterDevice: device }),
  setFilterHospital: (hospital) => set({ filterHospital: hospital }),
}));
