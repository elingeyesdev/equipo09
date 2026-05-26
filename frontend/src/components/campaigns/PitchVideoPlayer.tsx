import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Play } from 'lucide-react';

/* ─────────────────────────────────────────────
   URL PARSING UTILS
───────────────────────────────────────────── */

type VideoProvider = 'youtube' | 'tiktok' | 'unknown';

interface ParsedVideo {
  provider: VideoProvider;
  embedUrl: string | null;
}

function parseVideoUrl(url: string): ParsedVideo {
  if (!url) return { provider: 'unknown', embedUrl: null };

  // YouTube standard: youtube.com/watch?v=ID
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytMatch[1]}&controls=0&modestbranding=1&rel=0&playsinline=1`,
    };
  }

  // YouTube Shorts: youtube.com/shorts/ID
  const ytShortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (ytShortsMatch) {
    return {
      provider: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytShortsMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${ytShortsMatch[1]}&controls=0&modestbranding=1&rel=0&playsinline=1`,
    };
  }

  // TikTok: tiktok.com/@user/video/ID
  const ttMatch = url.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
  if (ttMatch) {
    return {
      provider: 'tiktok',
      embedUrl: `https://www.tiktok.com/embed/v2/${ttMatch[1]}`,
    };
  }

  return { provider: 'unknown', embedUrl: null };
}

/* ─────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────── */

interface PitchVideoPlayerProps {
  videoUrl: string;
  isActive: boolean; // Controlled by parent via IntersectionObserver
}

export function PitchVideoPlayer({ videoUrl, isActive }: PitchVideoPlayerProps) {
  const [muted, setMuted] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { provider, embedUrl } = parseVideoUrl(videoUrl);

  // Build embed URL with current mute state
  const buildUrl = (base: string, isMuted: boolean) => {
    if (provider === 'youtube') {
      return base.replace(/&mute=\d/, `&mute=${isMuted ? 1 : 0}`);
    }
    return base;
  };

  // Lazy-load: only set iframe src when active; clear when inactive to save memory
  useEffect(() => {
    if (!iframeRef.current || !embedUrl) return;
    if (isActive) {
      setLoaded(true);
      iframeRef.current.src = buildUrl(embedUrl, muted);
    } else {
      // Small delay so scroll-snap settles before clearing
      const t = setTimeout(() => {
        if (iframeRef.current) iframeRef.current.src = '';
        setLoaded(false);
      }, 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, embedUrl]);

  // Reload iframe with updated mute when toggled while active
  useEffect(() => {
    if (!iframeRef.current || !embedUrl || !isActive) return;
    iframeRef.current.src = buildUrl(embedUrl, muted);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  if (!embedUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1c2b1e]">
        <div className="text-center text-white/40 px-6">
          <Play size={48} strokeWidth={1} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">URL de video no válida</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Loading shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c2b1e] to-black flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-emerald-400 animate-spin" />
        </div>
      )}

      {/* Video iframe */}
      <iframe
        ref={iframeRef}
        title="pitch-video"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 w-full h-full border-none"
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
        onLoad={() => setLoaded(true)}
      />

      {/* Mute / Unmute button */}
      <button
        onClick={(e) => { e.stopPropagation(); setMuted(m => !m); }}
        className="absolute bottom-6 right-5 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          border: '1.5px solid rgba(255,255,255,0.18)',
        }}
        title={muted ? 'Activar sonido' : 'Silenciar'}
      >
        {muted
          ? <VolumeX size={18} className="text-white" strokeWidth={2.5} />
          : <Volume2 size={18} className="text-emerald-300" strokeWidth={2.5} />
        }
      </button>

      {/* Provider badge */}
      <div
        className="absolute top-5 right-5 z-20 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white"
        style={{ background: 'rgba(0,0,0,0.50)', backdropFilter: 'blur(6px)' }}
      >
        {provider === 'youtube' ? '▶ YouTube' : provider === 'tiktok' ? '♪ TikTok' : ''}
      </div>
    </div>
  );
}
