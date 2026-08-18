# Pixell Video Comparer

A browser-based video comparison tool for fast before/after quality checks.

Two builds live in this repo:

- **`web/`** — static web app, deployed to GitHub Pages.
- **`app/`** — Tauri desktop wrapper (uses system-bundled FFmpeg with HW acceleration: NVENC / QuickSync / AMF). Not pushed to GitHub Pages.

## Repository layout

```
web/                       # production web app (deployed to GitHub Pages)
├── index.html
├── about.html
├── assets/
│   ├── css/comparer.css
│   ├── js/comparer-app.js
│   ├── js/parse-exr.js
│   └── vendor/{MediaInfoModule.wasm, mediainfo.umd.min.js}
└── local-single-file/     # separate downloadable single-file build

app/                       # Tauri desktop app (test locally first)
├── src-tauri/             # Rust backend + Tauri config
├── package.json           # Tauri CLI scripts
└── README.md              # build / dev instructions

docs/                      # roadmap, PMF hypotheses, etc.
agent-launchers/           # internal Windows launcher scripts for agents
dashboard.html             # ops dashboard (internal)
.github/workflows/         # GitHub Pages deploy action
start-comparer.cmd         # one-click local HTTP server for the web build
```

## Why this exists

Comparing quality-improved output against the original is usually annoying:

- Two separate players are hard to sync.
- Side-by-side layout needs constant manual resizing.
- Repeating this workflow for many clips wastes time.

This project solves that with a lightweight static web app plus a desktop wrapper
that adds native FFmpeg / HW-accelerated transcoding for codecs the browser can't
play (Apple ProRes, etc.).

## What it does

- Multi-view comparison layouts: `1x2` (default), `2x2`, `1x4`, `1x3`
- Split (overlay wipe) layouts: `Split 2/3/4` stack players at the same size and
  position and reveal them side by side through draggable vertical divider handles
- Drag-and-drop media loading: local files, URLs, HLS (`.m3u8`) via hls.js
- Sync and navigation controls: play/pause, seek, frame stepping, speed control
- Zoom + click-and-drag pan
- Real-time monitoring panel (bandwidth, latency, buffer, dropped frames, errors)
- DaVinci Resolve–style color scopes (waveform, parade, vectorscope, histogram, hue map)
- Diff Lab (abs / signed / heatmap / threshold / SSIM / flicker / edge / chroma)
- Still-frame capture (`C`)
- Apple ProRes transcoding fallback (FFmpeg.wasm in the web build, native FFmpeg in the desktop build)

## Run the web build locally

The page **must** be served over HTTP (not `file://`) so that WebAssembly,
Workers, and `fetch()` work.

Windows one-click:

```cmd
start-comparer.cmd
```

Manual:

```bash
# any static server works
python -m http.server 8765 --directory web
# then open http://localhost:8765/
```

## Run the desktop app

See `app/README.md`. Quick version:

```bash
cd app
npm install
npm run fetch-ffmpeg     # downloads a static FFmpeg into src-tauri/binaries/
npm run tauri dev        # launch the desktop app
npm run tauri build      # produce a Windows installer
```

## GitHub Pages deployment

GitHub Pages is configured to deploy via the GitHub Actions workflow at
`.github/workflows/deploy-pages.yml`. Any push to `main` that touches `web/**`
publishes the new build automatically.

**One-time repo setting:** Settings → Pages → Source → "GitHub Actions".

Live URL: `https://<username>.github.io/PixellVideoComparer/`

## Keyboard shortcuts

- `Space`: Play / Pause
- `R`: Time sync
- `0–9`: Jump to 0–90 % of timeline
- `-`: Jump to latest buffered segment
- `S`: Toggle left/right 50 % crop
- `M`: Toggle monitoring panel
- `F`: Fullscreen
- `← / →`: Step frame
- `Shift + ← / →`: Step 10 frames
- `Shift + < / >`: Adjust playback speed
- `C`: Save current frame as PNG
- `Mouse wheel`: Zoom in/out
- `Click + drag` (when zoomed): Pan

## Requirements

- Modern browser (Chrome / Edge recommended for the web build)
- For ProRes in the web build: internet access (FFmpeg.wasm + core downloaded from jsdelivr/unpkg)
- For the desktop build: nothing — FFmpeg ships embedded

## Notes

- Remote stream capture may fail if the source server blocks canvas access (CORS).
- For GitHub Pages, prefer HTTPS media URLs.
- The web build's ProRes transcoder is constrained by the WASM 4 GB heap. The
  desktop build sidesteps this entirely.

## License

[MIT](./LICENSE)
