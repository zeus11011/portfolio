import { join, normalize, resolve } from "./fs";
import { neofetch } from "./me";

/** A line of output: plain text or a clickable name that opens a path. */
export type Seg = string | { text: string; path: string };
export type Line = Seg[];
export type ShellState = { cwd: string; secret?: number; tries?: number; ai?: boolean };
export type Effect = { ask?: string; open?: string; clear?: true; panic?: true; reset?: true; crt?: boolean };
type Result = { out: Line[]; state: ShellState; effect?: Effect };

export const HELP: Line[] = [
  ["commands:"],
  ["  help              this list"],
  ["  ask [question]    ask my AI about me (no question: chat mode)"],
  ["  ls [-a] [dir]     list files (click a name to open it)"],
  ["  cd <dir>          change directory"],
  ["  cat <file>        print a file"],
  ["  open <name>       open a file or app (open resume)"],
  ["  whoami            who's here"],
  ["  neofetch          system info: role, stack, status"],
  ["  contact           get in touch"],
  ["  crt on/off        screen effects"],
  ["  reset             reset the desktop layout"],
  ["  clear             clear the screen"],
];

const COMMANDS = ["ask", "cat", "cd", "clear", "contact", "crt", "help", "ls", "neofetch", "open", "reset", "sudo", "whoami"];

/**
 * Tab completion. Completes the command name, then the last argument as a path.
 * Several matches: fills their common prefix and returns them in `matches`.
 */
export function complete(input: string, cwd: string): { input: string; matches: string[] } {
  const words = input.split(" ");
  const word = words[words.length - 1];
  let options: string[];
  let stem = ""; // part of `word` kept as-is (the directory)
  if (words.length === 1) {
    const dir = resolve(cwd);
    const exes = dir?.type === "dir" ? Object.keys(dir.children).filter((n) => dir.children[n].type === "exe") : [];
    options = [...COMMANDS, ...exes].map((c) => `${c} `);
  } else if (words[0] === "crt") {
    options = ["on", "off"];
  } else if (words[0] === "sudo") {
    options = ["hire-me"];
  } else {
    const slash = word.lastIndexOf("/");
    stem = word.slice(0, slash + 1);
    const dir = resolve(normalize(cwd, stem));
    if (dir?.type !== "dir") return { input, matches: [] };
    const base = word.slice(slash + 1);
    options = Object.keys(dir.children)
      .filter((n) => base.startsWith(".") || !n.startsWith("."))
      .filter((n) => words[0] !== "cd" || dir.children[n].type === "dir")
      .map((n) => (dir.children[n].type === "dir" ? `${n}/` : `${n} `));
  }
  const rest = word.slice(stem.length);
  const hits = options.filter((o) => o.startsWith(rest));
  if (!hits.length) return { input, matches: [] };
  let common = hits[0];
  for (const h of hits) while (!h.startsWith(common)) common = common.slice(0, -1);
  if (hits.length > 1) common = common.trimEnd();
  const head = words.slice(0, -1).concat(stem + common).join(" ");
  return { input: head, matches: hits.length > 1 ? hits.map((h) => h.trimEnd()) : [] };
}

/** Resolves an argument; "resume" also matches "resume.pdf". */
function find(cwd: string, arg: string): string | undefined {
  const path = normalize(cwd, arg);
  if (resolve(path)) return path;
  const dir = path.split("/").slice(0, -1).join("/");
  const base = path.split("/").pop();
  const parent = resolve(dir);
  if (parent?.type !== "dir") return;
  const hit = Object.keys(parent.children).find((n) => n.startsWith(`${base}.`));
  return hit && join(dir, hit);
}

