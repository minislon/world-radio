import React, { useEffect, useRef } from 'react';

export type VisualizerMode = 'bars' | 'wave' | 'circle';

interface BackgroundVisualizerProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  mode: VisualizerMode;
  color: string;
}

export const BackgroundVisualizer: React.FC<BackgroundVisualizerProps> = ({ 
  audioRef, 
  isPlaying, 
  mode,
  color 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  // Fallback simulation state
  const simOffsetRef = useRef(0);

  useEffect(() => {
    const initAudio = () => {
      if (!audioRef.current || contextRef.current) return;

      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512; // Higher detail
        
        // Try to connect to source. Note: This will likely fail (silence) for CORS restricted streams
        // We handle this by checking if data is all zeros in the draw loop and falling back to simulation
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        source.connect(ctx.destination);

        contextRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
      } catch (e) {
        console.warn("Audio Context Init Failed (likely CORS or browser policy):", e);
      }
    };

    // Initialize on first user interaction (browser policy)
    const handleInteraction = () => {
      if (!contextRef.current && isPlaying) {
        initAudio();
        if (contextRef.current?.state === 'suspended') {
          contextRef.current.resume();
        }
      }
    };

    window.addEventListener('click', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    if (isPlaying) handleInteraction();

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [audioRef, isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      // Resize handling
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isPlaying) {
        animationRef.current = requestAnimationFrame(render);
        return;
      }

      let data: Uint8Array | null = null;
      let useSimulation = true;

      if (analyserRef.current && dataArrayRef.current) {
        analyserRef.current.getByteFrequencyData(dataArrayRef.current);
        // Check if we are getting real data (sum > 0)
        const sum = dataArrayRef.current.reduce((a, b) => a + b, 0);
        if (sum > 0) {
          useSimulation = false;
          data = dataArrayRef.current;
        }
      }

      // Simulation Generator if CORS blocks audio data
      if (useSimulation) {
        const simSize = 128;
        const simData = new Uint8Array(simSize);
        simOffsetRef.current += 0.05; // speed
        for (let i = 0; i < simSize; i++) {
          // Create perlin-ish noise
          const val = Math.sin(i * 0.1 + simOffsetRef.current) * 50 + 
                      Math.cos(i * 0.3 - simOffsetRef.current) * 50 + 100;
          // Add some jitter
          simData[i] = Math.max(0, Math.min(255, val + (Math.random() * 20 - 10)));
        }
        data = simData;
      }

      if (!data) return;

      const width = canvas.width;
      const height = canvas.height;
      const bufferLength = data.length;

      ctx.fillStyle = color;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;

      if (mode === 'bars') {
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (data[i] / 255) * height * 0.5;
          ctx.fillRect(x, height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      } else if (mode === 'wave') {
        ctx.beginPath();
        const sliceWidth = width / bufferLength;
        let x = 0;
        for (let i = 0; i < bufferLength; i++) {
          const v = data[i] / 128.0;
          const y = (v * height) / 4 + height / 2; // Center it

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);

          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
      } else if (mode === 'circle') {
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 4;

        ctx.beginPath();
        for (let i = 0; i < bufferLength; i++) {
            const rads = (Math.PI * 2) / bufferLength;
            const barHeight = (data[i] / 255) * 100;
            const x = centerX + Math.cos(rads * i) * (radius + barHeight);
            const y = centerY + Math.sin(rads * i) * (radius + barHeight);
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
        
        // Inner circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.8, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.1;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, mode, color]);

  return <canvas id="visualizer-canvas" ref={canvasRef} />;
};