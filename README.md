# Drawing App

A modern drawing application built with Tauri 2.x, TypeScript, and HTML5 Canvas. Features pressure-sensitive input, infinite tiled canvas, and runs as both a desktop (Tauri) and web app.

## Features
- Infinite, high-performance tiled canvas
- Pressure-sensitive drawing (Wacom/tablet support)
- Pen and eraser tools
- Adjustable brush size and color
- Save as PNG (to disk in Tauri, download in browser)
- Keyboard shortcuts
- Responsive, modern UI
- Runs as a Tauri desktop app or in any modern web browser

## Prerequisites
- Node.js (v18 or later)
- npm
- Rust (for Tauri desktop build)
- Tauri CLI: `npm install -g @tauri-apps/cli`

## Build & Run

### Desktop (Tauri)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start in development mode:
   ```bash
   npm run tauri:dev
   ```
3. Build for production:
   ```bash
   npm run tauri:build
   ```
   The built app will be in `src-tauri/target/release/bundle/`.

### Web (Browser)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.
3. Build for production:
   ```bash
   npm run build:web
   ```
   The static site will be in the `dist/` folder. You can deploy this to any static web host.

## Platform Detection
- The app auto-detects if it is running in Tauri or the browser.
- The "Save" button will save to disk (Downloads folder) in Tauri, or trigger a PNG download in the browser.

## Scripts
- `npm run dev` — Start Vite dev server (web)
- `npm run build:web` — Build static web app
- `npm run tauri:dev` — Start Tauri app in dev mode
- `npm run tauri:build` — Build Tauri desktop app

## File Structure
```
drawing-app/
├── src/           # Frontend source code (TypeScript)
│   ├── main.ts
│   ├── canvas.ts
│   ├── tiles.ts
│   ├── tools.ts
│   ├── ui.ts
│   └── platform.ts
├── index.html     # Main HTML file
├── src-tauri/     # Tauri backend (Rust)
├── package.json
└── README.md
```

## License
MIT
