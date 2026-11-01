"use client";

import { useState } from "react";
import contact from "@/data/contact.json";

// Set NEXT_PUBLIC_FORMSPREE_ID to deliver the form; otherwise it falls back to a mailto: link.
const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID;
const field = "w-full border border-dim bg-transparent px-2 py-1 outline-none focus:border-foreground";

export default function Mail() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const canSend = Boolean(FORMSPREE_ID || contact.email);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    if (!FORMSPREE_ID) {
      const subject = encodeURIComponent(`Portfolio: message from ${form.get("name")}`);
      const body = encodeURIComponent(`${form.get("message")}\n\n— ${form.get("name")} <${form.get("email")}>`);
      location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
      return;
    }
    setStatus("sending");
    try {
      const r = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: form,
      });
      setStatus(r.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  const links = [
    contact.email && { label: contact.email, href: `mailto:${contact.email}` },
    contact.github && { label: "github", href: contact.github },
    contact.linkedin && { label: "linkedin", href: contact.linkedin },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div className="flex flex-col gap-3">
      {status === "sent" ? (
        <p>message sent. I&apos;ll get back to you soon.</p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <label>
            name
            <input name="name" required className={field} />
          </label>
          <label>
            email
            <input name="email" type="email" required className={field} />
          </label>
          <label>
            message
            <textarea name="message" required rows={4} className={field} />
          </label>
          <button
            disabled={!canSend || status === "sending"}
            className="self-start border border-foreground px-2 hover:bg-foreground hover:text-background disabled:border-dim disabled:text-dim"
          >
            {status === "sending" ? "sending..." : "[ send ]"}
          </button>
          {status === "error" && <p role="alert">couldn&apos;t send. try a link below.</p>}
        </form>
      )}
      <p className="flex gap-4">
        {links.map((l) => (
          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="underline hover:bg-foreground hover:text-background">
            {l.label}
          </a>
        ))}
      </p>
    </div>
  );
}
