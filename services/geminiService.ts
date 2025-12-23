import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Station, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const stationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING, description: "A unique identifier for the station (can be random)" },
    name: { type: Type.STRING, description: "The name of the radio station" },
    streamUrl: { type: Type.STRING, description: "Direct audio streaming URL (mp3, aac, m3u8, pls). MUST be a valid URL." },
    websiteUrl: { type: Type.STRING, description: "The official homepage URL of the radio station (e.g., https://www.kexp.org). Used to fetch the logo." },
    location: { type: Type.STRING, description: "City and Country of the station" },
    genre: { type: Type.STRING, description: "Primary genre of music or content" },
    description: { type: Type.STRING, description: "Very brief description (max 10 words)." },
    latitude: { type: Type.NUMBER, description: "Approximate latitude of the city/location" },
    longitude: { type: Type.NUMBER, description: "Approximate longitude of the city/location" },
  },
  required: ["name", "streamUrl", "location", "genre", "description", "latitude", "longitude"],
};

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: stationSchema,
};

export const findStations = async (query: string): Promise<SearchResult> => {
  try {
    const prompt = `
      Find a comprehensive list of currently active, working online radio stations for the following query: "${query}".
      
      Target Quantity: Try to find 20 to 50 valid stations if possible.
      
      CRITICAL Requirements:
      1. streamUrl: MUST be a direct audio streaming URL (http/https ending in .mp3, .aac, .pls, .m3u, etc).
      2. websiteUrl: MUST be the official homepage of the station (not the stream url). This is used to find the station's logo.
      
      Provide approximate latitude and longitude for mapping.
      
      Return the data strictly in the requested JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingLinks: string[] = [];
    
    groundingChunks.forEach(chunk => {
      if (chunk.web?.uri) {
        groundingLinks.push(chunk.web.uri);
      }
    });

    let stations: Station[] = response.text ? JSON.parse(response.text) : [];

    // Fallback ID and coordinate validation
    const validStations = stations.map((s, idx) => ({
      ...s,
      id: s.id || `station-${Date.now()}-${idx}`,
      latitude: s.latitude || 0,
      longitude: s.longitude || 0,
      websiteUrl: s.websiteUrl || s.streamUrl // Fallback to stream if website missing, though logo might fail
    }));

    return {
      stations: validStations,
      groundingLinks: Array.from(new Set(groundingLinks)).slice(0, 5), // Unique links, max 5
    };

  } catch (error) {
    console.error("Error fetching stations:", error);
    return { stations: [], groundingLinks: [] };
  }
};