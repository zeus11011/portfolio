"use client";

import { NodeResizer, type Node, type NodeProps } from "@xyflow/react";
import dynamic from "next/dynamic";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { asset, GLYPH, resolve } from "@/lib/fs";
import { useLayout } from "@/lib/layout";
import { Window } from "./Window";

// Each app's code loads only when its window opens.
const Explorer = dynamic(() => import("./apps/Explorer"));
const PdfViewer = dynamic(() => import("./apps/PdfViewer"));
const ProjectApp = dynamic(() => import("./apps/ProjectApp"));
const APPS: Record<string, React.ComponentType> = {
  mail: dynamic(() => import("./apps/Mail")),
  "subtitles-demo": dynamic(() => import("./apps/SubtitlesDemo")),
  "agent-terminal": dynamic(() => import("./apps/AgentTerminal")),
  "control-panel": dynamic(() => import("./apps/ControlPanel")),
};
const WIDE = new Set(["pdf", "subtitles-demo", "agent-terminal"]);

type Props<T extends Record<string, unknown>> = NodeProps<Node<T>>;

export function IconNode({ data }: Props<{ path: string; label: string; glyph?: string }>) {
  const open = useLayout((s) => s.open);
  const node = resolve(data.path);
  return (
    <button
      className="flex w-28 flex-col items-center gap-1 p-1 text-center text-xl leading-none max-md:text-2xl hover:bg-foreground/10"
      // one click/tap opens (a drag is not a click); double-click works too
      onClick={() => open(data.path)}
      onKeyDown={(e) => e.key === "Enter" && open(data.path)}
    >
      <span aria-hidden className="text-4xl max-md:text-6xl">{data.glyph ?? (node ? GLYPH[node.type] : "?")}</span>
      <span>{data.label}</span>
    </button>
  );
}

export function NoteNode({ data }: Props<{ text: string }>) {
  return <div className="w-40 -rotate-2 bg-foreground p-3 text-xl leading-tight text-background [text-shadow:none]">{data.text}</div>;
}

export function WindowNode({ id, data, positionAbsoluteY: y }: Props<{ path: string }>) {
  // set once the user resizes (NodeResizer writes node.width/height, persisted with the layout).
  // Not the width/height props: xyflow fills those from the measured size too.
  const sized = useLayout((s) => s.nodes.some((n) => n.id === id && n.width !== undefined));
  const close = useLayout((s) => s.close);
  const [cwd, setCwd] = useState(data.path);
  const node = resolve(data.path);
  const name = data.path.split("/").pop()!;
  const App = node?.type === "exe" ? APPS[node.app] : undefined;

  // a project folder (has a demo or link to launch) opens as an app, other folders in Explorer
  const project = node?.type === "dir" && Object.values(node.children).some((c) => c.type === "exe" || c.type === "url");

  let body;
  if (project) body = <ProjectApp path={data.path} />;
  else if (node?.type === "dir") body = <Explorer path={data.path} onPath={setCwd} />;
  else if (node?.type === "file") body = <div className="md"><ReactMarkdown>{node.content}</ReactMarkdown></div>;
  else if (node?.type === "pdf") body = <PdfViewer src={asset(node.src)} name={name} />;
  else if (App) body = <App />;
  else if (node?.type === "exe") body = <p>bash: {name}: app not installed yet</p>;
  else body = <p>cat: {data.path}: No such file or directory</p>;

  // READMEs get the wide window so long project titles fit on one line
  const wide = project || name === "README.md" || (node && WIDE.has(node.type === "exe" ? node.app : node.type));
  return (
    <div className={`${sized ? "h-full w-full" : node?.type === "pdf" ? "w-[min(960px,calc(100vw-16px))]" : wide ? "w-[min(680px,calc(100vw-16px))]" : "w-[min(480px,calc(100vw-16px))]"} text-xl max-md:text-2xl`}>
      <Window title={`~/${cwd}`} onClose={() => close(id)} fill={sized}>
        {/* fit on screen: viewport minus top bar (32px), window y, and the window's own borders/padding. Resized: fill the window. */}
        <div className="nodrag nowheel cursor-text overflow-auto select-text" style={sized ? { height: "100%" } : { maxHeight: `max(8rem, min(70vh, calc(100dvh - ${y + 32}px - 4lh)))` }}>
          {body}
        </div>
      </Window>
      {/* invisible grab strips on every edge/corner (styled in globals.css); the ASCII border stays clean.
          After <Window> so they paint above it (its power-on transform makes it a layer). */}
      <NodeResizer minWidth={240} minHeight={160} lineClassName="window-resize" handleClassName="window-resize" />
    </div>
  );
}
