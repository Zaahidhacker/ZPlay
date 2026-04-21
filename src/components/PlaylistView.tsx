import React, { useMemo, useRef } from 'react';
import { ListMusic, Play } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { PlaylistItem } from '../types';

gsap.registerPlugin(useGSAP);

type PlaylistViewProps = {
  name: string;
  items: PlaylistItem[];
  onPlayItem: (item: PlaylistItem) => void;
};

export default function PlaylistView({ name, items, onPlayItem }: PlaylistViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sorted = useMemo(() => items, [items]);

  useGSAP(
    () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, x: 12, force3D: true },
        { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out', clearProps: 'all', force3D: true }
      );
      gsap.fromTo(
        '.playlist-row',
        { opacity: 0, y: 10, force3D: true },
        { opacity: 1, y: 0, duration: 0.25, stagger: 0.03, ease: 'power2.out', clearProps: 'transform', force3D: true }
      );
    },
    { scope: containerRef, dependencies: [name, sorted.length] }
  );

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <ListMusic className="w-5 h-5 text-[#1DB954]" />
        </div>
        <div className="min-w-0">
          <div className="text-white font-black tracking-tight text-2xl truncate">{name}</div>
          <div className="text-white/50 text-sm font-semibold">{items.length} saved</div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-white/60 font-semibold">
          This playlist is empty. Add the current track with the “+” button.
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
          {items.map((item) => (
            <button
              key={`${item.id}-${item.url}`}
              className="playlist-row w-full flex items-center gap-4 px-4 py-3 hover:bg-white/5 transition-colors text-left"
              onClick={() => onPlayItem(item)}
            >
              <img
                src={`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`}
                alt=""
                className="w-12 h-12 rounded-xl object-cover border border-white/10"
                loading="lazy"
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold truncate">{item.title}</div>
                <div className="text-white/40 text-xs font-semibold truncate">{item.url}</div>
              </div>
              <div className="w-9 h-9 rounded-xl bg-[#1DB954] text-black flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 ml-0.5 fill-current" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

