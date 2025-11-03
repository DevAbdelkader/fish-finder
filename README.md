# Fish Finder v2

## User perspective

Fish Finder v2 is a lightweight web app that helps you explore a curated collection of 3D fish models and related assets. Open the site in your browser and browse the gallery of fish, preview them, and play associated videos. The interface focuses on easy discovery and fast previews — no account or setup required for basic viewing.

Key user features
- Browse a gallery of fish models.
- View model previews.
- Fast, responsive UI powered by Vite.

## Developer perspective

This project is a small Vite-powered web app using TypeScript and vanilla JS for runtime logic. It loads models and media from the `public` and `models` folders and provides a minimal UI in `index.html` and `src/main.ts`.

Developer notes and contract
- Inputs: static files under `public/` (models, images, videos) and small JSON datasets (e.g. `public/data/fish.json`).
- Outputs: a client-side site built with Vite served by the dev server or a static build.
- Error modes: missing model/assets will show placeholders or console errors; the app expects assets referenced in the JSON files to exist under `public/`.
- Success criteria: site runs locally with `npm install` and `npm run dev`, and assets load from `public/`.

Quick dev setup (Windows / cmd.exe)

Open a terminal in the project root and run:

```
npm install
npm run dev
```

Then open the local dev URL shown by Vite (usually http://localhost:5173).

Project structure (important files)
- `index.html` — main HTML file and entry UI.
- `package.json` — project scripts and dependencies.
- `vite.config.ts`, `tsconfig.json` — build/dev configuration.
- `src/main.ts` — app bootstrap.
- `src/ModelLoader.js` — model loading utilities.
- `public/data/fish.json` — data describing fish assets.
- `public/images/`, `public/models/`, `public/videos/` — static assets.

## Models and asset attribution

Important: The 3D models, images, and other media included in this repository are not my original creations. They were collected from free resources on the internet (public-domain and permissively-licensed model repositories). Where possible, attribution files or source URLs are included near each asset in the `public/` folder (for example in adjacent README or OFL files in the `public/fonts/` and other asset folders).

If you are an asset owner and require additional attribution or removal, open an issue or contact.