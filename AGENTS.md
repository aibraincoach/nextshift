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
