import React, { useState } from 'react';
import { PlayerState } from '../types';
import { ChevronDown, Play, Pause, SkipBack, SkipForward, MoreHorizontal, Share2 } from 'lucide-react';
import { formatTime } from '../lib/youtube';
import { cn } from '../lib/utils';

interface MobilePlayerProps {
  isOpen: boolean;
  onClose: () => void;
  state: PlayerState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
}

export default function MobilePlayer({ isOpen, onClose, state, onPlayPause, onSeek }: MobilePlayerProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  if (!state.details) return null;

  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  return (
    <div
      className={cn(
        'fixed inset-0 z-[70] bg-black flex flex-col pt-12 pb-8 px-6 md:hidden',
        isOpen ? 'pointer-events-auto' : 'pointer-events-none'
      )}
      style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)', opacity: isOpen ? 1 : 0, transition: 'transform 0.28s ease-out, opacity 0.28s ease-out' }}
      aria-hidden={!isOpen}
    >
          {/* Header */}
          <div className="flex items-center justify-between mb-8 shrink-0">
            <button onClick={onClose} className="p-2 -ml-2 text-white/70 hover:text-white">
              <ChevronDown className="w-8 h-8" />
            </button>
            <div className="text-xs font-semibold tracking-widest uppercase text-white/70">
              Now Playing
            </div>
            <button className="p-2 -mr-2 text-white/70 hover:text-white">
              <MoreHorizontal className="w-6 h-6" />
            </button>
          </div>

          {/* Album Art / Thumbnail */}
          <div className="flex-1 flex flex-col justify-center max-h-[50vh] min-h-0 mb-8">
            <div className="w-full aspect-square relative rounded-lg overflow-hidden shadow-2xl shadow-black/80 max-w-sm mx-auto">
              <img 
                src={state.details.thumbnailUrl} 
                alt="Thumbnail" 
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Info & Controls section */}
          <div className="shrink-0 flex flex-col gap-6 max-w-sm mx-auto w-full">
            {/* Title & Artist */}
            <div className="flex justify-between items-end gap-4">
              <div className="min-w-0 flex-1">
                <h2 className="text-2xl font-bold font-sans text-white truncate mb-1">
                  {state.details.title}
                </h2>
                <h3 className="text-lg text-white/70 truncate">
                  {state.details.author}
                </h3>
              </div>
            </div>

            {/* Scrubber */}
            <div className="flex flex-col gap-2">
              <div 
                className="w-full h-1.5 bg-[#4d4d4d] rounded-full relative group cursor-pointer"
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                onPointerCancel={() => setIsDragging(false)}
              >
                <div 
                  className={cn("h-full rounded-full transition-colors", isDragging ? "bg-[#1db954]" : "bg-white")}
                  style={{ width: `${progressPercent}%` }}
                ></div>
                <div 
                  className={cn("absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow transition-opacity", 
                  isDragging ? "opacity-100" : "opacity-0")}
                  style={{ left: `calc(${progressPercent}% - 6px)` }}
                />
                <input 
                  type="range"
                  min="0"
                  max={state.duration || 100}
                  value={state.currentTime}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-white/50">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between max-w-[280px] mx-auto w-full">
               <button className="text-white/70 hover:text-white transition-colors">
                  <Share2 className="w-5 h-5" />
               </button>
               
               <div className="flex items-center gap-6">
                 <button className="text-white/90 hover:text-white transition-colors">
                   <SkipBack className="w-8 h-8 fill-current" />
                 </button>
                 
                 <button 
                  onClick={onPlayPause}
                  className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                 >
                   {state.isPlaying ? (
                     <Pause className="w-8 h-8 fill-current" />
                   ) : (
                     <Play className="w-8 h-8 fill-current ml-1" />
                   )}
                 </button>
                 
                 <button className="text-white/90 hover:text-white transition-colors">
                   <SkipForward className="w-8 h-8 fill-current" />
                 </button>
               </div>
               
               <button className="text-white/70 hover:text-white transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
               </button>
            </div>
          </div>
    </div>
  );
}
