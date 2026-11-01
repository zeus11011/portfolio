"use client";

import { useEffect, useRef, useState } from "react";
import run from "@/data/agent-run.json";
import { asset } from "@/lib/fs";

// Shape of browser_auto's ExecutionReport (reports/report.json), plus optional screenshots.
type Step = { name: string; step_type: string; status: string; started_at: string; duration_ms: number | null; error: string | null; retries: number; screenshot?: string };
type Heal = { step_name: string; original_selector: string; healed_selector: string; strategy: string; confidence: number };
type Line = { text: string; tone?: "pass" | "fail" | "dim"; img?: string };

const t0 = Date.parse(run.started_at);
const stamp = (iso: string) => {
  const ms = Date.parse(iso) - t0;
  return `[${String(Math.floor(ms / 60000)).padStart(2, "0")}:${((ms % 60000) / 1000).toFixed(3).padStart(6, "0")}]`;
};

const LINES: Line[] = [
  { text: `$ browser-auto run "${run.workflow_name}"`, tone: "dim" },
  ...(run.steps as Step[]).flatMap((s): Line[] => [
    {
      text: `${stamp(s.started_at)} ${s.status === "passed" ? "PASS" : s.status.toUpperCase()}  ${s.name}  (${s.duration_ms ?? "?"}ms${s.retries ? `, ${s.retries} retr${s.retries > 1 ? "ies" : "y"}` : ""})`,
      tone: s.status === "passed" ? "pass" : s.status === "failed" ? "fail" : "dim",
      img: s.screenshot && asset(s.screenshot),
    },
    ...(run.healing_events as Heal[])
      .filter((h) => h.step_name === s.name)
      .map((h) => ({
        text: `           ↻ healed ${h.original_selector} → ${h.healed_selector} (${h.strategy}, ${Math.round(h.confidence * 100)}%)`,
        tone: "dim" as const,
      })),
    ...(s.error ? [{ text: `           ! ${s.error}`, tone: "fail" as const }] : []),
  ]),
  {
    text: `─── ${run.status.toUpperCase()} · ${run.passed_steps}/${run.total_steps} passed · ${run.failed_steps} failed · ${run.healing_events.length} healed · ${(run.duration_ms ?? 0) / 1000}s`,
    tone: run.status === "passed" ? "pass" : "fail",
  },
];

/** Replays a recorded agent run line by line. */
export default function AgentTerminal() {
  const [n, setN] = useState(0);
  const [round, setRound] = useState(0);
  const out = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setN(++i);
      if (i >= LINES.length) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [round]);

  useEffect(() => {
    out.current?.scrollTo(0, out.current.scrollHeight);
  }, [n]);

  return (
    <div className="flex flex-col gap-2">
      <div ref={out} aria-live="polite" className="h-72 overflow-auto whitespace-pre-wrap">
        {LINES.slice(0, n).map((l, i) => (
          <div key={i} className={l.tone === "fail" ? "bg-foreground text-background" : l.tone === "dim" ? "text-dim" : ""}>
            {l.text}
            {/* eslint-disable-next-line @next/next/no-img-element -- recorded screenshots, sizes unknown */}
            {l.img && <img src={l.img} alt={`screenshot: ${l.text}`} className="my-1 max-h-40 border border-dim" />}
          </div>
        ))}
        {n < LINES.length && <span className="cursor" />}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => (setN(0), setRound(round + 1))}
          className="border border-foreground px-2 hover:bg-foreground hover:text-background"
        >
          [ replay ]
        </button>
        {run.sample && <span className="text-dim">(sample data)</span>}
      </div>
    </div>
  );
}
