import React, { useState } from 'react';
import { Station } from '../types';
import { PlayIcon, PauseIcon, MusicNoteIcon, VolumeIcon, VolumeMuteIcon, ShareIcon, CheckIcon } from './Icons';
import { VisualizerMode } from './BackgroundVisualizer';

interface PlayerProps {
  currentStation: Station | null;
  isPlaying: boolean;
  isLoading: boolean;
  error: string | null;
  togglePlay: () => void;
  visualizerMode: VisualizerMode;
  setVisualizerMode: (mode: VisualizerMode) => void;
  volume: number;
  onVolumeChange: (val: number) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  currentStation, 
  isPlaying, 
  isLoading, 
  error, 
  togglePlay,
  visualizerMode,
  setVisualizerMode,
  volume,
  onVolumeChange
}) => {
  const [copied, setCopied] = useState(false);

  const getFaviconUrl = (url?: string) => {
    if (!url) return null;
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
      return null;
    }
  };

  const handleShare = () => {
    if (!currentStation) return;
    const shareText = `Listening to ${currentStation.name} (${currentStation.location}) on Aether Radio 🎵`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentStation) return null;
  const logoUrl = getFaviconUrl(currentStation.websiteUrl || currentStation.streamUrl);

  return (
    <div className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-6 sm:right-6 z-50 pointer-events-none flex justify-center">
      <div className="pointer-events-auto w-full max-w-5xl bg-white/80 sm:bg-white/90 backdrop-blur-2xl sm:rounded-[2rem] border-t sm:border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.1)] p-4 sm:p-5 transition-all duration-500 ease-out flex items-center justify-between gap-5 sm:gap-8 ring-1 ring-black/5">
        
        {/* Info Area */}
        <div className="flex items-center gap-5 flex-1 min-w-0">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center shrink-0 border border-white shadow-inner overflow-hidden relative group">
             {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt="" 
                  className={`w-full h-full object-cover transition-transform duration-[20s] ease-linear ${isPlaying ? 'scale-125 rotate-12' : 'scale-100'}`}
                  onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }} 
                />
             ) : null}
             <div className={`absolute inset-0 flex items-center justify-center ${logoUrl ? 'hidden' : ''}`}>
               <MusicNoteIcon className="w-8 h-8 text-orange-200" />
             </div>
          </div>
          <div className="overflow-hidden flex flex-col justify-center">
            <h3 className="font-bold text-stone-900 truncate text-lg sm:text-xl leading-tight">{currentStation.name}</h3>
            <p className="text-orange-600/80 text-xs truncate font-bold uppercase tracking-widest mt-1 flex items-center gap-2">
                {isPlaying && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                {currentStation.location}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 shrink-0">
            
            {/* Share Chip */}
            <button 
                onClick={handleShare}
                className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-stone-100 hover:bg-orange-100 text-stone-400 hover:text-orange-600 transition-colors"
                title="Copy Info"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-green-500" /> : <ShareIcon className="w-5 h-5" />}
            </button>

            {/* Play/Pause */}
            <div className="flex flex-col items-center justify-center relative">
                <button 
                    onClick={togglePlay}
                    disabled={isLoading && !error} 
                    className={`
                    h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 shadow-xl shadow-orange-500/20
                    ${error 
                        ? 'bg-red-50 border-2 border-red-200 text-red-500 hover:bg-red-100' 
                        : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white hover:brightness-110 hover:shadow-orange-500/40'
                    }
                    disabled:opacity-80 disabled:cursor-wait
                    `}
                >
                    {isLoading ? (
                        <div className="w-6 h-6 border-[3px] border-white/80 border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                    <PauseIcon className="w-7 h-7 fill-current" />
                    ) : (
                    <PlayIcon className={`w-8 h-8 ml-1 fill-current ${error ? 'text-red-500' : ''}`} />
                    )}
                </button>
                {error && <span className="absolute -top-3 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-bounce whitespace-nowrap">{error}</span>}
            </div>

            {/* Volume Chip */}
            <div className="hidden sm:flex items-center gap-2 group bg-stone-100/50 hover:bg-stone-100 p-2 rounded-xl transition-colors">
                <button 
                    onClick={() => onVolumeChange(volume === 0 ? 0.5 : 0)}
                    className="text-stone-400 hover:text-stone-600"
                >
                    {volume === 0 ? <VolumeMuteIcon className="w-5 h-5" /> : <VolumeIcon className="w-5 h-5" />}
                </button>
                <div className="w-0 overflow-hidden group-hover:w-20 transition-all duration-300 ease-out flex items-center">
                    <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        value={volume}
                        onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                        className="w-full h-1 bg-stone-300 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all"
                    />
                </div>
            </div>
        </div>

        {/* Visualizer Settings */}
        <div className="hidden lg:flex flex-1 justify-end items-center gap-4">
            <div className="bg-stone-100/50 rounded-2xl p-1.5 border border-white/50 flex gap-1 backdrop-blur-sm">
                {(['bars', 'wave', 'circle'] as VisualizerMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setVisualizerMode(m)}
                        className={`
                            px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize
                            ${visualizerMode === m 
                                ? 'bg-white text-orange-600 shadow-sm' 
                                : 'text-stone-400 hover:text-stone-600 hover:bg-white/50'
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