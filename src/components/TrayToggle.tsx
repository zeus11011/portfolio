"use client";

import { useSyncExternalStore } from "react";

// Flags live on <html data-*>, restored before paint by the inline script in layout.tsx.
const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => (listeners.add(cb), () => listeners.delete(cb));

export function setFlag(name: string, on: boolean) {
  document.documentElement.dataset[name] = on ? "on" : "off";
  try {
    localStorage.setItem(name, on ? "on" : "off");
  } catch {}
  listeners.forEach((cb) => cb());
}

export function TrayToggle({
  name,
  defaultOn,
  onChange,
  className = "hover:bg-foreground hover:text-background",
}: {
  name: string;
  defaultOn: boolean;
  onChange?: () => void;
  className?: string;
}) {
  const on = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset[name] ?? (defaultOn ? "on" : "off")) === "on",
    () => defaultOn,
  );
  return (
    <button
      onClick={() => (setFlag(name, !on), onChange?.())}
      aria-pressed={on}
      className={className}
    >
      {name}: {on ? "on" : "off"}
    </button>
  );
}
