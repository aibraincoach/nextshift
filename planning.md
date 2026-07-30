# NextShift — Architecture and Vision

## Vision
NextShift turns a worker's real cash-flow gap into an actionable earnings plan, then matches the worker with shifts, jobs, and coworker-released shifts that close the gap. Budgeting is the calculation engine, not the product. See BUILD_PLAN.md for full product logic.

## Stack
- Next.js App Router + TypeScript + Tailwind CSS 4 (scaffolded, `src/` dir, `@/*` alias)
- Static app: no database, no auth, no API routes. Everything runs client-side.
- Data: `public/generated/app-data.json` (built by `node scripts/normalize-data.mjs` from the six CSVs in `public/data/`). Do NOT parse CSVs at runtime.
- Fixtures: `public/fixtures/opportunities.json` (synthetic marketplace inventory).
- State: localStorage via `src/lib/storage/demoState.ts` (`useDemoState()` hook).
- Charts: recharts. Icons: lucide-react.
- Deploy target: Vercel.

## Non-negotiable shared contract (already built — do not modify these files)
- `src/types/index.ts` — all shared types.
- `src/lib/engine/plan.ts` — `buildCashPlan`, `opportunityImpact`, `releaseImpact`, `obligationDates`, `addDays`, `fmtDate`, `fmtMoney`, `opportunityDate`, `opportunityPayoutDate`.
- `src/lib/engine/match.ts` — `scoreOpportunity` (transparent 100-pt matching engine), `primaryReason`, `jobMonthlySurplus`.
- `src/lib/engine/ewa.ts` — `compareAdvanceVsShift` (advance-vs-shift comparison).
- `src/lib/storage/demoState.ts` — `useDemoState()` returning `{ state, update, claim, unclaim, releaseShift, postOpportunity, reset }`.
- `src/lib/data/useAppData.tsx` — `AppDataProvider` + `useAppData()` returning `{ loading, error, data, opportunities, worker, financials, demoToday, planOptions }`. `planOptions` already reflects claims/releases/savings; pass it into engine functions.
- `scripts/normalize-data.mjs`, `public/generated/app-data.json`, `public/fixtures/opportunities.json`.

## Demo facts
- `demoToday` = 2026-07-06 (Monday). All opportunity dates are `demoToday + dayOffset`.
- Personas (selector on every worker page): W-0014 (Calgary gig driver, negative balance), W-0087 (Calgary cleaner, advance-dependent), W-0183 (Edmonton event staff, rent looming).
- Currency: CAD, format with `fmtMoney`.

## Routes
- `/` worker dashboard, `/marketplace` (+ `/marketplace/[id]`), `/my-shifts`, `/plan`, `/savings` — worker nav: Today | Find Work | My Shifts | Plan.
- `/employer`, `/employer/post` — separate employer area, mock company.

## Visual direction
Mobile-first, max-w-md centered column for worker pages; large dollar hero; plain language; clear dates on warnings; no shame-red everywhere; strong before/after states. Dark-friendly neutral palette with a single accent (emerald for positive, amber for warnings).
