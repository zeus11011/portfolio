# CRT Terminal OS Portfolio — Project Outline

Nov 1, 2026 · @Anish Naik

## Overview and goals

A personal portfolio site that looks and behaves like a retro CRT terminal OS in the browser, built on a draggable canvas. Projects, resume and contact details live as files, folders and apps inside it, and the two main projects run as live demos instead of screenshots.

**Who it's for**

- Recruiters and hiring managers screening for software / AI developer roles (30–60 seconds, want resume and contact fast)
- Engineers on interview panels (will poke around, open devtools, read the code)

**Success criteria**

- Resume reachable in 2 clicks or less from first load
- Both projects (live subtitles, browser testing agent) demoable inside the site
- Loads in under 3 seconds on a mid-range phone on 4G
- Works on mobile, not just desktop
- Content updated by editing data files, without touching UI code

## Concept and visual direction

The look is a CRT terminal OS: phosphor text on near-black behind curved glass. Everything sits on one pannable canvas where windows, file icons, project cards and notes can be dragged anywhere.

| Element | Spec |
| --- | --- |
| Palette | One phosphor colour: green `#33ff66` or amber `#ffb000` on `#0a0a0a`, plus one dimmer shade for secondary text |
| Font | Open-licensed terminal font, e.g. VT323, IBM Plex Mono or Departure Mono |
| Screen effects | Scanlines, glow, vignette and faint flicker as CSS overlays; curvature faked with a rounded vignette and a dark bezel |
| Windows | Box-drawing borders (`┌─┐`), title bar as `[ about.txt ]`, close button as `[x]` |
| Cursor | Blinking block cursor in the terminal; pixel arrow on the canvas |
| Motion | Text types out line by line; windows power on with a quick horizontal-line expand |

Keep the effects subtle: heavy curvature and flicker hurt readability. Add a `crt: on/off` toggle in the tray and turn effects down under `prefers-reduced-motion`.

**Signature moments**

- **Boot sequence:** BIOS-style memory check, then a boot log listing skills as drivers (`[ OK ] Loaded python.ko`), skippable on any key
- **Command line:** a `guest@yourname:~$` prompt that accepts `help`, `ls`, `cd`, `cat about.txt`, `open resume`, `whoami`, `contact`; clicking still works for anyone who doesn't type
- **Sounds:** relay click on power-on, soft key clicks, faint CRT hum (muted by default)
- **Easter eggs:** `sudo hire-me`, `rm -rf /` triggering a fake kernel panic, a hidden ASCII game

## Desktop and file system structure

The home screen is a large pannable canvas: drag the background to pan, scroll or pinch to zoom. Windows, file icons, project cards and sticky notes are all draggable, and the recruiter essentials sit in the first view. The file system is still a JSON tree, so adding a project means adding an entry, not a component.

**Items in the first view of the canvas**

1. `Resume.pdf` — opens the PDF viewer, with a download button
2. `About Me.txt` — opens in Notepad
3. `Projects` folder
4. `Contact` — mail app
5. `Ask Me (AI)` — chat assistant
6. `Recycle Bin` — easter egg

**Full tree**

```text
~/  (guest@yourname)
├── about.txt
├── resume.pdf
├── contact.sh
├── ask-me              (AI chat)
├── projects/
│   ├── live-subtitles/
│   │   ├── README.md   (what, why, stack, results)
│   │   ├── demo        (runs the in-browser demo)
│   │   └── github.url
│   ├── browser-testing-agent/
│   │   ├── README.md
│   │   ├── replay      (replays a recorded agent run)
│   │   └── github.url
│   └── more/           (smaller projects, one README each)
├── experience/
│   ├── current-company.txt  (development + delivery roles)
│   └── education.txt        (Goa College of Engineering)
├── etc/
│   └── skills.cfg      (skills as a config file)
├── games/              (easter egg)
└── .trash/
    └── old-projects/
```

