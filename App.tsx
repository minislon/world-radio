import React, { useState, useRef, useEffect } from 'react';
import { findStations } from './services/geminiService';
import { Station, SearchResult } from './types';
import { Player } from './components/Player';
import { StationList } from './components/StationList';
import { StationMap } from './components/StationMap';
import { SearchIcon, SparklesIcon, DiceIcon } from './components/Icons';
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
  const [volume, setVolume] = useState(0.8);
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

  const handleSurpriseMe = () => {
    if (stations.length > 0) {
        const randomStation = stations[Math.floor(Math.random() * stations.length)];
        selectStation(randomStation);
    }
  };

  const selectStation = (station: Station) => {
    if (currentStation?.id === station.id) {
        togglePlay();
    } else {
        setCurrentStation(station);
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
      
      // Update Title
      document.title = `▶ ${currentStation.name} | Aether Radio`;
    } else {
        document.title = "Aether Radio";
    }
  }, [currentStation]);

  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = volume;
      }
  }, [volume]);

  const togglePlay = () => {
    if (!audioRef.current || !currentStation) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      document.title = `${currentStation.name} | Aether Radio`;
    } else {
      setIsLoadingAudio(true);
      setAudioError(null);
      audioRef.current.play()
        .then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
            document.title = `▶ ${currentStation.name} | Aether Radio`;
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
    <div className="relative min-h-screen text-stone-800 font-sans selection:bg-orange-200 selection:text-orange-900 overflow-x-hidden">
      
      {/* Visualizer Layer (Fixed Background) */}
      <BackgroundVisualizer 
         audioRef={audioRef} 
         isPlaying={isPlaying} 
         mode={visualizerMode}
         color="#fb923c" // Orange 400
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
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Header & Search */}
        <header className="sticky top-0 z-40 py-6 px-6 pointer-events-none">
           {/* Center Content for Pointer Events */}
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pointer-events-auto">
            
            <div className="flex items-center space-x-3 self-start md:self-auto cursor-default group">
              <div className="w-12 h-12 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 flex items-center justify-center shadow-lg shadow-orange-500/10 text-orange-600 transition-all group-hover:scale-105 group-hover:bg-white/60">
                <span className="font-bold text-2xl leading-none tracking-tighter">Æ</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-2xl font-bold tracking-tight text-stone-800 leading-tight">
                  Aether Radio
                </h1>
                <p className="text-[10px] text-orange-600/80 font-bold tracking-[0.2em] uppercase">Expert Mode</p>
              </div>
            </div>

            <div className="w-full md:max-w-lg flex items-center gap-2">
                <form onSubmit={handleSearch} className="flex-1 relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-stone-400 group-focus-within:text-orange-500 transition-colors" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search locations or genres..."
                    className="block w-full rounded-full border-0 bg-white/50 backdrop-blur-md py-4 pl-14 pr-6 text-base text-stone-800 placeholder-stone-400 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all shadow-sm hover:shadow-md hover:bg-white/70"
                />
                {isSearching && (
                    <div className="absolute inset-y-0 right-5 flex items-center">
                    <div className="w-5 h-5 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                    </div>
                )}
                </form>
                
                <button 
                    onClick={handleSurpriseMe}
                    className="h-14 w-14 rounded-full bg-white/50 hover:bg-white text-stone-500 hover:text-orange-500 flex items-center justify-center backdrop-blur-md shadow-sm transition-all hover:shadow-md active:scale-95 group"
                    title="Surprise Me"
                >
                    <DiceIcon className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                </button>
            </div>

          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 w-full flex-grow pb-40">
          
          {/* Status Bar */}
          <div className="mt-8 mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="">
              <h2 className="text-3xl font-bold text-stone-800 mb-2 tracking-tight">
                {isSearching ? 'Scanning frequencies...' : query ? `Results for "${query}"` : 'Global Frequencies'}
              </h2>
              <p className="text-stone-500 text-lg">
                {isSearching 
                  ? 'Locating best signals...' 
                  : query 
                    ? `Found ${stations.length} broadcasts.` 
                    : 'Discover live radio stations from around the world.'}
              </p>
            </div>
            
            {!isSearching && !query && (
              <div className="flex items-center text-xs font-bold text-orange-600 bg-white/40 px-5 py-2.5 rounded-full border border-orange-100/50 backdrop-blur-sm shadow-sm">
                <SparklesIcon className="w-4 h-4 mr-2" />
                AI Enhanced • Sunny Profile
              </div>
            )}
          </div>

          {/* Map View */}
          {!isSearching && stations.length > 0 && (
            <div className="mb-12 shadow-2xl shadow-orange-900/5 rounded-3xl overflow-hidden border border-white/60 ring-4 ring-white/20">
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
              <div className="mt-16 pt-10 border-t border-orange-200/30">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                    Verified Sources
                  </h4>
                  <ul className="flex flex-wrap gap-x-8 gap-y-3">
                      {groundingLinks.map((link, i) => (
                          <li key={i}>
                              <a 
                                  href={link} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-stone-500 hover:text-orange-600 transition-colors flex items-center gap-1.5 bg-white/30 px-3 py-1.5 rounded-lg border border-transparent hover:border-orange-100 hover:bg-white/60"
                              >
                                  {new URL(link).hostname} <span className="opacity-40">↗</span>
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
        volume={volume}
        onVolumeChange={setVolume}
      />

    </div>
  );
}