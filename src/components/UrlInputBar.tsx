import React from 'react';
import { Link2 } from 'lucide-react';

type UrlInputBarProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onPasteUrl: (pasted: string) => void;
};

export default function UrlInputBar({ value, onChange, onSubmit, onPasteUrl }: UrlInputBarProps) {

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_20px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white/10 via-transparent to-white/10 opacity-40" />
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-white/80">
            <Link2 className="w-4 h-4" />
          </div>
          <input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={(e) => {
              const text = e.clipboardData.getData('text');
              if (text) onPasteUrl(text);
            }}
            placeholder="Paste a YouTube URL…"
            className="flex-1 bg-transparent text-white placeholder:text-white/40 outline-none font-semibold text-sm"
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#1DB954] text-black font-black text-xs px-4 py-3 hover:brightness-110 active:scale-[0.98] transition"
          >
            Load
          </button>
        </div>
      </div>
      <div className="text-[11px] text-white/40 font-semibold mt-2 px-1">
        Tip: works with `watch?v=`, `youtu.be/`, `shorts/`.
      </div>
    </form>
  );
}

