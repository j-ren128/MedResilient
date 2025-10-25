import { useEffect, useRef, useState } from "react";
import { useAppStore } from "../store/appStore";
import { Hospital, Provider } from "../api/client";

const GOOGLE_MAPS_API_KEY = "AIzaSyCTDEGProhiHdmRzd93yUpjWXv8lTnJk6w";

interface MapViewProps {
  onHospitalClick?: (hospital: Hospital) => void;
  onProviderClick?: (provider: Provider) => void;
}

export default function MapView({
  onHospitalClick,
  onProviderClick,
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [routePolyline, setRoutePolyline] =
    useState<google.maps.Polyline | null>(null);

  const { hospitals, providers, selectedRecommendation } = useAppStore();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const newMap = new google.maps.Map(mapRef.current, {
      center: { lat: 27.9944, lng: -81.7603 }, // Center of Florida
      zoom: 7,
      mapTypeId: "terrain",
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#193341" }],
        },
      ],
    });

    setMap(newMap);
  }, []);

  // Add markers for hospitals and providers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Add hospital markers (blue)
    hospitals.forEach((hospital) => {
      const marker = new google.maps.Marker({
        position: { lat: hospital.latitude, lng: hospital.longitude },
        map: map,
        title: hospital.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#3B82F6",
          fillOpacity: 0.9,
          strokeColor: "#1E40AF",
          strokeWeight: 2,
        },
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold text-blue-600">${hospital.name}</h3>
            <p class="text-sm">${hospital.city}, ${hospital.state}</p>
            ${
              hospital.flood_zone
                ? `<p class="text-xs mt-1">Flood Zone: ${hospital.flood_zone}</p>`
                : ""
            }
            ${
              hospital.risk_level
                ? `<p class="text-xs">Risk: ${hospital.risk_level}</p>`
                : ""
            }
          </div>
        `,
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
        if (onHospitalClick) onHospitalClick(hospital);
      });

      newMarkers.push(marker);
    });

    // Add provider markers (green)
    providers.forEach((provider) => {
      // Determine marker color based on flood risk score
      let fillColor = "#10B981"; // green (low risk)
      let strokeColor = "#059669";

      if (provider.risk_score !== undefined) {
        if (provider.risk_score >= 0.8) {
          fillColor = "#EF4444"; // red (high risk)
          strokeColor = "#DC2626";
        } else if (provider.risk_score >= 0.6) {
          fillColor = "#F59E0B"; // amber (moderate-high risk)
          strokeColor = "#D97706";
        } else if (provider.risk_score >= 0.3) {
          fillColor = "#FBBF24"; // yellow (moderate risk)
          strokeColor = "#F59E0B";
        }
      }

      const marker = new google.maps.Marker({
        position: { lat: provider.latitude, lng: provider.longitude },
        map: map,
        title: provider.name,
        icon: {
          path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: fillColor,
          fillOpacity: 0.9,
          strokeColor: strokeColor,
          strokeWeight: 2,
        },
      });

      // Format risk score as percentage
      const riskPercentage = provider.risk_score
        ? `${(provider.risk_score * 100).toFixed(0)}%`
        : "N/A";

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3 min-w-[200px]">
            <h3 class="font-bold text-green-600">${provider.name}</h3>
            <p class="text-sm text-gray-700">${provider.type}</p>
            <p class="text-sm text-gray-600">${provider.city}, ${
          provider.state
        }</p>
            <div class="mt-2 pt-2 border-t border-gray-200">
              <p class="text-xs font-semibold text-gray-700">Transport: ${
                provider.transport_mode
              }</p>
              ${
                provider.flood_zone
                  ? `<p class="text-xs text-gray-700 mt-1">Flood Zone: <span class="font-semibold">${provider.flood_zone}</span></p>`
                  : ""
              }
              ${
                provider.risk_level
                  ? `<p class="text-xs text-gray-700">Risk Level: <span class="font-semibold capitalize">${provider.risk_level}</span></p>`
                  : ""
              }
              ${
                provider.risk_score !== undefined
                  ? `<p class="text-xs text-gray-700">Flood Risk Score: <span class="font-bold" style="color: ${fillColor}">${riskPercentage}</span></p>`
                  : ""
              }
            </div>
          </div>
        `,
      });

      // Show info window on hover
      marker.addListener("mouseover", () => {
        infoWindow.open(map, marker);
      });

      // Hide info window when mouse leaves
      marker.addListener("mouseout", () => {
        infoWindow.close();
      });

      // Also keep click handler for provider selection
      marker.addListener("click", () => {
        if (onProviderClick) onProviderClick(provider);
      });

      newMarkers.push(marker);
    });

    setMarkers(newMarkers);
  }, [map, hospitals, providers]);

  // Draw route when recommendation is selected
  useEffect(() => {
    if (!map || !selectedRecommendation) {
      if (routePolyline) {
        routePolyline.setMap(null);
        setRoutePolyline(null);
      }
      return;
    }

    // Clear existing route
    if (routePolyline) {
      routePolyline.setMap(null);
    }

    const { provider, hospital, flood_risk } = selectedRecommendation;

    // Determine route color based on flood risk
    let strokeColor = "#10B981"; // green (low risk)
    if (flood_risk > 0.6) {
      strokeColor = "#EF4444"; // red (high risk)
    } else if (flood_risk > 0.3) {
      strokeColor = "#F59E0B"; // yellow (medium risk)
    }

    // Draw polyline
    const path = [
      { lat: provider.latitude, lng: provider.longitude },
      { lat: hospital.latitude, lng: hospital.longitude },
    ];

    const polyline = new google.maps.Polyline({
      path: path,
      geodesic: true,
      strokeColor: strokeColor,
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map,
    });

    setRoutePolyline(polyline);

    // Center map on route
    const bounds = new google.maps.LatLngBounds();
    path.forEach((point) => bounds.extend(point));
    map.fitBounds(bounds);
  }, [map, selectedRecommendation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-lg" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-[220px]">
        <h3 className="font-bold mb-2 text-gray-900 dark:text-white">Legend</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 dark:text-gray-300">Hospitals</span>
          </div>
          <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
            <p className="font-semibold mb-1 text-gray-900 dark:text-white text-xs">
              Providers (by Flood Risk)
            </p>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500"></div>
              <span className="text-gray-700 dark:text-gray-300 text-xs">
                Low (&lt;30%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400"></div>
              <span className="text-gray-700 dark:text-gray-300 text-xs">
                Moderate (30-60%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500"></div>
              <span className="text-gray-700 dark:text-gray-300 text-xs">
                Moderate-High (60-80%)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500"></div>
              <span className="text-gray-700 dark:text-gray-300 text-xs">
                High (≥80%)
              </span>
            </div>
          </div>
          <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
            <p className="text-xs text-gray-600 dark:text-gray-400 italic">
              Hover over markers for details
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
