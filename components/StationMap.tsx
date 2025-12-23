import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Station } from '../types';
import { PlayIcon } from './Icons';

// Fix Leaflet default icon path issues in React
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Orange/Gold marker for active station
const activeIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface StationMapProps {
  stations: Station[];
  currentStation: Station | null;
  onSelect: (station: Station) => void;
}

const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

export const StationMap: React.FC<StationMapProps> = ({ stations, currentStation, onSelect }) => {
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [zoom, setZoom] = useState(2);

  useEffect(() => {
    if (currentStation && currentStation.latitude && currentStation.longitude) {
      setCenter([currentStation.latitude, currentStation.longitude]);
      setZoom(5);
    } else if (stations.length > 0) {
       // Keep default view
    }
  }, [currentStation, stations]);

  const getFaviconUrl = (url?: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="h-80 sm:h-[28rem] w-full bg-orange-50 relative z-0">
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }} 
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        <MapUpdater center={center} zoom={zoom} />

        {stations.map((station) => {
           const logoUrl = getFaviconUrl(station.websiteUrl || station.streamUrl);
           return (
            <Marker 
              key={station.id} 
              position={[station.latitude || 0, station.longitude || 0]}
              icon={currentStation?.id === station.id ? activeIcon : customIcon}
              eventHandlers={{
                click: () => onSelect(station),
              }}
            >
              <Popup className="custom-popup">
                <div className="text-sm flex flex-col items-start gap-3 min-w-[160px] p-1">
                  {logoUrl && <img src={logoUrl} className="w-12 h-12 rounded-xl bg-white border border-orange-100 object-cover shadow-sm" alt="" />}
                  <div className="w-full">
                    <div className="font-bold text-stone-900 text-base leading-tight">{station.name}</div>
                    <div className="text-orange-600 text-[10px] font-bold uppercase tracking-widest mt-1">{station.location}</div>
                  </div>
                  <button 
                    onClick={() => onSelect(station)}
                    className="mt-1 w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold py-2 px-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <span className="w-3 h-3"><PlayIcon className="fill-current" /></span>
                    Listen Live
                  </button>
                </div>
              </Popup>
            </Marker>
           );
        })}
      </MapContainer>
    </div>
  );
};