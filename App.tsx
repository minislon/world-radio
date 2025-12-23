import React, { useState, useRef, useEffect } from 'react';
import { findStations } from './services/geminiService';
import { Station, SearchResult } from './types';
import { Player } from './components/Player';
import { StationList } from './components/StationList';
import { StationMap } from './components/StationMap';
import { SearchIcon, SparklesIcon } from './components/Icons';
import { BackgroundVisualizer, VisualizerMode } from './components/BackgroundVisualizer';

// Default Data
const DEFAULT_STATIONS: Station[] = [
  {
    id: 'def-1',
    name: 'KEXP 90.3 FM',
    streamUrl: 'https://kexp-mp3-128.streamguys1.com/kexp128.mp3',
    websiteUrl: 'https://www.kexp.org',
    location: 'Seattle, USA',
    genre: 'Alternative',
    description: 'Music that matters. A rich mix of alternative and indie rock.',
    latitude: 47.6062,
    longitude: -122.3321
  },
  {
    id: 'def-2',
    name: 'BBC World Service',
    streamUrl: 'https://stream.live.vc.bbcmedia.co.uk/bbc_world_service',
    websiteUrl: 'https://www.bbc.co.uk',
    location: 'London, UK',
    genre: 'News',
    description: 'International news, analysis and information from the BBC.',
    latitude: 51.5074,
    longitude: -0.1278
  },
  {
    id: 'def-3',
    name: 'SomaFM: Groove Salad',
    streamUrl: 'https://ice1.somafm.com/groovesalad-128-mp3',
    websiteUrl: 'https://somafm.com',
    location: 'San Francisco, USA',
    genre: 'Chillout',
    description: 'A nicely chilled plate of ambient/downtempo beats and grooves.',
    latitude: 37.7749,
    longitude: -122.4194
  },
  {
    id: 'def-4',
    name: 'Radio Paradise',
    streamUrl: 'https://stream.radioparadise.com/mp3-128',
    websiteUrl: 'https://radioparadise.com',
    location: 'California, USA',
    genre: 'Eclectic',
    description: 'Listener-supported, commercial-free mix of music.',
    latitude: 39.7285,
    longitude: -121.8375
  },
  {
    id: 'def-5',
    name: 'FIP Radio',
    streamUrl: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
    websiteUrl: 'https://www.radiofrance.fr/fip',
    location: 'Paris, France',
    genre: 'Eclectic',
    description: 'A mix of jazz, chanson, world, and more from Radio France.',
    latitude: 48.8566,
    longitude: 2.3522
  }
];

