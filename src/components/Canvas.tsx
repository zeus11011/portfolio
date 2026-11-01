"use client";

import { Background, Panel, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/base.css";
import { useEffect, useSyncExternalStore } from "react";
import { useLayout } from "@/lib/layout";
import { syncHum } from "@/lib/sound";
import { IconNode, NoteNode, WindowNode } from "./nodes";
import { TerminalNode } from "./Terminal";
import { TrayToggle } from "./TrayToggle";

const nodeTypes = { icon: IconNode, note: NoteNode, window: WindowNode, terminal: TerminalNode };

// Screen size as "WxH" so the snapshot is a stable primitive.
const onResize = (cb: () => void) => (addEventListener("resize", cb), () => removeEventListener("resize", cb));
const screenSize = () => `${innerWidth}x${innerHeight}`;

export function Canvas() {
  const { nodes, onNodesChange, reset, fit } = useLayout();
  const [w, h] = useSyncExternalStore(onResize, screenSize, () => "1280x800").split("x").map(Number);
  // keep nodes inside the screen
  const bounds: [[number, number], [number, number]] = [[0, 0], [w, h]];

  useEffect(() => {
    Promise.resolve(useLayout.persist.rehydrate()).then(fit);
  }, [fit]);
  useEffect(() => {
    if (useLayout.persist.hasHydrated()) fit();
  }, [w, fit]);
  // width changed (resize, rotation, devtools device): reload once resizing settles.
  // Height-only changes are ignored: phone address bars and on-screen keyboards change the height.
  useEffect(() => {
    const start = innerWidth;
    let t: ReturnType<typeof setTimeout>;
    const onWidth = () => {
      clearTimeout(t);
      t = setTimeout(() => innerWidth !== start && location.reload(), 300);
    };
    addEventListener("resize", onWidth);
    return () => (removeEventListener("resize", onWidth), clearTimeout(t));
  }, []);

  return (
    <ReactFlow
      nodes={nodes}
      onNodesChange={onNodesChange}
      nodeTypes={nodeTypes}
      snapToGrid
      snapGrid={[20, 20]}
      nodeExtent={bounds}
      translateExtent={bounds}
      // the desktop is exactly one screen: no zoom, no pan
      minZoom={1}
      maxZoom={1}
      panOnDrag={false}
      panOnScroll={false}
      zoomOnScroll={false}
      zoomOnPinch={false}
      zoomOnDoubleClick={false}
      deleteKeyCode={null}
      colorMode="dark"
    >
      <Background color="var(--dim)" gap={20} size={1} />
      <Panel position="bottom-left" className="flex gap-4 text-xl text-dim max-md:text-2xl">
        <button onClick={reset} className="hover:bg-foreground hover:text-background">
          reset layout
        </button>
        <TrayToggle name="crt" defaultOn />
        <TrayToggle name="sound" defaultOn={false} onChange={syncHum} />
      </Panel>
    </ReactFlow>
  );
}
