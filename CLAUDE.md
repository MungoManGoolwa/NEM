# NEM Live — Australian Electricity Market Visualization

## Project
Real-time electricity market visualization for Australia's National Energy Market. Displays live prices and generation data across 5 regions (NSW, QLD, SA, TAS, VIC) from AEMO API.

## Tech Stack
- **Framework:** React 19, Vite 7
- **Charting:** Recharts 3.7
- **Styling:** CSS3 (custom dark theme, responsive)
- **Linting:** ESLint 9
- **API:** AEMO (Australian Energy Market Operator)

## Architecture
```
src/
  main.jsx       → React entry point
  App.jsx        → Main component (270 lines): RegionCard, PriceChart, GenerationChart
  App.css        → Dark theme, responsive grid
  index.css      → Global styles
public/          → Static assets
vite.config.js   → Vite config with AEMO API proxy
```

## Data Flow
- Fetches from `/api/aemo/ELEC_NEM_SUMMARY` (proxied in dev via Vite)
- Auto-refresh every 30 seconds with countdown timer
- Price color coding: green (<$50), orange ($50-100), red (>$100), pink (negative)

## Responsive Grid
- 5-column at 1300px+
- 3-column at <1300px
- 2-column at <900px
- 1-column at <600px

## Key Commands
```bash
npm run dev       # Dev server with HMR
npm run build     # Production build → dist/
npm run preview   # Preview production build
npm run lint      # ESLint
```

## Notes
- Frontend-only SPA — no backend, no database
- Deployable to any static host (Vercel, Netlify, GitHub Pages, S3+CloudFront)
- No tests configured
- No CI/CD pipeline
