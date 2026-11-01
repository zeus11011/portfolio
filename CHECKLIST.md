# CRT Terminal OS Portfolio — Checklist

Tracks every item from [PROJECT.md](PROJECT.md). Tick `[x]` as things get done.

## 1. Setup and tech stack

- [x] Next.js + TypeScript app scaffolded (Next 16, App Router, `src/`, Tailwind 4)
- [x] `@xyflow/react` (React Flow) installed
- [x] Zustand for layout state
- [x] Motion (Framer Motion) installed
- [x] react-markdown installed
- [x] ~~howler.js~~ dropped: sounds synthesized with Web Audio
- [x] VT323 font loaded via `next/font/google`
- [x] Playwright set up for end-to-end tests (`npm test`, smoke test passing)
- [x] Static export + GitHub Pages workflow (`.github/workflows/deploy.yml`)
- [ ] Repo pushed to GitHub, Pages source set to "GitHub Actions"

## 2. Visual direction (CRT look)

- [x] Phosphor palette picked (green `#33ff66` or amber `#ffb000` on `#0a0a0a`) + dim secondary shade
- [x] Scanlines overlay (repeating gradient)
- [x] Glow (`text-shadow`)
- [x] Vignette + dark bezel (fake curvature)
- [x] Faint flicker animation
- [x] Box-drawing window borders `┌─┐`, `[ title ]` bar, `[x]` close
- [x] Blinking block cursor in terminal; pixel arrow + pixel hand mouse cursors
- [x] Text types out line by line
- [x] Window power-on horizontal-line expand
- [x] `crt: on/off` toggle in tray
- [x] Effects reduced under `prefers-reduced-motion`

## 3. Canvas and file system

- [x] Canvas fixed to the browser screen (no pan/zoom, no page overflow; nodes clamped inside, follows window resize)
- [x] Windows, icons, project cards, sticky notes as custom React Flow nodes (edges/handles hidden)
- [x] Windows drag by title-bar `dragHandle`
- [x] `nodrag` / `nowheel` on inputs, buttons, scroll areas
- [x] Snap-to-grid (20px)
- [x] Node positions saved to localStorage
- [x] `reset layout` button in tray + `reset` shell command
- [x] JSON file tree drives all content (`src/data/fs.json`)
- [x] First view has: `Resume.pdf`, `About Me.txt`, `Projects`, `Contact`, `Ask Me (AI)`, `Recycle Bin`
- [x] Full tree structure in `fs.json`
- [ ] Real content written (currently `TODO` placeholders):
  - [ ] `about.txt`
  - [x] `public/resume.pdf` file added
  - [ ] `projects/live-subtitles/README.md` + real `github.url`
  - [ ] `projects/browser-testing-agent/README.md` + real `github.url`
  - [x] `projects/rag-engine/README.md` + `github.url` (+ desktop card)
  - [ ] `projects/more/` (one README each)
  - [ ] `experience/current-company.txt`
  - [ ] `experience/education.txt`
  - [ ] `etc/skills.cfg`
- [x] Every `.url` opens in a new tab
- [x] Every executable launches its app (except `ask-me`, still "not installed yet")

## 4. Signature moments

- [x] Boot sequence: BIOS memory check + `[ OK ] Loaded python.ko` style skill log (skills from `src/data/skills.json`)
- [x] Boot skippable on any key (shown once per session; skipped under reduced motion)
- [x] Shell prompt `guest@anish:~$` open on first load
- [x] Commands: `help`, `ls`, `cd`, `cat`, `open`, `whoami`, `contact` (+ `clear`, `reset`, `crt on/off`, history with ↑/↓, Tab autocomplete)
- [x] `ls` output names are clickable
- [x] Executables run by name at the prompt (`demo`, `./replay`, `ask-me`)
- [x] Sounds: relay click, key clicks, CRT hum (Web Audio, no files; muted by default, `sound` tray toggle)
- [x] Easter egg: `sudo hire-me`
- [x] Easter egg: `rm -rf /` fake kernel panic → any key reboots
- [x] Easter egg: hidden ASCII game (`guess`)

## 5. Apps

