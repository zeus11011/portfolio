"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLayout } from "@/lib/layout";
import { complete, run, type Line, type ShellState } from "@/lib/shell";
import { keyClick } from "@/lib/sound";
import { setFlag } from "./TrayToggle";
import { Window } from "./Window";

const WELCOME: Line[] = [["welcome to guestOS. type `help` (tab autocompletes), or just click around."], [""]];
const CHARS_PER_TICK = 6; // every 16ms ≈ 375 chars/s
const text = (l: Line) => l.map((s) => (typeof s === "string" ? s : s.text)).join("");

export function TerminalNode() {
  const { open, reset } = useLayout();
  const [lines, setLines] = useState<Line[]>(WELCOME);
  const [sh, setSh] = useState<ShellState>({ cwd: "" });
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hi, setHi] = useState(-1); // index into history while pressing up/down
  const [panic, setPanic] = useState(false);
  // typewriter position: lines before `line` are fully shown, `line` shows `chars` characters
  const [typed, setTyped] = useState({ line: 0, chars: 0 });
  const typing = typed.line < lines.length;
  const inputRef = useRef<HTMLInputElement>(null);
  const outRef = useRef<HTMLDivElement>(null);
  const prompt = sh.secret !== undefined ? "guess>" : `guest@anish:~${sh.cwd ? `/${sh.cwd}` : ""}$`;

  useEffect(() => {
    if (!typing) return;
    const budget = matchMedia("(prefers-reduced-motion: reduce)").matches ? Infinity : CHARS_PER_TICK;
    const id = setInterval(
      () =>
        setTyped(({ line, chars }) => {
          let left = budget;
          while (line < lines.length && left > 0) {
            const rest = text(lines[line]).length - chars;
            if (rest <= left) [left, line, chars] = [left - Math.max(rest, 1), line + 1, 0];
            else [chars, left] = [chars + left, 0];
          }
          return { line, chars };
        }),
      16,
    );
    return () => clearInterval(id);
  }, [lines, typing]);

  useEffect(() => {
    outRef.current?.scrollTo(0, outRef.current.scrollHeight);
  }, [lines, typed]);

  /** Appends output; the echoed command shows at once, the rest types out. */
  function print(echo: Line, out: Line[]) {
    setLines([...lines, echo, ...out]);
    setTyped({ line: lines.length + 1, chars: 0 });
  }

  function submit() {
    const r = run(input, sh);
    if (r.effect?.clear) {
      setLines([]);
      setTyped({ line: 0, chars: 0 });
    } else print([`${prompt} ${input}`], r.out);
    setSh(r.state);
    setInput("");
    setHi(-1);
    if (input.trim()) setHistory((h) => [...h, input]);
    const e = r.effect;
    if (e?.open) open(e.open);
    if (e?.reset) reset();
    if (e?.crt !== undefined) setFlag("crt", e.crt);
    if (e?.panic) setPanic(true);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    keyClick();
    if (e.key === "Enter") submit();
    else if (e.key === "Tab") {
      e.preventDefault();
      if (sh.secret !== undefined) return;
      const c = complete(input, sh.cwd);
      // like bash: list the options when Tab can't fill anything more
      if (c.matches.length && c.input === input) print([`${prompt} ${input}`], [[c.matches.join("  ")]]);
      setInput(c.input);
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const next = e.key === "ArrowUp" ? (hi < 0 ? history.length - 1 : Math.max(0, hi - 1)) : hi < 0 ? -1 : hi + 1;
      const i = next >= history.length ? -1 : next;
      setHi(i);
      setInput(i < 0 ? "" : history[i]);
    }
  }

  return (
    <div className="w-[min(520px,calc(100vw-16px))] text-xl max-md:text-2xl" onClick={() => !getSelection()?.toString() && inputRef.current?.focus()}>
      <Window title="guest@anish:~">
        {/* phones: 3 icon rows (~440px, see grid() in layout.ts) + window chrome + bottom bar take ~34rem; the terminal gets the rest */}
        <div ref={outRef} className="nodrag nowheel h-[min(18rem,35vh)] cursor-text max-md:h-[clamp(6rem,calc(100dvh-34rem),18rem)] overflow-auto select-text">
          {/* screen readers get whole lines here instead of the typewriter */}
          <div aria-live="polite" className="sr-only">
            {lines.slice(0, typed.line).map((l, i) => (
              <p key={i}>{text(l)}</p>
            ))}
          </div>
          <div>
            {lines.slice(0, typed.line + 1).map((line, i) => {
              let budget = i < typed.line ? Infinity : typed.chars;
              return (
                <div key={i} className="min-h-[1lh] whitespace-pre-wrap">
                  {line.map((s, j) => {
                    const full = typeof s === "string" ? s : s.text;
                    const shown = full.slice(0, budget);
                    budget -= shown.length;
                    if (!shown) return null;
                    return typeof s === "string" ? (
                      shown
                    ) : (
                      <button key={j} onClick={() => open(s.path)} className="underline hover:bg-foreground hover:text-background">
                        {shown}
                      </button>
                    );
                  })}
                  {i === typed.line && <span className="cursor" />}
                </div>
              );
            })}
          </div>
          <label className="flex whitespace-pre">
            <span className={typing ? "invisible" : ""}>{prompt} </span>
            <span className={typing ? "invisible" : ""}>{input}</span>
            <span className={typing ? "invisible" : "cursor"} />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              aria-label="Terminal input"
              autoFocus
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              className="absolute size-px opacity-0"
            />
          </label>
        </div>
      </Window>
      {panic && createPortal(<Panic />, document.body)}
    </div>
  );
}

function Panic() {
  useEffect(() => {
    const reboot = () => {
      try {
        sessionStorage.removeItem("booted");
      } catch {}
      location.reload();
    };
    // let the Enter that triggered the panic pass first
    const id = setTimeout(() => {
      addEventListener("keydown", reboot);
      addEventListener("pointerdown", reboot);
    }, 300);
    return () => {
      clearTimeout(id);
      removeEventListener("keydown", reboot);
      removeEventListener("pointerdown", reboot);
    };
  }, []);

  return (
    <div role="alert" className="fixed inset-0 z-40 bg-background p-8 text-2xl whitespace-pre-wrap">
      {`Kernel panic - not syncing: guest ran rm -rf /
CPU: 0 PID: 1 Comm: portfolio Tainted: G  D  6.1.0-anish
Call Trace:
 <TASK>
 rm_rf_root+0x2a/0x40
 guest_curiosity+0x1337/0x1337
 hire_anish_instead+0x0/0x0
 </TASK>
---[ end Kernel panic - not syncing ]---

press any key to reboot`}
      <span className="cursor" />
    </div>
  );
}
