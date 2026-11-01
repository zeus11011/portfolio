# Graph Report - portfolio  (2026-11-02)

## Corpus Check
- Corpus is ~12,994 words - fits in a single context window. You may not need a graph.

## Summary
- 353 nodes · 561 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.78)
- Token cost: 123,774 input · 0 output

## Community Hubs (Navigation)
- CRT OS Portfolio Concept
- Terminal & Easter Eggs
- Windowed Apps & Explorer
- Desktop Canvas & Boot
- Deploy Workflow Jobs
- Next.js Workflow Jobs
- Resume Skills & AI Projects
- Agent & Subtitle Demos
- TypeScript Config
- Dev Dependencies
- GitHub Pages Deploy
- App Shell & Branding
- Next.js Workflow Triggers
- Runtime Dependencies
- Playwright Tests
- Mail Contact Form
- ESLint Config
- NPM Scripts
- Build Phase Plan

## God Nodes (most connected - your core abstractions)
1. `CRT Terminal OS Portfolio` - 30 edges
2. `compilerOptions` - 16 edges
3. `resolve()` - 15 edges
4. `useLayout` - 15 edges
5. `CHECKLIST.md - progress tracker` - 15 edges
6. `react` - 13 edges
7. `TerminalNode()` - 13 edges
8. `rag-engine: RAG PDF question-answering app` - 10 edges
9. `@playwright/test` - 9 edges
10. `WindowNode()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Agent Terminal app (replays agent run)` --demonstrates--> `browser-harness: AI browser automation & manual-test agent`  [INFERRED]
  PROJECT.md → public/resume.pdf
- `submit()` --indirect_call--> `sh()`  [INFERRED]
  src/components/Terminal.tsx → tests/apps.spec.ts
- `Anish Naik - Software Engineer (AI agents, Python backend)` --authored--> `CRT Terminal OS Portfolio`  [INFERRED]
  public/resume.pdf → PROJECT.md
- `Ask Me (AI) RAG chat app` --uses--> `RAG (retrieval-augmented generation)`  [EXTRACTED]
  PROJECT.md → public/resume.pdf
- `Ask Me (AI) RAG chat app` --conceptually_related_to--> `rag-engine: RAG PDF question-answering app`  [INFERRED]
  PROJECT.md → public/resume.pdf

## Import Cycles
- None detected.

## Communities (19 total, 2 thin omitted)

### Community 0 - "CRT OS Portfolio Concept"
Cohesion: 0.05
Nodes (44): Anish Naik - Software Engineer (AI agents, Python backend), File Explorer app, Notepad / cat viewer app, PDF Viewer app, Shell (terminal) app, Boot sequence (BIOS check + skills as drivers log), Box-drawing window chrome, CHECKLIST.md - progress tracker (+36 more)

### Community 1 - "Terminal & Easter Eggs"
Cohesion: 0.11
Nodes (26): Easter eggs (sudo hire-me, rm -rf / kernel panic, ASCII game), react, Panic(), TerminalNode(), onKeyDown(), submit(), text(), WELCOME (+18 more)

### Community 2 - "Windowed Apps & Explorer"
Cohesion: 0.14
Nodes (24): Apps lazy-loaded per window, react-markdown@^10.1.0, react-markdown, @xyflow/react, Explorer(), activate(), ProjectApp(), APPS (+16 more)

### Community 3 - "Desktop Canvas & Boot"
Cohesion: 0.13
Nodes (20): Control Panel app (skills.cfg), Draggable canvas desktop, First-view items (Resume.pdf, About Me, Projects, Contact, Ask Me, Recycle Bin), Sounds: relay click, key clicks, CRT hum (muted by default), Home(), Boot(), cleanup(), done() (+12 more)

### Community 4 - "Deploy Workflow Jobs"
Cohesion: 0.10
Nodes (22): runs-on, steps, environment, needs, runs-on, steps, NEXT_PUBLIC_BASE_PATH, NEXT_PUBLIC_FORMSPREE_ID (+14 more)

### Community 5 - "Next.js Workflow Jobs"
Cohesion: 0.10
Nodes (22): runs-on, steps, environment, needs, runs-on, steps, name, url (+14 more)

