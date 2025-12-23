import React from 'react';
import { Station } from '../types';
import { PlayIcon, GlobeIcon, MusicNoteIcon } from './Icons';

interface StationListProps {
  stations: Station[];
  currentStation: Station | null;
  onSelect: (station: Station) => void;
  isLoading: boolean;
}

export const StationList: React.FC<StationListProps> = ({ stations, currentStation, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-36 bg-white/20 rounded-2xl border border-white/40 shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-20 bg-white/30 rounded-3xl border border-white/50 backdrop-blur-sm">
        <p className="text-xl font-medium text-stone-600 mb-2">No stations found.</p>
        <p className="text-sm text-stone-500">Try searching for a genre, country, or specific station name.</p>
      </div>
    );
  }

  const getFaviconUrl = (url?: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {stations.map((station) => {
        const isActive = currentStation?.id === station.id;
        const logoUrl = getFaviconUrl(station.websiteUrl || station.streamUrl);
        
        return (
          <div 
            key={station.id}
            onClick={() => onSelect(station)}
            className={`
              group relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden
              ${isActive 
                ? 'bg-white border-orange-400 ring-2 ring-orange-200 ring-offset-1 shadow-xl shadow-orange-500/10' 
                : 'bg-white/60 hover:bg-white border-white/60 hover:border-orange-200/50 shadow-sm hover:shadow-md backdrop-blur-sm'
              }
            `}
          >
            <div className="flex items-start gap-4 mb-4">
              {/* Logo / Placeholder */}
              <div className={`
                shrink-0 w-14 h-14 rounded-xl border overflow-hidden flex items-center justify-center transition-colors
                ${isActive ? 'bg-orange-50 border-orange-100' : 'bg-stone-50 border-stone-100 group-hover:bg-orange-50'}
              `}>
                 {logoUrl ? (
                   <img 
                      src={logoUrl} 
                      alt={station.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement?.classList.add('fallback-icon');
                      }}
                   />
                 ) : null}
                 <div className="hidden fallback-icon:flex w-full h-full items-center justify-center">
                    <MusicNoteIcon className="w-6 h-6 text-stone-300" />
                 </div>
                 {!logoUrl && <MusicNoteIcon className="w-6 h-6 text-stone-300" />}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-base truncate pr-2 ${isActive ? 'text-orange-600' : 'text-stone-800'}`}>
                      {station.name}
                    </h3>
                     {isActive && (
                        <div className="flex space-x-0.5 mt-2">
                           <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce"></div>
                           <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce delay-75"></div>
                           <div className="w-1 h-1 bg-orange-500 rounded-full animate-bounce delay-150"></div>
                        </div>
                      )}
                  </div>
                  <div className="text-xs font-medium text-stone-500 truncate mt-1 flex items-center">
                      <GlobeIcon className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                      {station.location}
                  </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-3">
               <span className={`
                 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold border
                 ${isActive 
                   ? 'bg-orange-100 text-orange-700 border-orange-200' 
                   : 'bg-stone-100 text-stone-500 border-stone-200 group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100'
                 }
               `}>
                {station.genre}
              </span>
            </div>

            <p className="text-stone-500 text-xs line-clamp-2 mb-2 leading-relaxed opacity-90">
              {station.description}
            </p>

            <div className={`
              absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg
              ${isActive 
                ? 'bg-orange-500 text-white scale-100' 
                : 'bg-stone-800 text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-orange-500'
              }
            `}>
              <PlayIcon className="w-5 h-5 ml-0.5 fill-current" />
            </div>
          </div>
        );
      })}
    </div>
  );
};