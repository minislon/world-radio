export interface Station {
  id: string;
  name: string;
  streamUrl: string;
  websiteUrl?: string;
  location: string;
  genre: string;
  description: string;
  latitude: number;
  longitude: number;
}

export interface SearchResult {
  stations: Station[];
  groundingLinks: string[];
}

export interface PlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  error: string | null;
}