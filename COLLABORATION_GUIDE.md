# Collaboration Guide

## Layout

This repo has two parallel product builds:

| Folder | Build | Audience | Deployment |
|---|---|---|---|
| `web/` | Static web app | Anyone with a modern browser | GitHub Pages (auto, via Action) |
| `app/` | Tauri desktop app | Power users (ProRes, HW accel) | Local installer (`npm run tauri build`) |

There is **no longer a dev/QA split** inside the web build. Production-only.
All work lands directly in `web/` and ships to Pages on push to `main`.

## Roles

### Codex

Primary role:

- Idea validation, market research, product planning
- Marketing strategy, policy, operating rules
- Collaboration guardrails

Document areas owned by default:

- `COLLABORATION_GUIDE.md`
- `README.md`
- `docs/GO_TO_MARKET_STRATEGY.md`
- `docs/PMF_HYPOTHESES.md`
- `docs/ROADMAP.md`
- `docs/EXECUTION_BACKLOG.md`
- product/market/policy notes in Markdown

Codex should not directly change release-critical UI behavior unless explicitly reassigned.

### Claude

Primary role:

- Design, frontend development, QA execution

Implementation areas owned by default:

- `web/**` (production web build)
- `app/**` (Tauri desktop build)
- visual design changes
- interaction logic
- QA fixes tied to implementation

## File Ownership

### Web build (`web/`)

- `web/index.html`
- `web/assets/css/comparer.css`
- `web/assets/js/comparer-app.js`
- `web/assets/js/parse-exr.js`
- `web/assets/vendor/**`
- `web/local-single-file/**`

Rules:

- This is the live production code. Every push to `main` that touches `web/**` deploys.
- No separate "dev" tracking file — verify locally via `start-comparer.cmd` before committing.
- Keep static-hosting friendly (no build step, no bundler).

### Desktop build (`app/`)

- `app/src-tauri/**` (Rust, Tauri config)
- `app/package.json`
- `app/scripts/**` (e.g. ffmpeg fetcher)

Rules:

- Test locally with `npm run tauri dev` before committing.
- Embedded binaries (FFmpeg static) live in `app/src-tauri/binaries/` and are .gitignored — must be re-fetched per machine via `npm run fetch-ffmpeg`.
- The desktop app loads `../web` as its frontend at build time, so any web change automatically lands in the desktop app on the next desktop build.

### Historical / internal

- `legacy/**` — read-only history
- `dashboard.html`, `dashboard-server.js`, `dashboard-assets/`, `dashboard-data/` — internal ops dashboard
- `agent-launchers/` — Windows launcher scripts for agent workflows

## Branch Rules

- Never work directly on `main`
- Use separate branches per person and task:
  - `codex/<topic>`
  - `claude/<topic>`
  - `release/<date-or-topic>`

## Working Rules

- Codex decides positioning, roadmap priority, policy, documentation direction, release gates
- Claude decides implementation details, design execution, and QA fixes
- Cross-cutting changes: Codex defines intent first, Claude implements second
- Document handoffs in commit messages or PR summaries

## Release Flow

### Web build

1. Implement in `web/**`
2. Smoke-test locally with `start-comparer.cmd`
3. PR → review → merge to `main`
4. GitHub Action auto-deploys to Pages

### Desktop build

1. Implement in `app/**` (or share via `web/**`)
2. Local test: `cd app && npm run tauri dev`
3. Local build: `npm run tauri build` (produces installer in `app/src-tauri/target/release/bundle/`)
4. Push when stable
5. Release packaging is manual for now (no Action yet)

## Non-Negotiables

- Production deploys go through the GitHub Action — no manual gh-pages branch edits
- The desktop app must work offline (FFmpeg embedded, no network calls for core features)
- One person owns release promotion at a time
- Policy decisions and implementation decisions stay separated in the commit log
