import { neofetch } from "@/lib/me";

// figlet "ANSI Shadow" letters, 6 rows each; rows are joined so the columns can't drift.
const FONT: Record<string, string[]> = {
  A: [" █████╗ ", "██╔══██╗", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  N: ["███╗   ██╗", "████╗  ██║", "██╔██╗ ██║", "██║╚██╗██║", "██║ ╚████║", "╚═╝  ╚═══╝"],
  I: ["██╗", "██║", "██║", "██║", "██║", "╚═╝"],
  S: ["███████╗", "██╔════╝", "███████╗", "╚════██║", "███████║", "╚══════╝"],
  H: ["██╗  ██╗", "██║  ██║", "███████║", "██╔══██║", "██║  ██║", "╚═╝  ╚═╝"],
  K: ["██╗  ██╗", "██║ ██╔╝", "█████╔╝ ", "██╔═██╗ ", "██║  ██╗", "╚═╝  ╚═╝"],
  " ": ["  ", "  ", "  ", "  ", "  ", "  "],
};
const figlet = (s: string) => FONT.A.map((_, r) => [...s].map((c) => FONT[c][r]).join("")).join("\n");
const ART = figlet("ANISH NAIK");

// Labels: brighter than text-dim (#1f9e44 reads too faint at this size), still a step below the values.
const label = "text-foreground/75";

const Row = ({ k, children }: { k: string; children: React.ReactNode }) => (
  <p className="flex">
    {/* "prod 3y" / uptime are computed from today: build-time HTML can be a month behind */}
    <span suppressHydrationWarning className={`w-[12ch] shrink-0 ${label}`}>{k}</span>
    <span suppressHydrationWarning>{children}</span>
  </p>
);

/** neofetch-style facts (lib/me.ts): who, where, what's loaded, status. */
function SystemPanel() {
  const { facts, modules, status } = neofetch();
  let i = 0;
  const at = () => ({ "--i": i++ }) as React.CSSProperties; // print order, see .nf in globals.css
  return (
    <section aria-label="system info" className="nf mt-4 w-[54ch] text-left text-xl leading-tight">
      <p>
        guest@anish<span className={label}>:~$</span> <span className="nf-cmd">neofetch</span>
      </p>
      <hr style={at()} className="my-1 border-dim" />
      {facts.map(([k, v]) => (
        <div key={k} style={at()}>
          <Row k={k}>{v}</Row>
        </div>
      ))}
      <p style={at()} className={`mt-2 ${label}`}>loaded modules</p>
      <p style={at()}>{modules}</p>
      <p style={at()} className="mt-2">
        <span className={label}>status:</span> <span className="bg-foreground px-[1ch] text-background text-shadow-none">{status[0]}</span> {status[1]}
      </p>
    </section>
  );
}

/** Name banner, top right, behind the desktop nodes. Wide screens only: smaller ones have no free corner. */
export function Banner() {
  return (
    <header className="pointer-events-none absolute top-4 right-6 text-right max-[1199px]:hidden">
      <h1 className="sr-only">Anish Naik, software & AI developer, open to work</h1>
      {/* not VT323 (font-mono here): it lacks the block/box chars, and the fallback widths break the columns */}
      <pre aria-hidden className="font-[Consolas,Menlo,'DejaVu_Sans_Mono',monospace] text-[13px] leading-none">{ART}</pre>
      <p aria-hidden className="mt-2 text-2xl">software &amp; AI developer · open to work</p>
      <div className="flex justify-end">
        <SystemPanel />
      </div>
    </header>
  );
}
