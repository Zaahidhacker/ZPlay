import React, { useEffect, useRef, useState } from 'react';
import YouTube, { YouTubeEvent } from 'react-youtube';
import { Home, Library, Play, Pause } from 'lucide-react';
import { extractYouTubeId } from './lib/youtube';
import type { PlayerState, PlaylistItem, PlaylistsMap, VideoDetails } from './types';
import Sidebar from './components/Sidebar';
import MainView from './components/MainView';
import PlayerBar from './components/PlayerBar';
import MobilePlayer from './components/MobilePlayer';
import GlassModal from './components/GlassModal';
import { addToPlaylist, ensurePlaylist, loadPlaylists, savePlaylists } from './lib/playlists';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export default function App() {
  const [urlInput, setUrlInput] = useState('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [playerMap, setPlayerMap] = useState<any>(null);

  const [state, setState] = useState<PlayerState>({
    videoId: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 100,
    details: null,
    hasStarted: false,
  });

  const [isMobilePlayerOpen, setIsMobilePlayerOpen] = useState(false);
  const [view, setView] = useState<'home' | 'library' | 'playlist'>('home');
  const [activePlaylistName, setActivePlaylistName] = useState<string | null>(null);

  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const [playlistsData, setPlaylistsData] = useState<PlaylistsMap>(() => ({ playlists: {} }));
  const playlistPulseRef = useRef<HTMLDivElement>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPlaylistsData(loadPlaylists());
  }, []);

  useEffect(() => {
    savePlaylists(playlistsData);
  }, [playlistsData]);

  useGSAP(() => {
    gsap.defaults({ force3D: true });
  }, []);

  const handlePlayPause = () => {
    if (!playerMap) return;
    if (state.isPlaying) playerMap.pauseVideo();
    else playerMap.playVideo();
  };

  const playVideoFromDetails = (details: VideoDetails, url?: string) => {
    if (url) setCurrentUrl(url);
    setState((prev) => ({
      ...prev,
      videoId: details.videoId,
      hasStarted: false,
      currentTime: 0,
      isPlaying: false,
      details,
    }));
  };

  const loadVideoFromUrl = (inputUrl: string) => {
    const cleaned = (inputUrl || '').trim();
    const id = extractYouTubeId(cleaned);
    if (!id) return;
    playVideoFromDetails(
      {
        videoId: id,
        title: 'Loading...',
        author: '',
        thumbnailUrl: `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
      },
      cleaned
    );
  };

  const onSubmitUrl = () => loadVideoFromUrl(urlInput);

  const onPasteUrl = (pasted: string) => {
    setUrlInput(pasted);
    loadVideoFromUrl(pasted);
  };

  const handleSeek = (newTime: number) => {
    if (!playerMap) return;
    playerMap.seekTo(newTime, true);
    setState((prev) => ({ ...prev, currentTime: newTime }));
  };

  const handleVolumeChange = (newVolume: number) => {
    if (!playerMap) return;
    playerMap.setVolume(newVolume);
    setState((prev) => ({ ...prev, volume: newVolume }));
  };

  const startTimer = (playerTarget: any) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (playerTarget?.getCurrentTime) {
        setState((prev) => ({ ...prev, currentTime: playerTarget.getCurrentTime() || 0 }));
      }
    }, 1000);
  };

  const stopTimer = () => {
    if (!timerRef.current) return;
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const onReady = (event: YouTubeEvent) => {
    setPlayerMap(event.target);
    event.target.setVolume(state.volume);
    if (state.videoId) event.target.playVideo();
  };

  const fetchDetails = (target: any) => {
    const data = target?.getVideoData?.();
    if (!data?.title || !state.videoId) return;
    const details: VideoDetails = {
      videoId: state.videoId,
      title: data.title,
      author: data.author,
      thumbnailUrl: `https://img.youtube.com/vi/${state.videoId}/maxresdefault.jpg`,
    };
    setState((prev) => ({
      ...prev,
      details,
      duration: target.getDuration?.() || prev.duration,
    }));
  };

  const onStateChange = (event: YouTubeEvent) => {
    const playerState = event.data;
    fetchDetails(event.target);
    if (playerState === 1) {
      setState((prev) => ({ ...prev, isPlaying: true, hasStarted: true, duration: event.target.getDuration() }));
      startTimer(event.target);
    } else {
      setState((prev) => ({ ...prev, isPlaying: false }));
      stopTimer();
    }
  };

  // Media Session API (lock screen now playing + controls)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !state.details) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: state.details.title,
      artist: state.details.author,
      artwork: [{ src: state.details.thumbnailUrl, sizes: '1280x720', type: 'image/jpeg' }],
    });
    navigator.mediaSession.setActionHandler('play', () => playerMap?.playVideo());
    navigator.mediaSession.setActionHandler('pause', () => playerMap?.pauseVideo());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) playerMap?.seekTo(details.seekTime, true);
    });
  }, [state.details, playerMap]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    (navigator.mediaSession as any).playbackState = state.isPlaying ? 'playing' : 'paused';
  }, [state.isPlaying]);

  const pulsePlaylistIcon = () => {
    if (!playlistPulseRef.current) return;
    gsap.killTweensOf(playlistPulseRef.current);
    gsap.fromTo(
      playlistPulseRef.current,
      { boxShadow: '0 0 0px rgba(29,185,84,0)', scale: 1, force3D: true },
      {
        boxShadow: '0 0 22px rgba(29,185,84,0.55)',
        scale: 1.04,
        duration: 0.18,
        ease: 'power2.out',
        yoyo: true,
        repeat: 1,
        force3D: true,
      }
    );
  };

  const openAddToPlaylist = () => {
    if (!state.details || !currentUrl) return;
    setIsAddToPlaylistOpen(true);
  };

  const createPlaylist = () => {
    const name = newPlaylistName.trim();
    if (!name) return;
    setPlaylistsData((prev) => ensurePlaylist(prev, name));
    setNewPlaylistName('');
    setIsCreatePlaylistOpen(false);
    setView('library');
  };

  const saveNowPlayingToPlaylist = (playlistName: string) => {
    if (!state.details || !currentUrl) return;
    const item: PlaylistItem = { id: state.details.videoId, title: state.details.title, url: currentUrl };
    setPlaylistsData((prev) => addToPlaylist(prev, playlistName, item));
    setIsAddToPlaylistOpen(false);
    pulsePlaylistIcon();
  };

  const onNavigate = (next: 'home' | 'library') => {
    setView(next);
    if (next === 'home') setActivePlaylistName(null);
  };

  const onSelectPlaylist = (name: string) => {
    setActivePlaylistName(name);
    setView('playlist');
  };

  const playlistItems = activePlaylistName ? playlistsData.playlists[activePlaylistName] ?? [] : [];

  const onPlayPlaylistItem = (item: PlaylistItem) => {
    setUrlInput(item.url);
    playVideoFromDetails(
      {
        videoId: item.id,
        title: item.title,
        author: state.details?.author ?? '',
        thumbnailUrl: `https://img.youtube.com/vi/${item.id}/hqdefault.jpg`,
      },
      item.url
    );
    setView('home');
  };

  return (
    <div className="h-screen w-screen bg-[#000000] text-[#FFFFFF] font-sans flex flex-col overflow-hidden">
      <div className="absolute top-[-9999px] left-[-9999px] invisible pointer-events-none">
        {state.videoId && (
          <YouTube
            videoId={state.videoId}
            opts={{
              height: '0',
              width: '0',
              playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0 },
            }}
            onReady={onReady}
            onStateChange={onStateChange}
          />
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          className="hidden md:flex w-[260px] flex-col"
          view={view === 'playlist' ? 'library' : view}
          onNavigate={onNavigate}
          playlists={playlistsData.playlists}
          activePlaylistName={activePlaylistName}
          onSelectPlaylist={onSelectPlaylist}
          onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
          pulseRef={playlistPulseRef}
        />

        <MainView
          view={view === 'playlist' ? 'playlist' : 'home'}
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          onSubmitUrl={onSubmitUrl}
          onPasteUrl={onPasteUrl}
          state={state}
          playlistName={activePlaylistName}
          playlistItems={playlistItems}
          onPlayPlaylistItem={onPlayPlaylistItem}
        />
      </div>

      {state.details && (
        <>
          <PlayerBar
            state={state}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onClickExpand={() => setIsMobilePlayerOpen(true)}
            onClickAddToPlaylist={openAddToPlaylist}
            className="hidden md:flex"
          />

          <div
            className="md:hidden sticky py-2 px-3 mx-2 mb-2 rounded-2xl bg-black/80 backdrop-blur-md flex items-center gap-3 cursor-pointer border border-white/10"
            onClick={() => setIsMobilePlayerOpen(true)}
          >
            <img src={state.details.thumbnailUrl} alt="thumbnail" className="w-10 h-10 rounded-xl shadow-sm object-cover" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate hover:underline">{state.details.title}</div>
              <div className="text-[11px] text-[#B3B3B3] truncate hover:underline mt-0.5">{state.details.author}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="p-3 focus:outline-none text-white hover:scale-105 transition-transform"
            >
              {state.isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
          </div>

          <MobilePlayer
            isOpen={isMobilePlayerOpen}
            onClose={() => setIsMobilePlayerOpen(false)}
            state={state}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
          />
        </>
      )}

      <div className="md:hidden sticky bottom-0 z-[60] px-2 pb-2">
        <div className="rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 flex items-center justify-around py-2">
          <button
            onClick={() => onNavigate('home')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-bold text-xs ${
              view !== 'playlist' && view !== 'library' ? 'text-white' : 'text-white/50'
            }`}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button
            onClick={() => onNavigate('library')}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-bold text-xs ${
              view === 'library' || view === 'playlist' ? 'text-white' : 'text-white/50'
            }`}
          >
            <Library className="w-5 h-5" />
            Library
          </button>
        </div>
      </div>

      <GlassModal isOpen={isCreatePlaylistOpen} title="Create New Playlist" onClose={() => setIsCreatePlaylistOpen(false)}>
        <div className="flex flex-col gap-4">
          <input
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            placeholder="Playlist name"
            className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 text-white font-semibold outline-none focus:ring-2 focus:ring-white/10"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setIsCreatePlaylistOpen(false)}
              className="px-4 py-2 rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/5 transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              onClick={createPlaylist}
              className="px-4 py-2 rounded-xl bg-[#1DB954] text-black font-black hover:brightness-110 active:scale-[0.98] transition"
            >
              Create
            </button>
          </div>
        </div>
      </GlassModal>

      <GlassModal isOpen={isAddToPlaylistOpen} title="Save to Playlist" onClose={() => setIsAddToPlaylistOpen(false)}>
        <div className="flex flex-col gap-3">
          {Object.keys(playlistsData.playlists).length === 0 ? (
            <div className="text-white/70 font-semibold">
              You don’t have any playlists yet. Create one from the Library sidebar.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {Object.keys(playlistsData.playlists)
                .sort((a, b) => a.localeCompare(b))
                .map((name) => (
                  <button
                    key={name}
                    onClick={() => saveNowPlayingToPlaylist(name)}
                    className="w-full text-left px-4 py-3 rounded-xl bg-black/20 hover:bg-black/30 border border-white/10 text-white font-bold transition-colors"
                  >
                    {name}
                  </button>
                ))}
            </div>
          )}
        </div>
      </GlassModal>
    </div>
  );
}
