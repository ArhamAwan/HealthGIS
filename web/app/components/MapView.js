'use client';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useTheme } from '../context/ThemeContext';

const tealIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"><path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="#0892A5"/><circle cx="14" cy="14" r="6" fill="white"/></svg>`),
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

const selectedIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"><path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.27 21.73 0 14 0z" fill="#BB7E5D"/><circle cx="14" cy="14" r="6" fill="white"/></svg>`),
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -40],
});

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 13, { duration: 0.8 });
  }, [center, zoom, map]);
  return null;
}

export default function MapView_({ center, zoom = 13, hospitals = [], selectedHospitalId, onMarkerClick, userLocation, children }) {
  const { isDark } = useTheme();
  const lightTile = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
  const darkTile = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const defaultCenter = center || [33.6938, 73.0489];

  return (
    <MapContainer center={defaultCenter} zoom={zoom} className="w-full h-full" zoomControl={false}>
      <TileLayer url={isDark ? darkTile : lightTile} attribution='&copy; <a href="https://carto.com/">CARTO</a>' />
      <MapUpdater center={center} zoom={zoom} />
      {userLocation && (
        <CircleMarker
          center={[userLocation.latitude, userLocation.longitude]}
          radius={7}
          pathOptions={{
            color: '#0892A5',
            fillColor: '#0892A5',
            fillOpacity: 0.95,
            weight: 2,
          }}
        >
          <Tooltip
            permanent
            direction="top"
            offset={[0, -8]}
            className="!bg-[var(--card)] !border !border-[var(--border)] !text-[var(--text)] !text-[10px] !font-semibold !rounded-full !px-2 !py-0.5 shadow-md"
          >
            You
          </Tooltip>
        </CircleMarker>
      )}
      {hospitals.map((h) => (
        <Marker
          key={h.id}
          position={[h.latitude, h.longitude]}
          icon={selectedHospitalId === h.id ? selectedIcon : tealIcon}
          eventHandlers={{ click: () => onMarkerClick?.(h) }}
        >
          <Popup>
            <b>{h.name}</b>
            <br />
            {h.address}
          </Popup>
        </Marker>
      ))}
      {children}
    </MapContainer>
  );
}