**Must**
- [x] Shell (terminal)
- [x] File Explorer (list/icon views, back/up; folders open in place)
- [x] Notepad / `cat` viewer (markdown render)
- [x] PDF Viewer (pdf.js, recolored to phosphor palette, prev/next + download; text exposed to screen readers)
- [x] Mail (form → Formspree if `NEXT_PUBLIC_FORMSPREE_ID` is set, else `mailto:`; links from `src/data/contact.json`)
- [x] Subtitles Demo (replays `src/data/subtitles.json`, synced to a clip if `media` is set)
  - [ ] Real clip + caption output recorded (currently `"sample": true` placeholder)
  - [ ] "Try live" mode calling real backend (bonus; needs a hosted backend)
- [x] Agent Terminal (replays browser_auto's `ExecutionReport` JSON: steps, heals, retries, errors, summary)
  - [ ] Real run recorded into `src/data/agent-run.json` (currently `"sample": true` placeholder; optional `screenshot` per step)
  - [ ] Link to full video
- [x] Apps lazy-loaded (each app's code loads when its window opens)

**Should**
- [ ] Ask Me (AI): RAG over resume + READMEs only
  - [ ] Token cap per session
  - [ ] Rate limit
- [x] Control Panel (`skills.cfg` → installed programs with level bars from `src/data/skills.json`)

**Could**
- [ ] Media Player
- [ ] Game (original snake/minesweeper-style)

## 6. Mobile and accessibility

- [ ] Under ~768px: one-finger pan, snap-to-grid, clamped zoom
- [ ] Bottom command bar opens any file by name
- [ ] Window dragging off on phones; apps open full-screen with back button
- [ ] Plain view: one-page HTML version, linked in corner and boot screen
- [ ] Keyboard: Tab through icons, Enter opens, Esc closes
- [ ] Alt+Tab style switcher (bonus)
- [ ] Windows `role="dialog"` with labels; icons as named buttons
- [ ] Focus moves into a window on open
- [ ] `prefers-reduced-motion` skips boot animation
- [ ] Sound off by default
- [ ] Palette passes WCAG AA for body text

## 7. Deployment, SEO, analytics

- [ ] Custom domain (e.g. `yourname.dev`) + HTTPS
- [x] Push to `main`/`master` deploys to GitHub Pages (no PR previews on Pages)
- [ ] AI chat + live subtitles backend (GitHub Pages is static-only: needs a separate host, e.g. a Cloudflare Worker)
- [ ] API keys in env vars only, never client-side
- [ ] Plain view server-rendered with name, role, project names in headings
- [ ] Open Graph image (desktop screenshot)
- [ ] Analytics (Plausible / Umami / Vercel) with events: resume download, demo opened, contact sent
- [x] Each app's code lazy-loaded
- [ ] Images and sounds compressed

## 8. Build milestones

- [ ] Core OS working (canvas, shell, file tree, Notepad, PDF, Mail)
- [ ] MVP live link (target: week 3)
- [ ] Both demos built (before any polish)
- [ ] AI chat + Control Panel
- [ ] Polish (sounds, easter eggs, effects)
- [ ] Launch (target: ~week 8)

## 9. Success criteria

- [ ] Resume reachable in ≤ 2 clicks from first load
- [ ] Both projects demoable inside the site
- [ ] Loads < 3s on mid-range phone on 4G
- [ ] Works on mobile
- [ ] Content updated by editing data files only

## 10. Launch checklist

- [ ] Resume opens within 2 clicks and downloads correctly
- [ ] Both demos work with no backend running (recorded mode)
- [ ] Phone mode tested on a real Android and iPhone
- [ ] Plain-view page works with JavaScript off
- [ ] Contact form delivers to inbox
- [ ] AI chat has rate limits and only answers from your content
- [ ] Lighthouse mobile score checked; no console errors
- [ ] Open Graph preview checked on LinkedIn
- [ ] Custom domain + HTTPS live
- [ ] Link added to resume, LinkedIn and GitHub profile README

## Stretch (after launch)

- [ ] Guestbook app (small database)
- [ ] Switchable themes (Win95 / CRT / dark)
- [ ] Task Manager with live site stats
- [ ] Deep links, e.g. `/?open=projects/live-subtitles`
- [ ] Blog folder of `.txt` posts
