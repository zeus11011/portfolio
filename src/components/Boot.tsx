"use client";

import { useEffect, useState } from "react";
import skills from "@/data/skills.json";
import { relay } from "@/lib/sound";

const LINES = [
  "GUEST-BIOS v2.6  (C) 2026 Anish Naik",
  "",
  "Memory test: 65536K OK",
  "Detecting drives... /dev/portfolio",
  "",
  "Booting guestOS...",
  ...skills.map((s) => `[ OK ] Loaded ${s.name}.ko`),
  "[ OK ] Reached target desktop.",
];

/** Shown once per session; hidden by CSS once html[data-booted] is set (see layout.tsx). */
export function Boot() {
  const [n, setN] = useState(0);

  useEffect(() => {
    const html = document.documentElement;
    if (html.dataset.booted) return;
    let i = 0;
    const id = setInterval(() => {
      setN(++i);
      if (i > LINES.length + 4) done();
    }, 110);
    const skip = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      done();
    };
    addEventListener("keydown", skip, true);
    addEventListener("pointerdown", skip, true);
    function cleanup() {
      clearInterval(id);
      removeEventListener("keydown", skip, true);
      removeEventListener("pointerdown", skip, true);
    }
    function done() {
      cleanup();
      html.dataset.booted = "1";
      try {
        sessionStorage.setItem("booted", "1");
      } catch {}
      relay();
    }
    return cleanup;
  }, []);

  return (
    <div className="boot fixed inset-0 z-40 bg-background p-8 text-2xl whitespace-pre-wrap">
      {LINES.slice(0, n).join("\n")}
      <span className="cursor" />
      <p className="absolute bottom-8 text-dim">press any key to skip</p>
    </div>
  );
}
