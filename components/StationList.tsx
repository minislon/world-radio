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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-white/20 rounded-3xl border border-white/40 shadow-sm"></div>
        ))}
      </div>
    );
  }

  if (stations.length === 0) {
    return (
      <div className="text-center py-32 bg-white/20 rounded-[2.5rem] border border-white/40 backdrop-blur-sm mx-auto max-w-2xl">
        <p className="text-2xl font-bold text-stone-700 mb-3">No stations found</p>
        <p className="text-base text-stone-500">Try a different search term to explore the airwaves.</p>
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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      {stations.map((station) => {
        const isActive = currentStation?.id === station.id;
        const logoUrl = getFaviconUrl(station.websiteUrl || station.streamUrl);
        
        return (
          <div 
            key={station.id}
            onClick={() => onSelect(station)}
            className={`
              group relative p-6 rounded-[2rem] border cursor-pointer transition-all duration-500
              ${isActive 
                ? 'bg-white/90 border-orange-200 shadow-2xl shadow-orange-500/10 scale-[1.02]' 
                : 'bg-white/40 hover:bg-white/80 border-white/40 hover:border-white hover:shadow-xl hover:shadow-stone-200/50 backdrop-blur-sm'
              }
            `}
          >
            <div className="flex items-center gap-5 mb-5">
              {/* Logo / Placeholder */}
              <div className={`
                shrink-0 w-16 h-16 rounded-2xl border overflow-hidden flex items-center justify-center transition-all duration-500 shadow-sm
                ${isActive ? 'bg-orange-50 border-orange-100 rotate-3' : 'bg-white/50 border-white/60 group-hover:bg-orange-50 group-hover:rotate-3'}
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
                    <MusicNoteIcon className="w-8 h-8 text-stone-300" />
                 </div>
                 {!logoUrl && <MusicNoteIcon className="w-8 h-8 text-stone-300" />}
              </div>

              <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-lg truncate pr-2 transition-colors ${isActive ? 'text-orange-600' : 'text-stone-800'}`}>
                    {station.name}
                  </h3>
                  <div className="text-xs font-semibold text-stone-500 truncate mt-1.5 flex items-center tracking-wide uppercase">
                      <GlobeIcon className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                      {station.location}
                  </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
               <span className={`
                 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold border transition-colors
                 ${isActive 
                   ? 'bg-orange-100 text-orange-700 border-orange-200' 
                   : 'bg-white/50 text-stone-500 border-white group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:border-orange-100'
                 }
               `}>
                {station.genre}
              </span>
            </div>

            <p className="text-stone-500 text-sm line-clamp-2 mb-2 leading-relaxed opacity-90 font-medium">
              {station.description}
            </p>

            <div className={`
              absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg
              ${isActive 
                ? 'bg-orange-500 text-white translate-y-0 opacity-100' 
                : 'bg-stone-900 text-white opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 group-hover:bg-orange-500'
              }
            `}>
              <PlayIcon className="w-6 h-6 ml-0.5 fill-current" />
            </div>
          </div>
        );
      })}
    </div>
  );
};