Every `.url` opens a real link in a new tab. Every executable (`demo`, `replay`, `ask-me`) launches an app from the Apps list below, by double-click or by typing its name at the prompt.

## Apps

The two demo apps are the reason this portfolio exists; build them right after the core OS works, before any polish.

**Shell** is the extra core app in the CRT version: a terminal window already open on first load, so typing and clicking both reach every file and app. File Explorer becomes `ls` output with clickable names, and Notepad becomes a `cat` viewer window.

| App | Opens | What it does | Priority |
| --- | --- | --- | --- |
| File Explorer | Folders | Browse the file tree; list and icon views; back/up buttons | Must |
| Notepad | `.txt` files | Renders markdown content in a retro text window | Must |
| PDF Viewer | `Resume.pdf` | Embedded resume + download button | Must |
| Mail | `Contact` | Contact form (e.g. Formspree / Resend) + LinkedIn, GitHub, email links | Must |
| Subtitles Demo | `Live Subtitles/Demo.exe` | Plays a short audio/video clip with real-time captions; mic mode if the browser allows | Must |
| Agent Terminal | `Browser Testing Agent/Terminal.exe` | Replays a recorded agent run: steps, logs and screenshots scrolling, with a pass/fail report at the end | Must |
| Ask Me (AI) | `Ask Me.exe` | Chat that answers questions about you from your resume and project READMEs (small RAG over your own content) | Should |
| Control Panel | `skills.cfg` | Skills shown as settings sliders / installed programs | Should |
| Media Player | — | Optional background music or a project video walkthrough | Could |
| Game | `Games/` | Easter egg (e.g. a small original snake or minesweeper clone) | Could |

**Demo notes**

- **Subtitles Demo:** pre-record a clip and its caption output so the demo always works; offer "try live" as a bonus that calls your real backend. Never let a cold server make the main demo fail.
- **Agent Terminal:** record a real run as JSON (timestamps, actions, screenshots) and replay it. It is cheaper, safe and always works. Link a full video for people who want more.
- **Ask Me (AI):** keep answers grounded in your own files only, cap tokens per session, and add a rate limit so the API bill stays small.

## Tech stack and architecture

Stack: **Next.js + React Flow + a custom terminal component (or xterm.js) + CSS CRT overlay + Motion.** React Flow does the infinite canvas: every window, file icon and project card is a custom node rendered as normal HTML, so text stays selectable, readable by screen readers and indexable, while pan, zoom and drag come for free.

