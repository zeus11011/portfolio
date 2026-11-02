"use client";

import ReactMarkdown from "react-markdown";
import { join, resolve } from "@/lib/fs";
import { useLayout } from "@/lib/layout";

const btn = "border border-foreground px-2 hover:bg-foreground hover:text-background";

/** A project folder shown as an app: launch buttons for its demo/links, then its README. */
export default function ProjectApp({ path }: { path: string }) {
  const open = useLayout((s) => s.open);
  const node = resolve(path);
  if (node?.type !== "dir") return null;
  const entries = Object.entries(node.children);
  const readme = node.children["README.md"];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {entries.map(([name, child]) =>
          child.type === "exe" || child.type === "url" ? (
            <button key={name} className={btn} onClick={() => open(join(path, name))}>
              {child.type === "exe" ? `▶ run ${name}` : `↗ ${name.replace(/\.url$/, "")}`}
            </button>
          ) : null,
        )}
      </div>
      {readme?.type === "file" && (
        <div className="md">
          <ReactMarkdown>{readme.content}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
