# HEYDUDE — Agent Instructions

## Overview
- **Domain:** *.pages.dev (internal tool, no custom domain)
- **Stack:** React 19 + Vite 8 + TypeScript 6 + Vitest
- **Deploy:** Cloudflare Pages
- **Package Manager:** npm
- **Type:** Internal agent console (NOT a public website)
- **ACCESS_REQUIRED:** 1

## Key Commands
```bash
npm install
npm run dev       # Vite dev server
npm run build     # tsc -b && vite build
npm run preview   # Vite preview of production build
npm run test      # vitest run
npm run lint      # eslint .
```

## Structure
- `src/` — React application source
- `functions/` — Cloudflare Pages Functions (server-side)
- `scripts/` — utility scripts

## Constraints
- Deploy through Cloudflare Pages only
- This is an internal tool — not customer-facing, no SEO needed
- Secrets from global.env, never hardcode
- Must pass `npm run build` and `npm run test` before deploy
- Uses @cloudflare/workers-types for Pages Functions typing
- React 19 — use modern React patterns (no legacy lifecycle)