### Community 6 - "Resume Skills & AI Projects"
Cohesion: 0.10
Nodes (20): Ask Me (AI) RAG chat app, AWS (Lambda, SQS, SNS, S3, CloudFormation, CDK), browser-harness: AI browser automation & manual-test agent, Projects as desktop apps with launch buttons + README, ChromaDB, CI/CD pipelines (GitHub Actions, Jenkins), FastAPI, FastMCP / MCP (+12 more)

### Community 7 - "Agent & Subtitle Demos"
Cohesion: 0.11
Nodes (11): Agent Terminal app (replays agent run), Subtitles Demo app, Serverless backend for AI chat + live subtitles, Heal, Line, LINES, Step, t0 (+3 more)

### Community 8 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.15
Nodes (17): devDependencies, @playwright/test@^1.64.1, tailwindcss@^4, @tailwindcss/turbopack@^4, @types/node@^20, @types/react@^19, @types/react-dom@^19, typescript@^5 (+9 more)

### Community 10 - "GitHub Pages Deploy"
Cohesion: 0.14
Nodes (13): Static export + GitHub Pages deploy, concurrency, cancel-in-progress, group, name, on, push, workflow_dispatch (+5 more)

### Community 11 - "App Shell & Branding"
Cohesion: 0.14
Nodes (9): nextConfig, next@16.4.3, next, CRT screen with green phosphor bezel, Phosphor green on black palette (#33ff66, #1f9e44, #0a0a0a), Terminal prompt '>' with block cursor '_', metadata, vt323 (+1 more)

### Community 12 - "Next.js Workflow Triggers"
Cohesion: 0.15
Nodes (12): concurrency, cancel-in-progress, group, name, on, push, workflow_dispatch, permissions (+4 more)

### Community 13 - "Runtime Dependencies"
Cohesion: 0.17
Nodes (12): dependencies, motion@^14.9.0, pdfjs-dist@^6.4.299, react@19.3.0, react-dom@19.3.0, @xyflow/react@^12.12.0, zustand@^5.0.16, motion (+4 more)

### Community 15 - "Mail Contact Form"
Cohesion: 0.33
Nodes (3): Mail app (contact form), Formspree (NEXT_PUBLIC_FORMSPREE_ID) / mailto fallback, Mail()

### Community 16 - "ESLint Config"
Cohesion: 0.33
Nodes (5): eslintConfig, eslint@^9, eslint-config-next@16.4.3, eslint, eslint-config-next

### Community 17 - "NPM Scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, start, test

## Knowledge Gaps
- **29 isolated node(s):** `Geist font via next/font`, `Audience: recruiters and interview-panel engineers`, `Phosphor palette (green #33ff66 / amber #ffb000 on #0a0a0a)`, `react-markdown`, `xterm.js (alternative to custom prompt)` (+24 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 152 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `CRT Terminal OS Portfolio` connect `CRT OS Portfolio Concept` to `Terminal & Easter Eggs`, `Desktop Canvas & Boot`, `Resume Skills & AI Projects`, `Agent & Subtitle Demos`, `App Shell & Branding`, `Mail Contact Form`?**
  _High betweenness centrality (0.194) - this node is a cross-community bridge._
- **What connects `Geist font via next/font`, `Audience: recruiters and interview-panel engineers`, `Phosphor palette (green #33ff66 / amber #ffb000 on #0a0a0a)` to the rest of the system?**
  _29 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `CRT OS Portfolio Concept` be split into smaller, more focused modules?**
  _Cohesion score 0.05052790346907994 - nodes in this community are weakly interconnected._
- **Why does `CHECKLIST.md - progress tracker` connect `CRT OS Portfolio Concept` to `GitHub Pages Deploy`, `Windowed Apps & Explorer`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Should `Terminal & Easter Eggs` be split into smaller, more focused modules?**
  _Cohesion score 0.10606060606060606 - nodes in this community are weakly interconnected._
- **Why does `Static export + GitHub Pages deploy` connect `GitHub Pages Deploy` to `CRT OS Portfolio Concept`?**
  _High betweenness centrality (0.148) - this node is a cross-community bridge._
- **Should `Windowed Apps & Explorer` be split into smaller, more focused modules?**
  _Cohesion score 0.13636363636363635 - nodes in this community are weakly interconnected._