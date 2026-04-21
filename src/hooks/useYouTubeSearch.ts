import { useState, useCallback } from 'react';
import { YouTubeSearchResult } from '../types';

export function useYouTubeSearch() {
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');

  const search = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError(null);
    setCurrentQuery(query);
    setResults([]);

    try {
      const apiKey = (import.meta as any).env.VITE_YOUTUBE_API_KEY;
      if (!apiKey || apiKey === "YOUR_YOUTUBE_API_KEY_HERE") {
        throw new Error("Missing or invalid YouTube API Key. Add it to VITE_YOUTUBE_API_KEY in your env.");
      }
      
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${encodeURIComponent(query)}&type=video&key=${apiKey}`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error.message);
      
      setResults(data.items || []);
      setNextPageToken(data.nextPageToken || null);
    } catch (err: any) {
      setError(err.message || 'Something went wrong fetching from YouTube');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!currentQuery || !nextPageToken || isLoading) return;
    setIsLoading(true);
    try {
      const apiKey = (import.meta as any).env.VITE_YOUTUBE_API_KEY;
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&pageToken=${nextPageToken}&q=${encodeURIComponent(currentQuery)}&type=video&key=${apiKey}`);
      const data = await res.json();
      
      if (data.error) throw new Error(data.error.message);
      
      setResults(prev => [...prev, ...(data.items || [])]);
      setNextPageToken(data.nextPageToken || null);
    } catch (err: any) {
      setError(err.message || 'Error fetching more results');
    } finally {
      setIsLoading(false);
    }
  }, [currentQuery, nextPageToken, isLoading]);

  return { results, isLoading, error, search, loadMore, hasMore: !!nextPageToken };
}
