export interface VideoDetails {
  videoId: string;
  title: string;
  author: string;
  thumbnailUrl: string;
}

export interface PlayerState {
  videoId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  details: VideoDetails | null;
  hasStarted: boolean;
}

export type PlaylistItem = {
  id: string;
  title: string;
  url: string;
};

export type PlaylistsMap = {
  playlists: { [playlistName: string]: PlaylistItem[] };
};

export interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      high: { url: string };
      medium: { url: string };
    };
  };
}
