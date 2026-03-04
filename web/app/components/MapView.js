'use client';
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useTheme } from '../context/ThemeContext';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

const BASE_PIN_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <path fill="#F76D57" d="M32,52.789l-12-18C18.5,32,16,28.031,16,24c0-8.836,7.164-16,16-16s16,7.164,16,16
      c0,4.031-2.055,8-4,10.789L32,52.789z"/>
    <path fill="#394240" d="M32,0C18.746,0,8,10.746,8,24c0,5.219,1.711,10.008,4.555,13.93c0.051,0.094,0.059,0.199,0.117,0.289
      l16,24C29.414,63.332,30.664,64,32,64s2.586-0.668,3.328-1.781l16-24c0.059-0.09,0.066-0.195,0.117-0.289
      C54.289,34.008,56,29.219,56,24C56,10.746,45.254,0,32,0z M44,34.789l-12,18l-12-18C18.5,32,16,28.031,16,24
      c0-8.836,7.164-16,16-16s16,7.164,16,16C48,28.031,45.945,32,44,34.789z"/>
    <circle fill="#394240" cx="32" cy="24" r="8"/>
  </svg>
`;

export default function MapView_({
  center,
  zoom = 13,
  hospitals = [],
  selectedHospitalId,
  onMarkerClick,
  userLocation,
  children,
}) {
  const { isDark } = useTheme();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const labelOverlaysRef = useRef([]);
  const userMarkerRef = useRef(null);
  const userLabelOverlayRef = useRef(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const defaultCenter = center || [33.6938, 73.0489];

  // If the Google Maps script was already loaded on a previous page,
  // make sure we mark it as loaded when this component mounts so the
  // map always initializes after tab/page switches.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      setIsScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isScriptLoaded) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;
    if (typeof window === 'undefined' || !window.google || !window.google.maps) return;

    mapRef.current = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: defaultCenter[0], lng: defaultCenter[1] },
      zoom,
      disableDefaultUI: true,
      zoomControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      styles: isDark
        ? [
            // Dark base, keep all the usual map context (roads, labels etc.)
            { elementType: 'geometry', stylers: [{ color: '#0b1220' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#e5e7eb' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#020617' }] },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#111827' }],
            },
            // Hide Google POI icons so only our hospitals stand out
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#0f172a' }],
            },
          ]
        : [
            // Light base, keep normal context but remove POI clutter
            { elementType: 'geometry', stylers: [{ color: '#e5e7eb' }] },
            { elementType: 'labels.text.fill', stylers: [{ color: '#374151' }] },
            { elementType: 'labels.text.stroke', stylers: [{ color: '#f9fafb' }] },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{ color: '#ffffff' }],
            },
            {
              featureType: 'poi',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'transit',
              stylers: [{ visibility: 'off' }],
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#bfdbfe' }],
            },
          ],
    });
  }, [isScriptLoaded, defaultCenter, zoom, isDark]);

  function createLabelOverlay({ position, text, kind = 'hospital', onClick }) {
    class LabelOverlay extends window.google.maps.OverlayView {
      constructor() {
        super();
        this.div = null;
      }

      onAdd() {
        const div = document.createElement('div');
        div.setAttribute('data-map-label', kind);
        div.style.position = 'absolute';
        div.style.transform = 'translate(-50%, -100%)';
        div.style.pointerEvents = 'auto';
        div.style.whiteSpace = 'nowrap';

        // Bubble
        div.style.padding = '6px 10px';
        div.style.borderRadius = '999px';
        div.style.fontSize = '12px';
        div.style.fontWeight = '700';
        div.style.letterSpacing = '0.2px';
        div.style.boxShadow = '0 8px 18px rgba(0,0,0,0.18)';
        div.style.border = isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.08)';
        div.style.background = isDark ? 'rgba(17,17,17,0.95)' : 'rgba(255,255,255,0.98)';
        div.style.color = isDark ? '#F5F5F5' : '#111827';

        // Small pointer notch
        const notch = document.createElement('div');
        notch.style.position = 'absolute';
        notch.style.left = '50%';
        notch.style.bottom = '-6px';
        notch.style.transform = 'translateX(-50%)';
        notch.style.width = '0';
        notch.style.height = '0';
        notch.style.borderLeft = '6px solid transparent';
        notch.style.borderRight = '6px solid transparent';
        notch.style.borderTop = isDark
          ? '6px solid rgba(17,17,17,0.95)'
          : '6px solid rgba(255,255,255,0.98)';
        div.appendChild(notch);

        const span = document.createElement('span');
        span.textContent = text;
        div.appendChild(span);

        if (onClick) {
          div.style.cursor = 'pointer';
          div.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          });
        }

        this.div = div;
        const panes = this.getPanes();
        panes?.overlayMouseTarget?.appendChild(div);
      }

      draw() {
        if (!this.div) return;
        const projection = this.getProjection();
        if (!projection) return;
        const point = projection.fromLatLngToDivPixel(position);
        if (!point) return;

        // Lift bubble above the pin
        this.div.style.left = `${point.x}px`;
        this.div.style.top = `${point.y - 34}px`;
      }

      onRemove() {
        if (this.div?.parentNode) this.div.parentNode.removeChild(this.div);
        this.div = null;
      }
    }

    const overlay = new LabelOverlay();
    overlay.setMap(mapRef.current);
    return overlay;
  }

  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.panTo({ lat: center[0], lng: center[1] });
    mapRef.current.setZoom(zoom || 13);
  }, [center, zoom]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    labelOverlaysRef.current.forEach((o) => o.setMap(null));
    labelOverlaysRef.current = [];

    hospitals.forEach((h) => {
      const isSelected = selectedHospitalId === h.id;
      const marker = new window.google.maps.Marker({
        position: { lat: h.latitude, lng: h.longitude },
        map: mapRef.current,
        title: h.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(BASE_PIN_SVG)}`,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 32),
        },
      });

      if (onMarkerClick) {
        marker.addListener('click', () => onMarkerClick(h));
      }

      markersRef.current.push(marker);

      // Add an inDrive-style label bubble above the pin.
      // (Use OverlayView so we can render a pill + notch.)
      if (window.google?.maps?.OverlayView) {
        const overlay = createLabelOverlay({
          position: marker.getPosition(),
          text: h.name,
          kind: 'hospital',
          onClick: onMarkerClick ? () => onMarkerClick(h) : undefined,
        });
        labelOverlaysRef.current.push(overlay);
      }
    });
  }, [hospitals, selectedHospitalId, onMarkerClick, isDark]);

  useEffect(() => {
    if (!isScriptLoaded) return;
    if (!mapRef.current) return;

    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
        userMarkerRef.current = null;
      }
      if (userLabelOverlayRef.current) {
        userLabelOverlayRef.current.setMap(null);
        userLabelOverlayRef.current = null;
      }
      return;
    }

    if (!userMarkerRef.current) {
      userMarkerRef.current = new window.google.maps.Marker({
        position: { lat: userLocation.latitude, lng: userLocation.longitude },
        map: mapRef.current,
        title: 'You',
        zIndex: 999,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(BASE_PIN_SVG)}`,
          scaledSize: new window.google.maps.Size(32, 32),
          anchor: new window.google.maps.Point(16, 30),
        },
      });
    } else {
      userMarkerRef.current.setPosition({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
      });
    }

    // Label bubble for "You"
    if (userMarkerRef.current && window.google?.maps?.OverlayView) {
      const pos = userMarkerRef.current.getPosition();
      if (pos) {
        if (userLabelOverlayRef.current) userLabelOverlayRef.current.setMap(null);
        userLabelOverlayRef.current = createLabelOverlay({
          position: pos,
          text: 'You',
          kind: 'you',
        });
      }
    }

    // Whenever we get a (new) user location, make sure the map recenters
    // and zooms in on them so it's obvious where they are.
    mapRef.current.panTo({
      lat: userLocation.latitude,
      lng: userLocation.longitude,
    });
    mapRef.current.setZoom(17);
  }, [userLocation, isDark, isScriptLoaded]);

  return (
    <>
      {GOOGLE_MAPS_API_KEY && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="lazyOnload"
          onLoad={() => setIsScriptLoaded(true)}
        />
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
      {children}
    </>
  );
}
