"use client";

import { useEffect, useState } from "react";

/** Types lines out char by char; shows everything at once under reduced motion. Change `key` to replay. */
export function TypeOut({ lines, cps = 60 }: { lines: string[]; cps?: number }) {
  const full = lines.join("\n");
  const [n, setN] = useState(0);

  useEffect(() => {
    const step = matchMedia("(prefers-reduced-motion: reduce)").matches ? full.length : 1;
    const id = setInterval(() => setN((i) => (i >= full.length ? (clearInterval(id), i) : i + step)), 1000 / cps);
    return () => clearInterval(id);
  }, [full, cps]);

  return (
    <p className="whitespace-pre-wrap" aria-label={full}>
      <span aria-hidden>{full.slice(0, n)}</span>
      <span aria-hidden className="cursor" />
    </p>
  );
}
