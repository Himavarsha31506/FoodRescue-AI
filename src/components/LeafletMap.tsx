import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  category?: string;
  quantityKg?: number;
  status?: string;
  type?: 'DONATION' | 'PROVIDER' | 'NGO' | 'VOLUNTEER';
  onClick?: () => void;
}

interface LeafletMapProps {
  markers: MapMarkerItem[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  onMarkerClick?: (marker: MapMarkerItem) => void;
}

// Self-contained SVG Icon generation to avoid missing asset png errors
const createCustomIcon = (type: 'DONATION' | 'PROVIDER' | 'NGO' | 'VOLUNTEER' = 'DONATION') => {
  let bgColor = '#10B981'; // emerald
  let symbol = '🍴';

  if (type === 'NGO') {
    bgColor = '#2563EB'; // blue
    symbol = '🏠';
  } else if (type === 'VOLUNTEER') {
    bgColor = '#4F46E5'; // indigo
    symbol = '🚚';
  } else if (type === 'PROVIDER') {
    bgColor = '#059669'; // dark emerald
    symbol = '🍲';
  }

  const svgHtml = `
    <div style="
      background-color: ${bgColor};
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
      border: 2px solid white;
    ">
      <span>${symbol}</span>
    </div>
  `;

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: svgHtml,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export const LeafletMap: React.FC<LeafletMapProps> = ({
  markers,
  center = [37.78, -122.42],
  zoom = 13,
  height = '420px',
  onMarkerClick,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    if (markers.length === 0) return;

    const latLngs: L.LatLngExpression[] = [];

    markers.forEach((item) => {
      if (isNaN(item.lat) || isNaN(item.lng)) return;

      const icon = createCustomIcon(item.type);
      const marker = L.marker([item.lat, item.lng], { icon });

      const popupContent = `
        <div style="padding: 12px; font-family: system-ui, sans-serif; min-width: 180px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #059669; margin-bottom: 2px;">
            ${item.category ? item.category.replace('_', ' ') : (item.type || 'LISTING')}
          </div>
          <div style="font-size: 13px; font-weight: 700; color: #111827; margin-bottom: 4px; line-height: 1.2;">
            ${item.title}
          </div>
          ${item.subtitle ? `<div style="font-size: 12px; color: #4B5563; margin-bottom: 6px;">${item.subtitle}</div>` : ''}
          ${item.quantityKg ? `<div style="font-size: 12px; font-weight: 600; color: #111827;">Quantity: <span style="color:#059669">${item.quantityKg} kg</span></div>` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onMarkerClick) onMarkerClick(item);
      });

      marker.addTo(layer);
      latLngs.push([item.lat, item.lng]);
    });

    if (latLngs.length > 1) {
      const bounds = L.latLngBounds(latLngs);
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (latLngs.length === 1) {
      map.setView(latLngs[0], 14);
    }
  }, [markers, onMarkerClick]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-neutral-200 shadow-xs">
      <div ref={mapContainerRef} style={{ height }} className="w-full" />
    </div>
  );
};
