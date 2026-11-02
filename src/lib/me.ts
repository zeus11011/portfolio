import me from "@/data/neofetch.json";
import skills from "@/data/skills.json";

// neofetch facts from data/neofetch.json, modules from data/skills.json (names only: levels stay out of the panel).
// Shared by the desktop panel (Banner.tsx) and the `neofetch` shell command. "since" (YYYY-MM) becomes the uptime.

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** [label, value] rows, the module list and the status line. Uptime is computed from `now`. */
export function neofetch(now = new Date()) {
  const [y, mo] = me.since.split("-").map(Number);
  const m = (now.getFullYear() - y) * 12 + now.getMonth() + 1 - mo;
  return {
    facts: [
      ["name", me.name],
      ["role", me.role],
      ["uptime", `${Math.floor(m / 12)}y ${m % 12}m since ${MONTH[mo - 1]} ${y}`],
      ["location", me.location],
    ] as [string, string][],
    modules: skills.map((s) => s.name).join(" · "),
    status: [me.status.text, me.status.detail] as const,
  };
}
