"use client";

import { useEffect, useRef, useState } from "react";
import { useCopy } from "@/components/i18n/useCopy";

export function HomeFilm({
  src = "/home-intro.mp4",
  poster = "/home-intro.jpg",
  label,
}: {
  src?: string;
  poster?: string;
  label?: string;
}) {
  const copy = useCopy();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!video || media.matches) return;
    video.muted = true;
    void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  function togglePlay() {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      return;
    }
    video.pause();
    setPlaying(false);
  }

  function toggleSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    if (video.paused) void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  const control =
    "rounded-full px-4 py-2 text-sm leading-none font-bold active:scale-[0.97] active:transition-none";

  return (
    <figure className="space-y-2">
      <video
        ref={videoRef}
        className="aspect-video w-full bg-[#ede8d0]"
        poster={poster}
        src={src}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={label || copy.home.title}
      />
      <div className="flex justify-end gap-2">
        <button type="button" className={`${control} bg-[var(--brand)] text-[var(--on-brand)]`} onClick={togglePlay}>
          {playing ? copy.film.pause : copy.film.play}
        </button>
        <button type="button" className={`${control} bg-[var(--gold)] text-[#1a1406]`} onClick={toggleSound}>
          {muted ? copy.film.sound : copy.film.quiet}
        </button>
      </div>
    </figure>
  );
}
