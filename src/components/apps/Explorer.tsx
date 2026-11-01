"use client";

import type { XYPosition } from "@xyflow/react";
import { useState } from "react";
import { GLYPH, join, resolve } from "@/lib/fs";
import { useLayout } from "@/lib/layout";

const btn = "px-1 hover:bg-foreground hover:text-background disabled:text-dim disabled:hover:bg-transparent";

export default function Explorer({ path: start, near }: { path: string; near: XYPosition }) {
  const open = useLayout((s) => s.open);
  const [history, setHistory] = useState([start]);
  const [icons, setIcons] = useState(false);
  const path = history[history.length - 1];
  const node = resolve(path);
  const names = node?.type === "dir" ? Object.keys(node.children) : [];
  const go = (p: string) => setHistory((h) => [...h, p]);

  function activate(name: string) {
    const child = join(path, name);
    if (resolve(child)?.type === "dir") go(child);
    else open(child, near);
  }

  return (
    <div>
      <div className="mb-1 flex gap-2 border-b border-dim pb-1">
        <button className={btn} disabled={history.length < 2} onClick={() => setHistory((h) => h.slice(0, -1))}>
          [&lt; back]
        </button>
        <button className={btn} disabled={!path} onClick={() => go(path.split("/").slice(0, -1).join("/"))}>
          [^ up]
        </button>
        <button className={btn} onClick={() => setIcons(!icons)} aria-pressed={icons}>
          [{icons ? "list" : "icons"}]
        </button>
        <span className="truncate text-dim">~/{path}</span>
      </div>
      {!names.length && <p className="text-dim">(empty)</p>}
      <ul className={icons ? "grid grid-cols-4 gap-2" : ""}>
        {names.map((n) => {
          const type = node?.type === "dir" ? node.children[n].type : "file";
          return (
            <li key={n}>
              <button
                onClick={() => activate(n)}
                className={`${btn} ${icons ? "flex w-full flex-col items-center text-center" : ""}`}
              >
                <span aria-hidden className={icons ? "text-3xl" : "mr-2"}>
                  {GLYPH[type]}
                </span>
                <span className="break-all">{type === "dir" ? `${n}/` : n}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
