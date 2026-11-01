import { applyNodeChanges, type Node, type NodeChange, type XYPosition } from "@xyflow/react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { resolve } from "./fs";
import { relay } from "./sound";

const icon = (id: string, path: string, label: string, x: number, y: number, glyph?: string): Node => ({
  id,
  type: "icon",
  position: { x, y },
  data: { path, label, glyph },
});

export const defaultNodes: Node[] = [
  icon("resume", "resume.pdf", "Resume.pdf", 40, 40),
  icon("about", "about.txt", "About Me.txt", 160, 40),
  icon("projects", "projects", "Projects", 40, 160),
  icon("contact", "contact.sh", "Contact", 160, 160),
  icon("ask", "ask-me", "Ask Me (AI)", 40, 280),
  icon("trash", ".trash", "Recycle Bin", 160, 280),
  // projects as apps
  icon("app-subs", "projects/live-subtitles", "Live Subtitles", 320, 40, "[cc]"),
  icon("app-agent", "projects/browser-testing-agent", "Test Agent", 440, 40, "[>]"),
  icon("app-rag", "projects/rag-engine", "RAG Engine", 320, 160, "[?]"),
  icon("app-chip8", "projects/chip-8-emulator", "CHIP-8", 440, 160, "[8]"),
  {
    id: "note",
    type: "note",
    position: { x: 640, y: 40 },
    data: { text: "drag me. drag windows by their title bar." },
  },
  { id: "terminal", type: "terminal", position: { x: 640, y: 180 }, dragHandle: ".window-title", data: {} },
];

type Layout = {
  nodes: Node[];
  onNodesChange: (changes: NodeChange[]) => void;
  open: (path: string, near: XYPosition) => void;
  close: (id: string) => void;
  reset: () => void;
};

export const useLayout = create<Layout>()(
  persist(
    (set, get) => ({
      nodes: defaultNodes,
      onNodesChange: (changes) => set({ nodes: applyNodeChanges(changes, get().nodes) }),
      open: (path, near) => {
        const node = resolve(path);
        if (!node) return;
        if (node.type === "url") {
          window.open(node.href, "_blank", "noopener,noreferrer");
          return;
        }
        relay();
        const id = `win:${path}`;
        // selecting raises the window (elevateNodesOnSelect)
        const nodes = get().nodes.map((n) => ({ ...n, selected: n.id === id }));
        if (nodes.some((n) => n.id === id)) return set({ nodes });
        set({
          nodes: [
            ...nodes,
            { id, type: "window", position: { x: near.x + 40, y: near.y + 40 }, dragHandle: ".window-title", selected: true, data: { path } },
          ],
        });
      },
      close: (id) => set({ nodes: get().nodes.filter((n) => n.id !== id) }),
      reset: () => set({ nodes: defaultNodes }),
    }),
    // rehydrated in Canvas after mount so SSR markup matches
    {
      name: "layout",
      version: 6,
      skipHydration: true,
      partialize: (s) => ({ nodes: s.nodes }),
      migrate: () => ({ nodes: defaultNodes }), // old saved layouts: start fresh
    },
  ),
);
