"use client";

import { useEffect, useRef, useState } from "react";
import data from "@/data/subtitles.json";
import { asset } from "@/lib/fs";

type Caption = { start: number; end: number; text: string; translation?: string };
const captions: Caption[] = data.captions;
const END = captions[captions.length - 1].end + 1;

/** Replays a recorded caption track, synced to `media` if set, else to a clock. */
export default function SubtitlesDemo() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing || data.media) return;
    const t0 = performance.now() - t * 1000;
    const id = setInterval(() => {
      const now = (performance.now() - t0) / 1000;
      setT(Math.min(now, END));
      if (now >= END) setPlaying(false);
    }, 50);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- t is only the resume point
  }, [playing]);

  const cap = captions.find((c) => t >= c.start && t < c.end);
  // reveal words as they're "heard", like the live overlay
  const words = cap?.text.split(" ") ?? [];
  const shown = cap ? words.slice(0, Math.ceil(((t - cap.start) / (cap.end - cap.start)) * words.length * 1.5)).join(" ") : "";

  function toggle() {
    if (video.current) return void (video.current.paused ? video.current.play() : video.current.pause());
    if (t >= END) setT(0);
    setPlaying(!playing);
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-dim">audio → whisper → nllb → overlay{data.sample && "  (sample data)"}</p>
      <div className="relative flex aspect-video items-end justify-center border border-dim bg-black">
        {data.media ? (
          <video
            ref={video}
            src={asset(data.media)}
            onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <span aria-hidden className="absolute inset-0 grid place-items-center text-6xl text-dim">
            {playing ? "♪ ♫ ♪" : "▶"}
          </span>
        )}
        <p aria-live="polite" className="relative mb-4 min-h-[2lh] max-w-[90%] bg-black/80 px-2 text-center">
          {shown}
          {cap?.translation && <span className="block text-dim">{cap.translation}</span>}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={toggle} className="border border-foreground px-2 hover:bg-foreground hover:text-background">
          {playing ? "[ pause ]" : "[ play ]"}
        </button>
        <progress value={t} max={END} className="h-2 flex-1 accent-[var(--foreground)]" aria-label="Playback" />
        <span className="text-dim">
          {t.toFixed(1)}s / {END.toFixed(1)}s
        </span>
      </div>
    </div>
  );
}