export default function App() {
  // Data State
  const [stations, setStations] = useState<Station[]>(DEFAULT_STATIONS);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [groundingLinks, setGroundingLinks] = useState<string[]>([]);
  
  // Audio State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('bars');

  // Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setStations([]); 
    setGroundingLinks([]);

    try {
      const result: SearchResult = await findStations(query);
      if (result.stations.length > 0) {
        setStations(result.stations);
        setGroundingLinks(result.groundingLinks);
      } else {
         setStations([]); 
      }
    } catch (err) {
      console.error(err);
      setStations([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectStation = (station: Station) => {
    if (currentStation?.id === station.id) {
        // Toggle play if same station
        togglePlay();
    } else {
        setCurrentStation(station);
        // Effect will handle play start
    }
  };

  // Audio Logic
  useEffect(() => {
    if (currentStation && audioRef.current) {
      setIsLoadingAudio(true);
      setAudioError(null);
      setIsPlaying(false);
      
      audioRef.current.src = currentStation.streamUrl;
      audioRef.current.load();
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
          })
          .catch((e) => {
             console.error("Playback error:", e);
             setIsPlaying(false);
             setIsLoadingAudio(false);
             if (e.name === 'NotAllowedError') setAudioError("Tap play");
             else setAudioError("Unavailable");
          });
      }
    }
  }, [currentStation]);

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoadingAudio(true);
      setAudioError(null);
      audioRef.current.play()
        .then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
        })
        .catch(() => {
            setIsPlaying(false);
            setIsLoadingAudio(false);
            setAudioError("Failed to play");
        });
    }
  };

  // Error Handlers
  const handleAudioError = () => {
    setIsLoadingAudio(false);
    setIsPlaying(false);
    setAudioError("Stream offline");
  };

  return (
    <div className="relative min-h-screen text-stone-800 font-sans selection:bg-orange-300 selection:text-orange-900 overflow-x-hidden">
      
      {/* Visualizer Layer (Fixed Background) */}
      <BackgroundVisualizer 
         audioRef={audioRef} 
         isPlaying={isPlaying} 
         mode={visualizerMode}
         color="#f97316" // Orange 500
      />

      {/* Hidden Audio Element */}
      <audio 
        ref={audioRef}
        crossOrigin="anonymous" 
        onError={handleAudioError}
        onCanPlay={() => { if(isLoadingAudio) setIsLoadingAudio(false); }}
        onWaiting={() => setIsLoadingAudio(true)}
        onPlaying={() => { setIsLoadingAudio(false); setIsPlaying(true); setAudioError(null); }}
        preload="none"
      />

      {/* Main UI Layer */}
      <div className="relative z-10">
        
        {/* Header & Search */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-orange-100 py-4 px-4 sm:px-6 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            
            <div className="flex items-center space-x-2 self-start sm:self-auto cursor-default">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30 text-white transform hover:rotate-3 transition-transform">
                <span className="font-bold text-2xl leading-none tracking-tighter">Æ</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-stone-800">
                  Aether Radio
                </h1>
                <p className="text-[10px] text-orange-600 font-medium tracking-widest uppercase">Expert Mode</p>
              </div>
            </div>

            <form onSubmit={handleSearch} className="w-full sm:max-w-md relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search worldwide (e.g., 'Jazz in Tokyo')"
                className="block w-full rounded-2xl border border-orange-200/60 bg-white/60 backdrop-blur-sm py-3 pl-10 pr-4 text-sm text-stone-800 placeholder-stone-400 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all shadow-sm group-hover:bg-white"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                   <div className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                </div>
              )}
            </form>

          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-32">
          
          {/* Status Bar */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-sm inline-block">
              <h2 className="text-2xl font-bold text-stone-800 mb-1 flex items-center gap-2">
                {isSearching ? 'Scanning frequencies...' : query ? `Results for "${query}"` : 'Global Frequencies'}
              </h2>
              <p className="text-stone-500 text-sm font-medium">
                {isSearching 
                  ? 'AI analyzing stream quality and locations...' 
                  : query 
                    ? `Found ${stations.length} broadcasts.` 
                    : 'Discover live radio stations from around the world.'}
              </p>
            </div>
            
            {!isSearching && !query && (
              <div className="flex items-center text-xs font-semibold text-orange-600 bg-orange-100/50 px-4 py-2 rounded-full border border-orange-200/60 backdrop-blur-md shadow-sm">
                <SparklesIcon className="w-4 h-4 mr-1.5" />
                AI Enhanced • Sunny Profile
              </div>
            )}
          </div>

          {/* Map View */}
          {!isSearching && stations.length > 0 && (
            <div className="mb-8 shadow-xl shadow-orange-900/5 rounded-2xl border border-white/60">
              <StationMap 
                stations={stations} 
                currentStation={currentStation} 
                onSelect={selectStation} 
              />
            </div>
          )}

          {/* Stations Grid */}
          <StationList 
            stations={stations} 
            currentStation={currentStation} 
            onSelect={selectStation}
            isLoading={isSearching}
          />

          {/* Grounding Sources */}
          {groundingLinks.length > 0 && (
              <div className="mt-12 pt-8 border-t border-orange-200/50 pb-8">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-orange-400"></span>
                    Verified Sources
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {groundingLinks.map((link, i) => (
                          <li key={i}>
                              <a 
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-orange-600 hover:text-orange-800 hover:underline transition-colors flex items-center gap-1"
                              >
                                  <span className="opacity-50">↗</span> {new URL(link).hostname}
                              </a>
                          </li>
                      ))}
                  </ul>
              </div>
          )}

        </main>
      </div>

      {/* Persistent Player */}
      <Player 
        currentStation={currentStation} 
        isPlaying={isPlaying}
        isLoading={isLoadingAudio}
        error={audioError}
        togglePlay={togglePlay}
        visualizerMode={visualizerMode}
        setVisualizerMode={setVisualizerMode}
      />

    </div>
  );
}