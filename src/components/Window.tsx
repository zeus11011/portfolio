import type { ReactNode } from "react";

// Enough box chars to fill any width/height; overflow clips the rest.
const H = "─".repeat(300);
const V = "│\n".repeat(200);

export function Window({
  title,
  onClose,
  fill,
  children,
}: {
  title: string;
  onClose?: () => void;
  /** Fill a fixed-size (resized) node: the body takes the leftover height and scrolls. */
  fill?: boolean;
  children: ReactNode;
}) {
  return (
    <section role="dialog" aria-label={title} className={`power-on bg-background leading-none ${fill ? "flex h-full flex-col" : ""}`}>
      <div className="window-title flex cursor-move whitespace-pre">
        <span>┌─</span>
        <span>[ {title} ]</span>
        <span className="flex-1 overflow-hidden">{H}</span>
        {onClose && (
          <button onClick={onClose} aria-label={`Close ${title}`} className="nodrag hover:bg-foreground hover:text-background">
            [x]
          </button>
        )}
        <span>─┐</span>
      </div>
      <div className={`grid grid-cols-[1ch_minmax(0,1fr)_1ch] ${fill ? "min-h-0 flex-1 grid-rows-[minmax(0,1fr)]" : ""}`}>
        <span aria-hidden className="h-0 min-h-full overflow-hidden whitespace-pre">{V}</span>
        <div className="min-h-0 px-[1ch] py-1 leading-tight">{children}</div>
        <span aria-hidden className="h-0 min-h-full overflow-hidden whitespace-pre">{V}</span>
      </div>
      <div aria-hidden className="flex whitespace-pre">
        <span>└</span>
        <span className="flex-1 overflow-hidden">{H}</span>
        {/* resize grip (the drag target is NodeResizer's invisible corner handle on top of it) */}
        <span>◢</span>
      </div>
    </section>
  );
}
