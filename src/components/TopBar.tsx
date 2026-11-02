"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useLayout } from "@/lib/layout";
import { syncHum } from "@/lib/sound";
import { TrayToggle } from "./TrayToggle";

// Clock ticks every 10s; the string snapshot only changes when the minute does.
const tick = (cb: () => void) => {
  const t = setInterval(cb, 10_000);
  return () => clearInterval(t);
};
// Ubuntu-style "Nov 2 14:05"
const now = () => {
  const d = new Date();
  return `${d.toLocaleString([], { month: "short", day: "numeric" })} ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hourCycle: "h23" })}`;
};

const item = "block w-full px-3 text-left whitespace-nowrap hover:bg-foreground hover:text-background";
const menu =
  "absolute top-full z-10 flex flex-col border border-foreground bg-background py-1 text-foreground [text-shadow:var(--glow)]";
const summary =
  "list-none px-3 hover:bg-background hover:text-foreground group-open:bg-background group-open:text-foreground [&::-webkit-details-marker]:hidden";

/** Ubuntu-style top bar: Activities (every desktop app) on the left, clock in the middle, system menu on the right. */
export function TopBar() {
  const { nodes, open, reset } = useLayout();
  const apps = nodes.filter((n) => n.type === "icon");
  const clock = useSyncExternalStore(tick, now, () => "");
  const bar = useRef<HTMLElement>(null);

  // click outside or Escape closes an open menu
  useEffect(() => {
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : true)
        bar.current
          ?.querySelectorAll("details[open]")
          .forEach((d) => !d.contains(e.target as Node) && d.removeAttribute("open"));
    };
    addEventListener("pointerdown", close);
    addEventListener("keydown", close);
    return () => (removeEventListener("pointerdown", close), removeEventListener("keydown", close));
  }, []);
  const shut = (e: React.MouseEvent) => e.currentTarget.closest("details")?.removeAttribute("open");

  return (
    <header
      ref={bar}
      className="relative z-10 grid h-8 shrink-0 grid-cols-[1fr_auto_1fr] items-center bg-foreground text-xl text-background [text-shadow:none] shadow-[var(--glow)] max-md:text-2xl"
    >
      <details className="group relative justify-self-start">
        <summary className={summary}>Activities</summary>
        <nav className={`${menu} left-0`}>
          {apps.map((n) => (
            <button key={n.id} className={item} onClick={(e) => (open(n.data.path as string), shut(e))}>
              {n.data.glyph ? `${n.data.glyph as string} ` : ""}
              {n.data.label as string}
            </button>
          ))}
        </nav>
      </details>
      <time className="justify-self-center whitespace-nowrap">{clock}</time>
      <details className="group relative justify-self-end">
        <summary className={summary} aria-label="system menu">
          [=] ▾
        </summary>
        <div className={`${menu} right-0`}>
          <TrayToggle name="crt" defaultOn={false} className={item} />
          <TrayToggle name="sound" defaultOn={false} onChange={syncHum} className={item} />
          <button className={item} onClick={(e) => (reset(), shut(e))}>
            reset layout
          </button>
        </div>
      </details>
    </header>
  );
}
