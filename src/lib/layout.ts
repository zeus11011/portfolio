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

const desktop: Node[] = [
  icon("resume", "resume.pdf", "Resume.pdf", 40, 40),
  icon("about", "about.txt", "About Me.txt", 160, 40),
  icon("projects", "projects", "Projects", 40, 160),
  icon("contact", "contact.sh", "Contact", 160, 160),
  icon("ask", "ask-me", "Ask Me (AI)", 40, 280),
  icon("trash", ".trash", "Recycle Bin", 160, 280),
  // projects as apps
  // hidden for now: icon("app-subs", "projects/.live-subtitles", "Live Subtitles", 320, 40, "[cc]"),
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

/** Grid cells for the reflowed layout. Phones (< 768px, Tailwind's md) get bigger icons (w-28 = 112px): tighter margin, taller rows, 3 columns down to 360px. */
const grid = (w: number) => (w < 768 ? { x0: 8, cw: 116, rh: 140 } : { x0: 20, cw: 120, rh: 120 });
const columns = (w: number) => Math.max(1, Math.floor((w - grid(w).x0) / grid(w).cw));
/** Which default layout fits this width; a saved layout made for another mode is redone. */
const layoutMode = (w: number) => (w >= 1200 ? "desktop" : `grid-${columns(w)}x${grid(w).rh}`);

/** Desktop layout on wide screens; on phones/tablets the icons reflow into a grid with the terminal below. */
export function defaultNodes(w = typeof window === "undefined" ? 1280 : innerWidth): Node[] {
  if (w >= 1200) return desktop;
  const { x0, cw, rh } = grid(w);
  const cols = columns(w);
  const icons = desktop.filter((n) => n.type === "icon");
  const rows = Math.ceil(icons.length / cols);
  return [
    ...icons.map((n, i) => ({ ...n, position: { x: x0 + (i % cols) * cw, y: 20 + Math.floor(i / cols) * rh } })),
    { ...desktop.find((n) => n.id === "terminal")!, position: { x: 8, y: 20 + rows * rh } },
  ];
}

type Box = { x: number; y: number; w: number; h: number };
const box = (n: Node): Box => ({ x: n.position.x, y: n.position.y, w: n.measured?.width ?? 96, h: n.measured?.height ?? 96 });
const hit = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Where a dropped icon goes: where it is, or the nearest 20px grid spot on screen that no other icon covers. */
export function freeSpot(node: Node, nodes: Node[], w: number, h: number): XYPosition {
  const me = box(node);
  const others = nodes.filter((n) => n.type === "icon" && n.id !== node.id).map(box);
  const free = (x: number, y: number) => !others.some((o) => hit({ ...me, x, y }, o));
  if (free(me.x, me.y)) return node.position;
  // ponytail: brute-force scan of every grid spot (~5k on a big screen), fine for a dozen icons on drop
  const spots: XYPosition[] = [];
  for (let x = 0; x + me.w <= w; x += 20) for (let y = 0; y + me.h <= h; y += 20) spots.push({ x, y });
  const d = (p: XYPosition) => (p.x - me.x) ** 2 + (p.y - me.y) ** 2;
  return spots.sort((a, b) => d(a) - d(b)).find((p) => free(p.x, p.y)) ?? node.position;
}

type Layout = {
  nodes: Node[];
  mode: string;
  fit: () => void;
  onNodesChange: (changes: NodeChange[]) => void;
  open: (path: string, near: XYPosition) => void;
  close: (id: string) => void;
  reset: () => void;
};

export const useLayout = create<Layout>()(
  persist(
    (set, get) => ({
      nodes: desktop, // SSR markup; Canvas calls fit() after mount
      mode: "",
      // screen changed layout mode (phone/tablet/desktop, rotation, devtools device view): re-lay icons, keep open windows
      fit: () => {
        const mode = layoutMode(innerWidth);
        if (get().mode !== mode) set({ mode, nodes: [...defaultNodes(), ...get().nodes.filter((n) => n.type === "window")] });
      },
      onNodesChange: (changes) => {
        let nodes = applyNodeChanges(changes, get().nodes);
        // icon dropped (drag ended): never leave it on top of another icon
        for (const c of changes)
          if (c.type === "position" && c.dragging === false)
            nodes = nodes.map((n) => (n.id === c.id && n.type === "icon" ? { ...n, position: freeSpot(n, nodes, innerWidth, innerHeight) } : n));
        set({ nodes });
      },
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
      reset: () => set({ mode: layoutMode(innerWidth), nodes: defaultNodes() }),
    }),
    // rehydrated in Canvas after mount so SSR markup matches
    {
      name: "layout",
      version: 8,
      skipHydration: true,
      partialize: (s) => ({ nodes: s.nodes, mode: s.mode }),
      migrate: () => ({ mode: "" }), // old saved layouts: fit() starts fresh
    },
  ),
);