export function run(input: string, state: ShellState): Result {
  const line = input.trim();
  const [cmd = "", ...args] = line.split(/\s+/);
  const arg = args.join(" ");
  const say = (...out: string[]): Result => ({ out: out.map((s) => [s]), state });

  // ai chat mode: every line is a question
  if (state.ai && line) {
    if (cmd === "exit" || cmd === "quit") return { out: [["bye."]], state: { cwd: state.cwd } };
    return { out: [], state, effect: { ask: line } };
  }

  // hidden game: guess the number
  if (state.secret !== undefined && line) {
    if (cmd === "quit") return { out: [["bye."]], state: { cwd: state.cwd } };
    const n = Number(line);
    const tries = (state.tries ?? 0) + 1;
    if (!Number.isInteger(n)) return say("numbers only (or `quit`)");
    if (n === state.secret) return { out: [[`*** ${n}! got it in ${tries} tries ***`]], state: { cwd: state.cwd } };
    return { out: [[n < state.secret ? "higher ^" : "lower v"]], state: { ...state, tries } };
  }

  switch (cmd) {
    case "":
      return { out: [], state };
    case "help":
      return { out: HELP, state };
    case "ask":
      if (arg) return { out: [], state, effect: { ask: arg } };
      return { out: [["chat mode: ask anything about Anish. `exit` to leave."]], state: { cwd: state.cwd, ai: true } };
    case "clear":
      return { out: [], state, effect: { clear: true } };
    case "whoami":
      return say("guest", "you're browsing Anish Naik's portfolio. try `cat about.txt` or `open resume`.");
    case "neofetch": {
      const { facts, modules, status } = neofetch();
      const row = ([k, v]: readonly [string, string]): Line => [`${k.padEnd(12)}${v}`];
      return {
        out: [["guest@anish"], ["-----------"], ...facts.map(row), [""], ["loaded modules"], [modules], [""], [`status: [${status[0]}] ${status[1]}`]],
        state,
      };
    }
    case "contact":
      return { out: [["opening contact..."]], state, effect: { open: "contact.sh" } };
    case "reset":
      return { out: [["layout reset."]], state, effect: { reset: true } };
    case "crt":
      if (arg !== "on" && arg !== "off") return say("usage: crt on/off");
      return { out: [[`crt: ${arg}`]], state, effect: { crt: arg === "on" } };
    case "ls": {
      const all = args.includes("-a");
      const target = args.filter((a) => a !== "-a").join(" ");
      const path = normalize(state.cwd, target);
      const node = resolve(path);
      if (!node) return say(`ls: ${target}: No such file or directory`);
      if (node.type !== "dir") return { out: [[{ text: target, path }]], state };
      const names = Object.keys(node.children).filter((n) => all || !n.startsWith("."));
      const segs = names.flatMap((n): Seg[] => [
        { text: node.children[n].type === "dir" ? `${n}/` : n, path: join(path, n) },
        "  ",
      ]);
      return { out: segs.length ? [segs] : [], state };
    }
    case "cd": {
      const path = normalize(state.cwd, arg || "~");
      const node = resolve(path);
      if (node?.type !== "dir") return say(`cd: ${arg}: ${node ? "Not a directory" : "No such file or directory"}`);
      return { out: [], state: { ...state, cwd: path } };
    }
    case "cat": {
      if (!arg) return say("usage: cat <file>");
      const path = find(state.cwd, arg);
      const node = path ? resolve(path) : undefined;
      if (!node) return say(`cat: ${arg}: No such file or directory`);
      if (node.type === "dir") return say(`cat: ${arg}: Is a directory`);
      if (node.type !== "file") return say(`cat: ${arg}: binary file, try \`open ${arg}\``);
      return { out: node.content.split("\n").map((l) => [l]), state };
    }
    case "open": {
      if (!arg) return say("usage: open <name>");
      const path = find(state.cwd, arg);
      if (!path) return say(`open: ${arg}: No such file or directory`);
      return { out: [["opening ", { text: path, path }, "..."]], state, effect: { open: path } };
    }
    case "sudo":
      if (arg === "hire-me")
        return {
          out: [["[sudo] password for guest: ********"], ["access granted. excellent decision."], ["opening contact..."]],
          state,
          effect: { open: "contact.sh" },
        };
      return say("guest is not in the sudoers file. This incident will be reported.");
    case "rm":
      if (/-\w*r\w*f|-\w*f\w*r/.test(arg) && /(^|\s)(\/|~)\*?$/.test(arg)) return { out: [], state, effect: { panic: true } };
      return say("rm: permission denied (nice try)");
    case "guess":
      return {
        out: [["+------------------------------+"], ["|  GUESS THE NUMBER  (1-100)    |"], ["+------------------------------+"], ["type a number, or `quit`."]],
        state: { cwd: state.cwd, secret: 1 + Math.floor(Math.random() * 100), tries: 0 },
      };
  }

  // run an executable in cwd by name: `demo` or `./demo`
  const exe = normalize(state.cwd, cmd);
  if (resolve(exe)?.type === "exe") return { out: [[`starting ${cmd}...`]], state, effect: { open: exe } };
  return say(`bash: ${cmd}: command not found. type \`help\`.`);
}
