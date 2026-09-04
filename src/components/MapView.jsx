import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TOWNS } from '../data/events';
import { Navigation, Calendar, Clock, Eye, Sparkles } from 'lucide-react';

export default function MapView({
  events,
  selectedTown,
  setSelectedTown,
  onSelectEvent,
  focusedEvent
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [activeMapEvent, setActiveMapEvent] = useState(focusedEvent || null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCoords = focusedEvent?.coordinates || [38.6431, 34.8289]; // Göreme center
      const map = L.map(mapContainerRef.current, {
        center: initialCoords,
        zoom: 12,
        zoomControl: false
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // CartoDB Dark Matter / Warm tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when events or filters change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];

    const filteredEvents = selectedTown && selectedTown !== 'Tümü'
      ? events.filter(e => e.town === selectedTown)
      : events;

    filteredEvents.forEach(evt => {
      if (!evt.coordinates) return;

      const iconHtml = `
        <div style="
          background: linear-gradient(135deg, #ff6e40, #d90429);
          border: 2px solid #ffffff;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          font-size: 17px;
          cursor: pointer;
          transition: transform 0.2s;
        ">
          ${evt.categoryIcon || '🎈'}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: iconHtml,
        iconSize: [38, 38],
        iconAnchor: [19, 19]
      });

      const marker = L.marker(evt.coordinates, { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        setActiveMapEvent(evt);
        map.flyTo(evt.coordinates, 14, { duration: 0.8 });
      });

      markersRef.current.push(marker);
    });

    if (focusedEvent && focusedEvent.coordinates) {
      map.flyTo(focusedEvent.coordinates, 14, { duration: 0.8 });
      setActiveMapEvent(focusedEvent);
    }
  }, [events, selectedTown, focusedEvent]);

  const handleDirections = (evt) => {
    if (!evt || !evt.coordinates) return;
    const [lat, lng] = evt.coordinates;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${encodeURIComponent(evt.locationName)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="map-view-container">
      {/* Town selector bar */}
      <div className="map-floating-overlay">
        <div className="map-town-scroll">
          {TOWNS.map((town) => (
            <button
              key={town}
              className={`town-pill ${selectedTown === town ? 'active' : ''}`}
              onClick={() => setSelectedTown(town)}
            >
              📍 {town}
            </button>
          ))}
        </div>
      </div>

      {/* Map DOM target */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Selected Marker Card preview */}
      {activeMapEvent && (
        <div className="map-event-popup-card">
          <div style={{ display: 'flex', gap: 12 }}>
            <img
              src={activeMapEvent.image}
              alt={activeMapEvent.title}
              style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
                  {activeMapEvent.town} • {activeMapEvent.categoryName}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: activeMapEvent.isFree ? '#06d6a0' : '#ffab40' }}>
                  {activeMapEvent.isFree ? 'Ücretsiz' : activeMapEvent.priceLabel}
                </span>
              </div>

              <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '3px 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeMapEvent.title}
              </h4>

              <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Calendar size={11} /> {activeMapEvent.date}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Clock size={11} /> {activeMapEvent.time}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <button
                  className="card-quick-action"
                  style={{ background: 'var(--primary)', color: 'white', flex: 1, justifyContent: 'center' }}
                  onClick={() => onSelectEvent(activeMapEvent)}
                >
                  <Eye size={12} />
                  <span>Detaylar</span>
                </button>
                <button
                  className="card-quick-action"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => handleDirections(activeMapEvent)}
                >
                  <Navigation size={12} />
                  <span>Yol Tarifi</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
