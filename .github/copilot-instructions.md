# GitHub Copilot Instructions — NEM Live

## Project Overview
Real-time Australian National Electricity Market (NEM) dashboard. Displays live spot prices by region with auto-refresh every 30 seconds. React 19 + Vite, using Recharts for visualisation.

## Tech Stack
- **Framework:** React 19 (JSX, no TypeScript)
- **Build:** Vite 7
- **Charts:** Recharts 3
- **Linting:** ESLint 9 (flat config)

## Architecture
```
src/
  App.jsx       → Main component: fetches NEM data, renders bar chart per region
  App.css       → Styles
  main.jsx      → React root mount
```

## Key Conventions
- Functional components with hooks only (no class components)
- Colour-coded price thresholds: negative → pink, <$50 → green, ≤$100 → orange, >$100 → red
- NEM regions: NSW1, QLD1, SA1, TAS1, VIC1 — always use these string codes
- Auto-refresh via `setInterval` in `useEffect` — always clear on unmount
- No TypeScript — plain JSX only

## Commands
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

## Patterns to Follow
- Keep all price/colour logic in a single helper function (`getPriceColor`)
- REFRESH_INTERVAL constant controls polling — do not hardcode the value elsewhere
- Recharts `ResponsiveContainer` wraps all charts — always maintain this pattern
