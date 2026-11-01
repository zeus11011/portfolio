import tree from "@/data/fs.json";

export type FsNode =
  | { type: "dir"; children: Record<string, FsNode> }
  | { type: "file"; content: string }
  | { type: "pdf"; src: string }
  | { type: "url"; href: string }
  | { type: "exe"; app: string };

export const root = tree as unknown as FsNode;

/** "projects/live-subtitles" -> node, or undefined. "" is the root. */
export function resolve(path: string): FsNode | undefined {
  return path
    .split("/")
    .filter(Boolean)
    .reduce<FsNode | undefined>((n, part) => (n?.type === "dir" ? n.children[part] : undefined), root);
}

/** Resolves `p` against `cwd`; handles ~, /, . and .. */
export function normalize(cwd: string, p: string): string {
  const parts = /^[~/]/.test(p) ? [] : cwd.split("/").filter(Boolean);
  for (const seg of p.replace(/^~\/?|^\//, "").split("/")) {
    if (seg === ".." ) parts.pop();
    else if (seg && seg !== ".") parts.push(seg);
  }
  return parts.join("/");
}

export const join =(dir: string, name: string) => (dir ? `${dir}/${name}` : name);

export const GLYPH: Record<FsNode["type"], string> = { dir: "▣", file: "≡", pdf: "▤", url: "↗", exe: ">_" };

/** Prefixes site-absolute paths from the data files ("/resume.pdf") with the deploy base path. */
export const asset = (p: string) => (p.startsWith("/") ? `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${p}` : p);
