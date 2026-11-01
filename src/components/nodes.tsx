"use client";

import type { Node, NodeProps } from "@xyflow/react";
import dynamic from "next/dynamic";
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

export function IconNode({ data, positionAbsoluteX: x, positionAbsoluteY: y }: Props<{ path: string; label: string; glyph?: string }>) {
  const open = useLayout((s) => s.open);
  const node = resolve(data.path);
  return (
    <button
      className="flex w-24 flex-col items-center gap-1 p-1 text-center text-xl leading-none hover:bg-foreground/10"
      onDoubleClick={() => open(data.path, { x, y })}
      onKeyDown={(e) => e.key === "Enter" && open(data.path, { x, y })}
    >
      <span aria-hidden className="text-4xl">{data.glyph ?? (node ? GLYPH[node.type] : "?")}</span>
      <span>{data.label}</span>
    </button>
  );
}

export function NoteNode({ data }: Props<{ text: string }>) {
  return <div className="w-48 -rotate-2 bg-foreground p-3 text-xl leading-tight text-background [text-shadow:none]">{data.text}</div>;
}

export function WindowNode({ id, data, positionAbsoluteX: x, positionAbsoluteY: y }: Props<{ path: string }>) {
  const close = useLayout((s) => s.close);
  const node = resolve(data.path);
  const name = data.path.split("/").pop()!;
  const App = node?.type === "exe" ? APPS[node.app] : undefined;

  // a project folder (has a demo or link to launch) opens as an app, other folders in Explorer
  const project = node?.type === "dir" && Object.values(node.children).some((c) => c.type === "exe" || c.type === "url");

  let body;
  if (project) body = <ProjectApp path={data.path} near={{ x, y }} />;
  else if (node?.type === "dir") body = <Explorer path={data.path} near={{ x, y }} />;
  else if (node?.type === "file") body = <div className="md"><ReactMarkdown>{node.content}</ReactMarkdown></div>;
  else if (node?.type === "pdf") body = <PdfViewer src={asset(node.src)} name={name} />;
  else if (App) body = <App />;
  else if (node?.type === "exe") body = <p>bash: {name}: app not installed yet</p>;
  else body = <p>cat: {data.path}: No such file or directory</p>;

  const wide = project || (node && WIDE.has(node.type === "exe" ? node.app : node.type));
  return (
    <div className={`${wide ? "w-[680px]" : "w-[480px]"} text-xl`}>
      <Window title={`~/${data.path}`} onClose={() => close(id)}>
        <div className="nodrag nowheel max-h-[70vh] cursor-text overflow-auto select-text">{body}</div>
      </Window>
    </div>
  );
}
