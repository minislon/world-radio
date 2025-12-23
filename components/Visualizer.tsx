import React from 'react';

export const Visualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  if (!isPlaying) {
    return (
      <div className="flex items-end justify-center space-x-1 h-8 w-12 opacity-50">
        <div className="w-1.5 h-1 bg-cyan-500 rounded-t-sm"></div>
        <div className="w-1.5 h-1 bg-cyan-400 rounded-t-sm"></div>
        <div className="w-1.5 h-1 bg-cyan-300 rounded-t-sm"></div>
        <div className="w-1.5 h-1 bg-cyan-400 rounded-t-sm"></div>
        <div className="w-1.5 h-1 bg-cyan-500 rounded-t-sm"></div>
      </div>
    );
  }

  return (
    <div className="flex items-end justify-center space-x-1 h-8 w-12">
      <div className="visualizer-bar w-1.5 h-full bg-cyan-500 rounded-t-sm origin-bottom"></div>
      <div className="visualizer-bar w-1.5 h-full bg-cyan-400 rounded-t-sm origin-bottom"></div>
      <div className="visualizer-bar w-1.5 h-full bg-cyan-300 rounded-t-sm origin-bottom"></div>
      <div className="visualizer-bar w-1.5 h-full bg-cyan-400 rounded-t-sm origin-bottom"></div>
      <div className="visualizer-bar w-1.5 h-full bg-cyan-500 rounded-t-sm origin-bottom"></div>
    </div>
  );
};