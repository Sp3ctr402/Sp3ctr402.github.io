# PHNX Personal Site

Performante Single-Page-Website für GitHub Pages mit PHNX-Branding, Dark/Light Mode und Navigation ohne Seitenreload.

## Architektur

### Warum **kein klassisches Backend**?
GitHub Pages ist ein **statischer Hosting-Dienst für HTML, CSS und JavaScript**. Ein klassischer Server mit Node/Express, PHP oder Python läuft dort nicht. Für dieses Setup ist das sogar sinnvoll: Portfolio, Career und Blog werden als statische Inhalte ausgeliefert und clientseitig in derselben Shell gerendert.

### Was hier stattdessen gebaut wurde
- **Single Page App** mit Vite + TypeScript
- **Hash-Routing** (`#/`, `#/career`, `#/blog`) für GitHub Pages ohne Reloads
- **Statischer Content-Layer** über `public/content/*.json`
- **Theme-Persistenz** via `localStorage`
- **Preloading** für Hero-Asset und sekundäre Views
- **View Transitions** als progressive Verbesserung

## Start

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Das Produktionsbuild landet in `dist/`.

## Deployment auf GitHub Pages

GitHub Pages kann Inhalte direkt aus einem Branch publizieren oder über einen GitHub-Actions-Workflow veröffentlichen. Für Vite-Projekte ist GitHub Actions der sauberste Weg.

### Option A – direkt aus `dist/` deployen
1. `npm run build`
2. Inhalt von `dist/` auf einen `gh-pages`-Branch veröffentlichen
3. In den Repository-Einstellungen unter **Pages** den Veröffentlichungsweg konfigurieren

### Option B – mit GitHub Actions
1. In GitHub unter **Settings → Pages** als Quelle **GitHub Actions** wählen
2. Einen Build-and-Deploy-Workflow hinzufügen

Beispielworkflow:

```yaml
name: Deploy Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Wo du Inhalte änderst
- `src/main.ts` → Owner, Social Links, Home-Content
- `public/content/career.json` → Career-Bereich
- `public/content/blog.json` → Blog-Bereich
- `public/phnx-logo.png` → Logo
- `public/hero-ambient.webp` → Hero-Hintergrund

## Wenn du später ein echtes Backend willst
GitHub Pages bleibt statisch. Für Formulare, CMS, Auth oder dynamische Blogposts brauchst du einen externen Dienst, z. B.:
- **Cloudflare Workers / Pages Functions**
- **Supabase**
- **Firebase**
- **Headless CMS + Build-Time Rendering**

Sauber wäre dann: GitHub Pages für die UI behalten und nur die Daten-/API-Schicht auslagern.
