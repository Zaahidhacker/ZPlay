import React, { useState } from 'react';
import { PlayerState } from '../types';
import { Play, Pause, Plus, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, Shuffle, Repeat } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatTime } from '../lib/youtube';

interface PlayerBarProps {
  state: PlayerState;
  onPlayPause: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onClickExpand: () => void;
  onClickAddToPlaylist: () => void;
  className?: string;
}

export default function PlayerBar({ 
  state, 
  onPlayPause, 
  onSeek, 
  onVolumeChange, 
  onClickExpand,
  onClickAddToPlaylist,
  className 
}: PlayerBarProps) {
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);
  const [isHoveringVol, setIsHoveringVol] = useState(false);

  const progressPercent = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  const toggleMute = () => {
    onVolumeChange(state.volume === 0 ? 100 : 0);
  };

  if (!state.details) return null;

  return (
    <footer className={cn("h-[90px] w-full bg-black/40 backdrop-blur-2xl border-t border-white/5 px-4 flex items-center justify-between relative z-50", className)}>
      {/* Track Info */}
      <div className="flex items-center gap-4 w-[30%] min-w-[180px]">
        <div className="w-14 h-14 shrink-0 rounded shadow-lg overflow-hidden relative group cursor-pointer" onClick={onClickExpand}>
          <img src={state.details.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
             <Maximize2 className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="font-sans text-sm font-bold text-white truncate hover:underline cursor-pointer">
            {state.details.title}
          </div>
          <div className="font-sans text-[11px] text-[#B3B3B3] truncate hover:underline hover:text-white cursor-pointer mt-0.5">
            {state.details.author}
          </div>
        </div>
        <button
          onClick={onClickAddToPlaylist}
          className="ml-1 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors active:scale-[0.98]"
          aria-label="Add to playlist"
          title="Add to playlist"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center gap-2 flex-1 max-w-[40%] w-full">
        <div className="flex items-center gap-6 text-[#B3B3B3]">
          <button className="hover:text-white transition-colors">
            <Shuffle className="w-4 h-4" />
          </button>
          <button className="hover:text-white transition-colors">
            <SkipBack className="w-5 h-5 fill-current" />
          </button>
          
          <button 
            onClick={onPlayPause}
            className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            {state.isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-1" />
            )}
          </button>

          <button className="hover:text-white transition-colors">
            <SkipForward className="w-5 h-5 fill-current" />
          </button>
          <button className="hover:text-white transition-colors">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Playback Bar */}
        <div className="flex items-center gap-2 w-full px-4 text-[11px] text-[#B3B3B3] font-mono">
          <span className="w-8 text-right font-medium">{formatTime(state.currentTime)}</span>
          <div 
            className="flex-1 h-1 bg-[#4d4d4d] rounded-full relative group cursor-pointer"
            onMouseEnter={() => setIsHoveringSeek(true)}
            onMouseLeave={() => setIsHoveringSeek(false)}
          >
             <div 
               className={cn("absolute h-full rounded-full transition-colors", isHoveringSeek ? "bg-[#1db954]" : "bg-white")} 
               style={{ width: `${progressPercent}%` }}
             ></div>
             <div 
               className={cn("absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md transition-opacity duration-200", isHoveringSeek ? "opacity-100" : "opacity-0")} 
               style={{ left: `calc(${progressPercent}% - 6px)` }}
             ></div>
             <input 
               type="range" 
               min="0" 
               max={state.duration || 100} 
               value={state.currentTime} 
               onChange={handleSeekChange}
               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
          </div>
          <span className="w-8 text-left font-medium">{formatTime(state.duration)}</span>
        </div>
      </div>

      {/* Volume & Extras */}
      <div className="flex items-center justify-end gap-3 w-[30%] min-w-[150px]">
        <button onClick={toggleMute} className="text-[#b3b3b3] hover:text-white transition-colors">
          {state.volume === 0 ? <VolumeX className="w-[18px] h-[18px]" /> : <Volume2 className="w-[18px] h-[18px]" />}
        </button>
        <div 
          className="w-24 h-1 bg-[#4d4d4d] rounded-full relative group cursor-pointer"
          onMouseEnter={() => setIsHoveringVol(true)}
          onMouseLeave={() => setIsHoveringVol(false)}
        >
           <div 
             className={cn("absolute h-full rounded-full transition-colors", isHoveringVol ? "bg-[#1DB954]" : "bg-white")} 
             style={{ width: `${state.volume}%` }}
           ></div>
           {isHoveringVol && (
             <div 
               className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" 
               style={{ left: `calc(${state.volume}% - 6px)` }}
             ></div>
           )}
           <input 
             type="range" 
             min="0" 
             max="100" 
             value={state.volume} 
             onChange={handleVolumeChange}
             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
           />
        </div>
      </div>
    </footer>
  );
}
