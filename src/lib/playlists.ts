import type { PlaylistsMap, PlaylistItem } from '../types';

const STORAGE_KEY = 'yt-spotify:playlists:v1';

export function loadPlaylists(): PlaylistsMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { playlists: {} };
    const parsed = JSON.parse(raw) as PlaylistsMap;
    if (!parsed || typeof parsed !== 'object' || !parsed.playlists || typeof parsed.playlists !== 'object') {
      return { playlists: {} };
    }
    return parsed;
  } catch {
    return { playlists: {} };
  }
}

export function savePlaylists(data: PlaylistsMap) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function ensurePlaylist(data: PlaylistsMap, name: string): PlaylistsMap {
  const trimmed = name.trim();
  if (!trimmed) return data;
  if (data.playlists[trimmed]) return data;
  return { playlists: { ...data.playlists, [trimmed]: [] } };
}

export function addToPlaylist(data: PlaylistsMap, playlistName: string, item: PlaylistItem): PlaylistsMap {
  const list = data.playlists[playlistName] ?? [];
  // De-dupe by video id within a playlist (keeps first entry)
  if (list.some((x) => x.id === item.id)) return data;
  return { playlists: { ...data.playlists, [playlistName]: [item, ...list] } };
}

