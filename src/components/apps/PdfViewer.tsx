"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

const btn = "px-1 hover:bg-foreground hover:text-background disabled:text-dim disabled:hover:bg-transparent";

/** Renders a PDF with pdf.js, recolored to the phosphor palette. */
export default function PdfViewer({ src, name }: { src: string; name: string }) {
  const [pdf, setPdf] = useState<PDFDocumentProxy>();
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [text, setText] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let loading: { destroy(): Promise<void> } | undefined;
    import("pdfjs-dist")
      .then(async (pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
        const task = pdfjs.getDocument({ url: src });
        loading = task;
        setPdf(await task.promise);
      })
      .catch(() => setError(true));
    return () => void loading?.destroy();
  }, [src]);

  useEffect(() => {
    const el = canvas.current;
    if (!pdf || !el) return;
    let cancelled = false;
    let task: { cancel(): void } | undefined;
    pdf.getPage(page).then(async (p) => {
      if (cancelled) return;
      const css = getComputedStyle(document.documentElement);
      const scale = (el.parentElement!.clientWidth / p.getViewport({ scale: 1 }).width) * devicePixelRatio;
      const viewport = p.getViewport({ scale });
      el.width = viewport.width;
      el.height = viewport.height;
      const render = p.render({
        canvas: el,
        viewport,
        pageColors: { background: css.getPropertyValue("--background").trim(), foreground: css.getPropertyValue("--foreground").trim() },
      });
      task = render;
      await render.promise.catch(() => {});
      const content = await p.getTextContent();
      if (!cancelled) setText(content.items.map((i) => ("str" in i ? i.str : "")).join(" "));
    });
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdf, page]);

  if (error) return <p>{name} not found. Add it to public/.</p>;
  const pages = pdf?.numPages ?? 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 border-b border-dim pb-1">
        <button className={btn} disabled={page <= 1} onClick={() => setPage(page - 1)}>
          [&lt; prev]
        </button>
        <span aria-live="polite">{pages ? `${page}/${pages}` : "loading..."}</span>
        <button className={btn} disabled={page >= pages} onClick={() => setPage(page + 1)}>
          [next &gt;]
        </button>
        <a href={src} download className={`${btn} ml-auto`}>
          [ download ]
        </a>
      </div>
      <div className="border border-dim">
        <canvas ref={canvas} role="img" aria-label={`${name}, page ${page}`} className="block w-full" />
      </div>
      <p className="sr-only">{text}</p>
    </div>
  );
}
