import React from 'react';
import { Music } from 'lucide-react';
import type { PlayerState, PlaylistItem } from '../types';
import UrlInputBar from './UrlInputBar';
import PlaylistView from './PlaylistView';

type MainViewProps = {
  view: 'home' | 'playlist';
  urlInput: string;
  setUrlInput: (val: string) => void;
  onSubmitUrl: () => void;
  onPasteUrl: (pasted: string) => void;
  state: PlayerState;
  playlistName: string | null;
  playlistItems: PlaylistItem[];
  onPlayPlaylistItem: (item: PlaylistItem) => void;
};

export default function MainView({
  view,
  urlInput,
  setUrlInput,
  onSubmitUrl,
  onPasteUrl,
  state,
  playlistName,
  playlistItems,
  onPlayPlaylistItem,
}: MainViewProps) {

  return (
    <main className="flex-1 bg-gradient-to-b from-[#0f0f0f] to-[#121212] p-5 md:p-8 flex flex-col gap-6 relative overflow-y-auto">
      <div className="flex flex-col gap-6">
        {view === 'home' && (
          <>
            <UrlInputBar value={urlInput} onChange={setUrlInput} onSubmit={onSubmitUrl} onPasteUrl={onPasteUrl} />

            {state.details ? (
              <div className="flex flex-col items-center justify-center flex-1 gap-6 mt-2">
                <div className="w-full max-w-[420px] aspect-square rounded-2xl shadow-[0_35px_80px_-25px_rgba(0,0,0,0.9)] overflow-hidden bg-[#0b0b0b] relative group border border-white/10">
                  <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div
                      className="absolute inset-0 opacity-60 bg-cover bg-center filter blur-2xl scale-110"
                      style={{ backgroundImage: `url('${state.details.thumbnailUrl}')` }}
                    />
                    <div className="z-10 w-[82%] h-[82%] shadow-2xl overflow-hidden rounded-xl border border-white/10 relative bg-black/40">
                      <img src={state.details.thumbnailUrl} alt={state.details.title} className="w-full h-full object-cover" />
                      {!state.hasStarted && (
                        <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                          <div className="w-12 h-12 border-4 border-[#1DB954] border-t-white rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-20">
                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight line-clamp-2">
                      {state.details.title}
                    </h2>
                    <p className="text-[#B3B3B3] font-bold text-base md:text-lg line-clamp-1 mt-1">{state.details.author}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10">
                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl backdrop-blur-md">
                  <Music className="w-10 h-10 text-[#B3B3B3]" />
                </div>
                <h2 className="text-2xl font-black font-sans mb-2 tracking-tight text-white">URL-to-Playlist Player</h2>
                <p className="text-[#B3B3B3] max-w-sm font-semibold">
                  Paste a YouTube URL to load a track, then save it into playlists from the player bar.
                </p>
              </div>
            )}
          </>
        )}

        {view === 'playlist' && playlistName && (
          <PlaylistView name={playlistName} items={playlistItems} onPlayItem={onPlayPlaylistItem} />
        )}
      </div>
    </main>
  );
}
