// Utility to extract video ID from various YouTube URL formats
export function extractYouTubeId(url: string): string | null {
  const input = (url || '').trim();
  if (!input) return null;

  // Supports:
  // - https://youtu.be/VIDEOID
  // - https://www.youtube.com/watch?v=VIDEOID
  // - https://www.youtube.com/shorts/VIDEOID
  // - https://www.youtube.com/embed/VIDEOID
  // - https://music.youtube.com/watch?v=VIDEOID
  const regExp =
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = input.match(regExp);
  return match?.[1] ?? null;
}

export function formatTime(seconds: number): string {
  if (isNaN(seconds)) return "0:00";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}
