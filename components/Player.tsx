import React, { useState, useEffect } from 'react';
import { Station } from '../types';
import { PlayIcon, PauseIcon, MusicNoteIcon } from './Icons';
import { VisualizerMode } from './BackgroundVisualizer';

interface PlayerProps {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  togglePlay: () => void;
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  currentStation, 
  isPlaying, 
  isLoading, 
  error, 
  togglePlay,
  visualizerMode,
  setVisualizerMode
}) => {
  const getFaviconUrl = (url?: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      return null;
    }
  };

  if (!currentStation) return null;
  const logoUrl = getFaviconUrl(currentStation.websiteUrl || currentStation.streamUrl);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-xl border-t border-orange-200/50 p-4 pb-6 z-50 transition-all duration-300 shadow-2xl shadow-orange-500/20">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        
        {/* Info Area */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center shrink-0 border border-orange-200 shadow-sm overflow-hidden relative">
             {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }} 
                />
             ) : null}
             <div className={`absolute inset-0 flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}>
               <MusicNoteIcon className="w-6 h-6 text-orange-300" />
             </div>
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-stone-800 truncate text-lg">{currentStation.name}</h3>
            <p className="text-stone-500 text-xs truncate font-medium uppercase tracking-wide">{currentStation.location}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-4">
             <button 
              onClick={togglePlay}
              disabled={isLoading && !error} 
              className={`
                h-14 w-14 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95 shadow-lg shadow-orange-500/30
                ${error 
                  ? 'bg-red-50 border-2 border-red-200 text-red-500 hover:bg-red-100' 
                  : 'bg-gradient-to-tr from-orange-500 to-amber-400 text-white hover:brightness-110 border border-white/20'
                }
                disabled:opacity-80 disabled:cursor-wait
              `}
            >
              {isLoading ? (
                 <div className="w-5 h-5 border-2 border-white/80 border-t-transparent rounded-full animate-spin"></div>
              ) : isPlaying ? (
                <PauseIcon className="w-6 h-6 fill-current" />
              ) : (
                <PlayIcon className={`w-7 h-7 ml-1 fill-current ${error ? 'text-red-500' : ''}`} />
              )}
            </button>
          </div>
          {error && <span className="text-[10px] text-red-500 font-semibold bg-red-50 px-2 py-0.5 rounded-full">{error}</span>}
        </div>

        {/* Visualizer Settings */}
        <div className="hidden sm:flex flex-1 justify-end items-center gap-2">
            <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider mr-2">Visualizer</span>
            <div className="flex bg-orange-50 rounded-lg p-1 border border-orange-100">
                {(['bars', 'wave', 'circle'] as VisualizerMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setVisualizerMode(m)}
                        className={`
                            px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize
                            ${visualizerMode === m 
                                ? 'bg-white text-orange-600 shadow-sm border border-orange-100' 
                                : 'text-stone-500 hover:text-orange-500 hover:bg-white/50'
                            }
                        `}
                    >
                        {m}
                    </button>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};