| Layer | Library | How you use it |
| --- | --- | --- |
| Framework | Next.js + TypeScript | SSR for plain view, API routes, easy Vercel deploy |
| Canvas (pan, zoom, drag) | [React Flow](https://www.npmjs.com/package/@xyflow/react) (`@xyflow/react`, MIT) | Windows, icons and cards as custom nodes; hide edges and handles; built-in snap-to-grid; drag windows by a title-bar `dragHandle` |
| Inside windows | React Flow `nodrag` / `nowheel` classes | Add to inputs, buttons and scrollable content so typing and scrolling don't drag or zoom the canvas |
| Layout state | Zustand (React Flow uses it internally) | Save node positions to localStorage; `reset layout` command restores defaults |
| Terminal | Custom React prompt, or [xterm.js](https://socket.dev/npm/package/@xterm/xterm/overview/6.1.0-beta.286) (`@xterm/xterm`, MIT) | Your own small command parser (`ls`, `cd`, `cat`, `open`); a custom prompt is lighter and easier to style |
| CRT look | Plain CSS overlay | Scanlines (repeating gradient), vignette, `text-shadow` glow, subtle flicker animation |
| Animation | Motion (formerly Framer Motion) | Window power-on, boot log typing, focus transitions |
| Sound | howler.js or use-sound | Key clicks, power-on relay, CRT hum |
| Content | JSON file tree + markdown via react-markdown | Edit content without touching components |
| Font | VT323 (Google Fonts) | Terminal look, open-licensed |
| AI chat | An LLM API + embeddings of your markdown files | Small RAG over your own content only |
| Testing | Playwright end-to-end tests, including drag and pan | Ties in with your browser testing agent work |

&#91;embedded content: site architecture · data files, OS shell, apps, serverless functions\]

**Two limits to plan around**

- **No real screen curvature.** A WebGL shader can't bend HTML elements under it; true curvature only works on content drawn into a canvas. Fake it with a rounded vignette and a dark bezel. If you add a PixiJS background layer, [pixi-filters](https://docsearch.algolia.com/mcp/docs/repo/pixijs/filters) has a CRTFilter for that layer only.
- **Avoid tldraw.** It looks like a perfect fit, but production use needs a [license key](https://tldraw.dev/sdk-features/license-key), and the free hobby license keeps a "made with tldraw" watermark. React Flow does the same job under MIT.

## Mobile and accessibility

On screens under \~768 px the canvas stays, but tamed: one-finger drag pans, items snap to a grid, zoom is clamped, and a command bar at the bottom opens any file by name. Window dragging is off on phones; apps open full-screen.

- **Phone mode:** pannable canvas with snap-to-grid items, each app opens full-screen, a back button instead of window controls
- **Plain view:** a link in the corner (and in the boot screen) to a simple one-page HTML version of the same content, for people in a hurry and for search engines
- **Keyboard:** Tab through desktop icons, Enter to open, Esc to close the focused window, Alt+Tab style switcher as a bonus
- **Screen readers:** windows as `role="dialog"` with labels, icons as buttons with names, focus moves into a window when it opens
- **Motion and sound:** respect `prefers-reduced-motion` (skip the boot animation), sound off by default
- **Contrast:** check the retro palette against WCAG AA for body text; CRT green-on-black and grey bevels often fail

## Build phases and milestones

About 8 weeks at evenings-and-weekends pace. Ship a working MVP at week 3 so you have a live link early, then spend the best effort on the two demos.

&#91;embedded content: build roadmap · 5 phases, 2 gates, about 8 weeks\]

If time runs short, cut from AI and polish, never from the demos: a plain OS with two working demos beats a beautiful OS with screenshots.

## Deployment, SEO and analytics

Host the static site free on Vercel or Netlify (or Cloudflare Pages), with a custom domain such as `yourname.dev`.

- **Deploys:** push to `main` deploys to production; every pull request gets a preview URL
- **Backend bits:** the AI chat and live-subtitle mode run as serverless functions; keep API keys in environment variables, never in the client
- **SEO:** the plain-view page is server-rendered HTML with your name, role and project names in headings, so Google indexes real text, not an empty canvas
- **Link previews:** Open Graph image of the desktop screenshot, so links shared on LinkedIn and WhatsApp look good
- **Analytics:** a privacy-friendly tool (Plausible, Umami or Vercel Analytics) with events for resume download, demo opened and contact sent; these tell you which part recruiters actually use
- **Performance:** lazy-load each app's code, compress images and sounds, check Lighthouse on mobile before launch

## Stretch ideas and launch checklist

**Stretch ideas (after launch)**

- Visitor guestbook app with comments stored in a small database
- Desktop wallpapers and themes the visitor can switch (Win95 / CRT / dark)
- A "Task Manager" showing live site stats (visitors, demos run)
- Shareable deep links, e.g. `/?open=projects/live-subtitles` opens that window directly, handy for resumes and cold emails
- A blog folder of `.txt` posts on what you learned building the agents

**Launch checklist**

- [ ] Resume opens within 2 clicks and downloads correctly
- [ ] Both demos work with no backend running (recorded mode)
- [ ] Phone mode tested on a real Android and iPhone
- [ ] Plain-view page works with JavaScript off
- [ ] Contact form delivers to your inbox
- [ ] AI chat has rate limits and only answers from your content
- [ ] Lighthouse mobile score checked; no console errors
- [ ] Open Graph preview checked on LinkedIn
- [ ] Custom domain + HTTPS live
- [ ] Link added to resume, LinkedIn and GitHub profile README
