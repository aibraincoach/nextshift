# NextShift — Project Lifespan Catalog

A chronological record of what was built, why, what broke in review, and what shipped.
Written so a new agent or teammate can pick up cold.

**Live:** [nextshift.vercel.app](https://nextshift.vercel.app/)  
**Repo:** [github.com/aibraincoach/nextshift](https://github.com/aibraincoach/nextshift)  
**Product brief:** [`BUILD_PLAN.md`](../BUILD_PLAN.md)  
**Agent rules:** [`AGENTS.md`](../AGENTS.md) · [`planning.md`](../planning.md) · [`tasks.md`](../tasks.md)

---

## Product in one sentence

NextShift turns a worker’s real cash-flow gap into an actionable earnings plan, then matches that worker with shifts, jobs, and coworker-released shifts that close the gap. Budgeting is the calculation engine; the marketplace is the action layer.

Final product hierarchy (after PR #2 / #3):

1. User sets **needs** and/or a goal: “I need $___ by ___.”
2. App shows **exact shortfall dates** and daily runway.
3. User **claims** matched work that closes the gap (or is warned before releasing a shift that recreates one).

---

## Timeline

### Day 0 — Scaffold and data (2026-07-29)

| Step | What happened |
| --- | --- |
| Empty repo | `create-next-app` (App Router, TypeScript, Tailwind, `src/`) + `papaparse`, `recharts`, `lucide-react` |
| Data | Six CSVs into `public/data/`. Early downloads of `workers.csv`, `daily_earnings.csv`, `recurring_obligations.csv` were 502 HTML pages; re-downloaded and validated. |
| Normalize | `scripts/normalize-data.mjs` → `public/generated/app-data.json` (220 workers, per-worker financials, synthetic assigned shifts). `demoToday = 2026-07-06`. |
| GitHub | Private repo `aibraincoach/nextshift` created and pushed. |
| Vercel | Auto-deploy wired to `main` → [nextshift.vercel.app](https://nextshift.vercel.app/). |

**Personas (seeded):**

| ID | Role | Why |
| --- | --- | --- |
| W-0014 | Calgary gig delivery | Negative balance, visible shortfall |
| W-0087 | Calgary cleaning / janitorial | Advance-dependent |
| W-0183 | Edmonton event staff | Rent looming |

---

### Shared contract (foundation, still non-negotiable)

Built once so parallel agents could share one API surface:

| Layer | Path | Role |
| --- | --- | --- |
| Types | `src/types/index.ts` | Worker, obligations, opportunities, `CashPlan`, etc. |
| Engine | `src/lib/engine/plan.ts` | `buildCashPlan`, impacts, dates, money formatters |
| Match | `src/lib/engine/match.ts` | Transparent 100-pt score (gap / role / city / availability / payout) |
| EWA | `src/lib/engine/ewa.ts` | Advance vs. shift comparison from real fee history |
| State | `src/lib/storage/demoState.ts` | localStorage via `useSyncExternalStore` |
| Data | `src/lib/data/useAppData.tsx` | Provider; `planOptions` reflects claims, releases, savings, needs |
| Fixtures | `public/fixtures/opportunities.json` | Synthetic Alberta marketplace inventory |

Agent memory bank: `AGENTS.md`, `planning.md`, `tasks.md` (+ `CLAUDE.md` → `@AGENTS.md`).

---

### PR #1 — MVP ([merged](https://github.com/aibraincoach/nextshift/pull/1))

**Branch:** `feature/full-app`  
**Commit theme:** Working product loop on three parallel agents (dashboard / marketplace / employer).

Shipped:

- Worker dashboard: cash-gap hero, metric cards, runway chart, advance-vs-shift
- Marketplace: Shifts / Jobs / Swaps, match scores, claim flow
- My shifts: release with financial-impact warning
- Plan + savings pages
- Employer view: open/released shifts, post forms, aggregate labour-market stats (no private budgets)
- Engine: gap measured from **tomorrow onward** so claimed earnings can close it; urgent same-day fixtures (OP-017 / OP-018)

**Review triage (selected):**

| Finding | Disposition |
| --- | --- |
| Biweekly obligations wrong across month boundaries | **Fixed** — anchor + every 14 days |
| Overnight `endHour: 29` display | **Fixed** — `fmtHour` wraps past midnight |
| Buffer-days absurd when spend ≈ $0 | **Fixed** — floor $5/day for display math |
| Posted shifts missing `employerId` (“blocker”) | **Discarded** — provider stamps `EMP-POSTED` |
| SSR localStorage cache leak | **Discarded** — `"use client"` + `window` guard |

---

### PR #2 — Budget-first ([merged](https://github.com/aibraincoach/nextshift/pull/2))

**Branch:** `feature/budget-first`  
**Founder direction:** *“NextShift is a budget-first daily cashflow planner. Users set needs, see exact shortfall dates, then claim a matched shift or job that closes that gap. The marketplace is the action layer, not the product’s starting point.”*

Shipped:

- Engine/state: `NeedsSettings` — `bufferDays`, `dailySpendCad`, `excludedObligationIds` (per worker)
- New `/needs` page
- Dashboard hierarchy: budget strip → shortfall hero → runway → “Close this gap” → advance comparison
- Nav: Today \| Plan \| Find Work \| My Shifts
- Plan page leads with exact shortfall date

**Critical review fix:**

> Engine secretly padded every buffer: `dailySpend × days + $40` (plus a $40 floor).

That violated “user sets the budget.” **Removed.** Buffer target is exactly `bufferDays × dailySpend`. Retested: W-0014 shortfall still closes via OP-017.

Other review items: type unification (`WorkerNeeds = NeedsSettings`), zero `safeToSave` while goal short (landed with PR #3 triage), no-gap CTA, stale “small pad” copy. Two “High” findings (zero-spend never gaps; `undefined` doesn’t clear keys) were **false alarms** and discarded with rationale on the PR.

---

### PR #3 — Goal-first ([merged](https://github.com/aibraincoach/nextshift/pull/3))

**Branch:** `feature/goal-first`  
**Problem statement:** *NextShift currently guesses what the worker needs. Rework so the user first enters “I need $___ by ___.” Historical data only prefills and stays editable.*

Shipped:

- Engine: `goalAmountCad` + `goalByDate` become the **primary gap** when set; projection extends through goal date; late-payout shifts don’t reduce the goal shortfall; `expectedDailyNetCad` editable override
- `GoalSetter` as first dashboard input (history prefill, edit/clear)
- Goal-led hero, daily shortfall strip, goal framing in Close-this-gap / plan / marketplace
- Marketplace: “covers N% of your goal”; detail warns when payout is after goal date

Verified edges: goal date = today works; `expectedDailyNetCad = 0` produces no NaN.

---

### PR #4 — Modernist mobile redesign ([open](https://github.com/aibraincoach/nextshift/pull/4))

**Branch:** `feature/modernist-redesign`  
**Handoff:** Claude Design zip — Modernist system (Archivo, light ground, accent `#ec3013` via tokens, **0px radius**, 2px rules).

Scope (all worker screens in one PR, per founder — not a phased chrome-only ship):

| Screen | Route |
| --- | --- |
| Today (ink hero) | `/` |
| Plan | `/plan` |
| Find work | `/marketplace` |
| Opportunity detail | `/marketplace/[id]` |
| My shifts | `/my-shifts` |
| Needs | `/needs` |
| Savings | `/savings` |

Also: shared chrome (TopBar, DEMO persona strip, bottom tabs); light token pass on employer so it isn’t stranded on the old dark palette.

**Design decisions locked:**

- Hero: **ink** (big red shortfall on light ground). Red poster is an unused alternate.
- `$0` buffer / daily spend for W-0014 is **intentional** — engine output with `avgDailyEssentialSpendCad ≈ $0.18` and `maximumFractionDigits: 0`. Not a UI bug. A spend floor would be an engine product change.
- Tokens: port `:root` from design-system `styles.css`; map Tailwind theme to those vars — **do not hard-code Modernist hexes** in components.

---

## Architecture snapshot (current)

```
financial gap / user goal
        ↓
buildCashPlan(+ planOptions: claims, releases, savings, needs)
        ↓
dashboard shortfall date + runway
        ↓
scoreOpportunity → claim / release
        ↓
recalculated runway (localStorage)
```

**Routes**

| Path | Role |
| --- | --- |
| `/` | Today — goal, shortfall, runway, close gap |
| `/plan` | Day-by-day projection |
| `/needs` | Buffer, spend, income, obligation toggles, goal |
| `/savings` | Pay-yourself-first rate |
| `/marketplace` | Shifts / Jobs / Swaps |
| `/marketplace/[id]` | Detail, claim, before/after, EWA compare |
| `/my-shifts` | Assigned / claimed / released |
| `/employer`, `/employer/post` | Mock employer staffing |

**Out of scope (hackathon):** auth, real payroll, payments, ML matching, backend DB, notifications.

---

## Demo script (still valid)

1. Select **Gig delivery** (W-0014).
2. See shortfall amount + date on Today (numbers from engine; may show `$0` buffer — expected).
3. Optionally set goal “I need $___ by ___.”
4. Claim **Evening delivery block (urgent)** (OP-017) → gap → $0.
5. Try releasing a Saturday assigned shift → amber shortfall warning.
6. Employer view: released shift / claims visible without private budgets.
7. **Reset demo** in DEMO strip for a clean re-run.

---

## Known quirks / product flags

| Quirk | Notes |
| --- | --- |
| Near-zero essential spend (W-0014) | Buffer rounds to `$0`. Product may later floor daily spend (engine change). |
| Synthetic marketplace + assigned shifts | Fixtures + normalize script; not in source CSVs. |
| Demo date frozen | `2026-07-06` — all opportunity `dayOffset`s relative to this. |
| Employer privacy | Only aggregate gap counts; never worker budgets. |
| Parallel agent workflow | Contract files listed in `planning.md` must not be casually rewritten mid-feature. |

---

## PR index

| PR | Title | Status |
| --- | --- | --- |
| [#1](https://github.com/aibraincoach/nextshift/pull/1) | MVP: dashboard, marketplace, claim/release, employer | Merged |
| [#2](https://github.com/aibraincoach/nextshift/pull/2) | Budget-first hierarchy | Merged |
| [#3](https://github.com/aibraincoach/nextshift/pull/3) | Goal-first (“I need $X by DATE”) | Merged |
| [#4](https://github.com/aibraincoach/nextshift/pull/4) | Modernist mobile redesign | Open |
| This PR | Lifespan docs catalog | Open |

---

## How to continue (agents)

1. Read `planning.md`, `AGENTS.md`, `tasks.md`, then this file.
2. Prefer small PRs that don’t break the shared contract.
3. After work: tick `tasks.md` with a timestamp; add discovered tasks.
4. `npx next build` must stay green.
5. Money via `fmtMoney`, dates via `fmtDate`, CAD only; never call `localStorage` outside `useDemoState`.
