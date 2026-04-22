import React, { useMemo } from 'react';
import { Home, Library, ListMusic, Music, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

type SidebarProps = {
  className?: string;
  view: 'home' | 'library';
  onNavigate: (view: 'home' | 'library') => void;
  playlists: { [playlistName: string]: { id: string; title: string; url: string }[] };
  activePlaylistName: string | null;
  onSelectPlaylist: (name: string) => void;
  onCreatePlaylist: () => void;
  pulseRef?: React.RefObject<HTMLDivElement | null>;
};

export default function Sidebar({
  className,
  view,
  onNavigate,
  playlists,
  activePlaylistName,
  onSelectPlaylist,
  onCreatePlaylist,
  pulseRef,
}: SidebarProps) {
  const names = useMemo(() => Object.keys(playlists).sort((a, b) => a.localeCompare(b)), [playlists]);

  return (
    <aside className={cn('p-6 flex flex-col gap-6 border-r border-white/5 bg-[#0b0b0b]', className)}>
      <div className="flex items-center gap-2 mb-2 shrink-0">
        <div ref={pulseRef} className="w-9 h-9 rounded-xl bg-[#121212] border border-white/10 flex items-center justify-center">
          <Music className="w-5 h-5 text-[#1DB954]" />
        </div>
        <div className="min-w-0">
          <div className="font-black tracking-tight text-white leading-none">YT Spotify</div>
          <div className="text-[11px] text-white/50 font-semibold tracking-wide">URL → Playlists</div>
        </div>
      </div>

      <nav className="flex flex-col gap-2 text-[#B3B3B3] font-bold shrink-0">
        <button
          onClick={() => onNavigate('home')}
          className={cn(
            'flex items-center gap-4 px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors text-left',
            view === 'home' && 'text-white bg-white/5'
          )}
        >
          <Home className="w-5 h-5" />
          Home
        </button>
        <button
          onClick={() => onNavigate('library')}
          className={cn(
            'flex items-center gap-4 px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors text-left',
            view === 'library' && 'text-white bg-white/5'
          )}
        >
          <Library className="w-5 h-5" />
          Library
        </button>
      </nav>

      <div className="mt-2 flex flex-col gap-3 flex-1 min-h-0">
        <div className="flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-[#B3B3B3] uppercase tracking-widest flex items-center gap-2">
            <ListMusic className="w-4 h-4" />
            Playlists
          </div>
          <button
            onClick={onCreatePlaylist}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 hover:text-white transition-colors"
            aria-label="Create new playlist"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-1 text-[#B3B3B3] text-sm font-medium overflow-y-auto pb-4 scrollbar-hide">
          {names.length === 0 ? (
            <div className="text-white/40 text-sm font-semibold px-3 py-3 rounded-xl border border-white/5 bg-white/0">
              No playlists yet.
            </div>
          ) : (
            names.map((name) => (
              <button
                key={name}
                onClick={() => onSelectPlaylist(name)}
                className={cn(
                  'text-left truncate px-3 py-2 rounded-xl hover:text-white hover:bg-white/5 transition-colors',
                  activePlaylistName === name && 'text-white bg-white/5'
                )}
                title={name}
              >
                {name}
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
