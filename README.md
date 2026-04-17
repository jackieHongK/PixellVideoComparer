# HLS/Video Comparer

A browser-based video comparison tool for fast before/after quality checks.

## Why this exists

Comparing quality-improved output against the original is usually annoying:

- Two separate players are hard to sync.
- Side-by-side layout needs constant manual resizing.
- Repeating this workflow for many clips wastes time.

This project solves that with a single HTML app you can run directly in a browser.

## What it does

- Multi-view comparison layouts
  - `1x2` (default)
  - `2x2`
  - `1x4`
  - `1x3`
- Drag-and-drop media loading
  - Local files
  - URL input
  - HLS (`.m3u8`) via `hls.js`
- Sync and navigation controls
  - Play/pause, seek, frame stepping, speed control
- Zoom/crop inspection
  - Mouse wheel zoom
  - Left/right 50% crop toggle
- Real-time monitoring panel
  - Bandwidth, latency, buffer, dropped frames, errors
- Still-frame capture
  - Button or `C` shortcut
  - Saves PNGs using `sourceName_still_YYYYMMDD-hhmmss.png`
  - Captures full native video frame resolution (independent of zoom/crop)

## Removed in this version

- Playlist feature has been removed.

## Run locally

1. Open `index.html` in a modern browser.
2. Drag files into each player (or paste URL + Enter).
3. Pick a layout and compare.
4. Press `C` (or click `Capture`) to export current frames.

## Free hosting on GitHub Pages

This is a static app, so GitHub Pages hosting is free.

1. Push this repository to GitHub.
2. Go to `Settings -> Pages`.
3. Set `Source` to `Deploy from a branch`.
4. Select `main` and `/ (root)`.
5. Save and wait for deployment.

Your site URL will be:

- `https://<username>.github.io/<repo-name>/`

## Keyboard shortcuts

- `Space`: Play/Pause
- `R`: Time sync
- `0~9`: Jump to 0~90% timeline position
- `-`: Jump to latest buffered segment
- `S`: Toggle left/right 50% crop
- `M`: Toggle monitoring panel
- `F`: Fullscreen
- `Left/Right`: Step frame
- `Shift + Left/Right`: Step 10 frames
- `Shift + < / >`: Adjust playback speed
- `C`: Save current frame as PNG
- `Mouse wheel`: Zoom in/out

## Requirements

- Modern browser (Chrome/Edge recommended)
- Internet access for CDN-loaded `hls.js`

## Notes

- Remote stream capture may fail if the source server blocks canvas access (CORS).
- For GitHub Pages, prefer HTTPS media URLs.

## License

[MIT](./LICENSE)
