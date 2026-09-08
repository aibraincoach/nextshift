# Agent Rules for NextShift

1. Read `planning.md` and `tasks.md` before writing any code. `BUILD_PLAN.md` has full product logic.
2. Never modify the shared contract files listed in `planning.md` (types, engine, storage, data provider, generated data, fixtures). Build on top of them.
3. All pages are client components (`"use client"`) and must render inside `AppDataProvider` (already wired in the root layout). Handle `loading` and `error` from `useAppData()`.
4. Never call `localStorage` directly; use `useDemoState()`.
5. Money via `fmtMoney`, dates via `fmtDate`. Currency is CAD.
6. Do not add dependencies. Available: recharts, lucide-react, papaparse (unused at runtime).
7. Keep files under `src/components/<area>/` for the area you own; do not edit another area's components.
8. After finishing a task, tick it in `tasks.md` with a timestamp. Add newly discovered tasks there.
9. Run `npx next build` must stay green; fix your own type errors.
10. Guard against hydration mismatches: demo state renders after mount (useDemoState already handles SSR fallback).

<!-- BEGIN OWNER CI POLICY 2026-09-08 -->
## CI execution and spending — owner ruling, 2026-09-08

Read [CI_POLICY.md](CI_POLICY.md) before changing verification or deployment.
GitHub Actions is disabled repository-wide, including self-hosted and manual
workflows. Use verified Vercel/Cloudflare automation within existing allowances;
no additional paid usage, upgrades, local-machine fallback, or silent loss of
required checks. A blocked replacement stays blocked. This ruling supersedes
older instructions to run/re-enable Actions, buy CI capacity, or treat a green
deployment as proof that unconfigured tests ran. Other product rules remain.
<!-- END OWNER CI POLICY 2026-09-08 -->
