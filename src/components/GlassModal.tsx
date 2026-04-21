import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '../lib/utils';

gsap.registerPlugin(useGSAP);

type GlassModalProps = {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
};

export default function GlassModal({ isOpen, title, onClose, children, className }: GlassModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!isOpen) return;
      gsap.set([overlayRef.current, panelRef.current], { force3D: true });
      gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'power1.out' });
      gsap.fromTo(
        panelRef.current,
        { y: 16, opacity: 0, scale: 0.98 },
        { y: 0, opacity: 1, scale: 1, duration: 0.22, ease: 'power2.out', clearProps: 'transform' }
      );
    },
    { dependencies: [isOpen] }
  );

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-3"
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        ref={panelRef}
        className={cn(
          'w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-2xl shadow-black/60',
          className
        )}
      >
        <div className="px-5 pt-5 pb-3">
          <div className="text-white font-black tracking-tight text-lg">{title}</div>
          <div className="h-px bg-white/10 mt-3" />
        </div>
        <div className="px-5 pb-5">{children}</div>
      </div>
    </div>
  );
}

