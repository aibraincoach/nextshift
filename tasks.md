# NextShift Tasks (living roadmap)

Tick with a timestamp when done. Add discovered tasks under the right area.

## Foundation (done)
- [x] Scaffold Next.js + deps (2026-07-29 19:15)
- [x] Copy CSVs + BUILD_PLAN.md (2026-07-29 19:17)
- [x] GitHub repo created and pushed (2026-07-29 19:18)
- [x] normalize-data.mjs -> public/generated/app-data.json (2026-07-29 19:21)
- [x] Types, engine (plan/match/ewa), demoState, useAppData provider (2026-07-29 19:25)
- [x] Root layout with AppDataProvider, TopBar, BottomNav (2026-07-29 19:27)
- [x] Shared components: WorkerSwitcher, MetricCard, DemoResetButton (2026-07-29 19:27)
- [x] Marketplace fixtures (2026-07-29 19:24)

## Area A: Worker dashboard + plan + savings (owner: agent A)
- [x] `/` dashboard: CashGapHero (big dollar target + deadline), 5 MetricCards (Available now, Next obligation, Runway days, Earnings needed, Safe to save), UpcomingObligations list, RunwayChart (recharts 7-day projected balance with buffer line), AdvanceVsShift card (compareAdvanceVsShift vs best-scoring shift), Find-a-shift + View-my-plan buttons, WorkerSwitcher + DemoResetButton (2026-07-29 19:35)
- [x] `/plan`: full 7-day table (earnings, obligations, spend, ending balance per day), buffer explanation, 30-day upcoming obligations list (2026-07-29 19:35)
- [x] `/savings`: savings rate control (off/2%/5%/custom), safe-to-save explainer, effect on runway (2026-07-29 19:35)
- [x] Loading + error + empty states for all three pages (2026-07-29 19:35)

## Area B: Marketplace + my-shifts (owner: agent B)
- [x] `/marketplace`: tabs Shifts | Jobs | Shift swaps, OpportunityCard (employer, role, date/hours via fmtDate + opportunityDate, city, est. net, match reason via scoreOpportunity/primaryReason, runway improvement via opportunityImpact), sorted by score desc, claimed items badged (2026-07-29 19:41)
- [x] `/marketplace/[id]`: detail with before/after gap (opportunityImpact with planOptions), match-score breakdown, EWA comparison when gap>0, Claim button (claim/unclaim via useDemoState), jobs show weekly net + jobMonthlySurplus (2026-07-29 19:41)
- [x] `/my-shifts`: assigned shifts (financials.assignedShifts minus released), claimed opportunities, ReleaseShiftDialog with releaseImpact warning (creates-gap amber warning with date), released shifts listed as "In marketplace" (2026-07-29 19:41)
- [x] Loading + error + empty states (2026-07-29 19:41)

## Area C: Employer view (owner: agent C)
- [x] `/employer`: mock company header (Chinook Warehousing), open shifts list (fixtures for EMP-901 + posted), released employee shifts (type released-shift), claim status from demo state, eligible-worker aggregate counts computed from data.workers/financials (workers with cashGap>0 via buildCashPlan — compute across all 220, memoized), no private budget details (counts only) (2026-07-29 19:35)
- [x] `/employer/post`: post shift + post job forms -> postOpportunity (dayOffset from date input relative to demoToday), success panel with mock match summary (eligible workers, N with predicted gap in 7 days, M role+city match) (2026-07-29 19:35)
- [x] Loading + error states (2026-07-29 19:35)

## PR2: budget-first (owner: agent A — dashboard + nav)
- [x] `/` hierarchy: Your budget strip → shortfall hero → runway → Close this gap action layer → AdvanceVsShift (2026-07-29 20:00)
- [x] BudgetSummary: buffer target, daily spend (needs override), next obligation, Edit needs → /needs (2026-07-29 20:00)
- [x] CashGapHero: date-led shortfall / budget-holds copy; marketplace CTA removed from hero (2026-07-29 20:00)
- [x] CloseThisGap: top 3 scoreOpportunity matches that reduce gap, compact rows → /marketplace/[id], See all work (2026-07-29 20:00)
- [x] BottomNav reorder: Today | Plan | Find Work | My Shifts (2026-07-29 20:00)
- [x] Verify tsc --noEmit + eslint on owned files (2026-07-29 20:00)

## PR2: budget-first
- [x] `/needs` page: buffer presets (1/2/3/5 days), daily spending input with 28-day estimate + "use estimate" reset, obligation toggles (excludedObligationIds), live gap/covered result panel with Find-work / View-plan CTA, WorkerSwitcher + loading/error/empty states (agent B, 2026-07-29 20:05)
- [x] `/plan` rework: shortfall date+amount header (or covered-through), amber left-border + "short $X" chip on below-buffer rows, Edit needs link, Close this gap link when gap > 0 (agent B, 2026-07-29 20:05)

## PR3: goal-first (owner: agent A — dashboard + needs)
- [x] GoalSetter: first dashboard input, history-prefill amount/date, set/edit/clear via setNeeds (2026-07-29 20:20)
- [x] CashGapHero: goal-led on-track / shortfall copy; buffer hint when no goal (2026-07-29 20:20)
- [x] DailyShortfalls: horizontal weekday strip under hero (emerald/amber dots + shortfall amounts) (2026-07-29 20:20)
- [x] CloseThisGap: goal-framed section title when plan.goal set (2026-07-29 20:20)
- [x] `/needs`: goal section + expected daily income input with use-estimate reset (2026-07-29 20:20)
- [x] Verify tsc --noEmit + eslint on owned files (2026-07-29 20:20)

## PR3: goal-first (owner: agent B — plan + marketplace)
- [x] `/plan`: goal-first header (on track / short), goal-day row chip, Set a goal link when no goal (2026-07-29 20:15)
- [x] `/marketplace`: goal shortfall banner above tabs, pass goalShortfallCad to cards (2026-07-29 20:15)
- [x] `OpportunityCard`: goal coverage % line when goalShortfallCad set (2026-07-29 20:15)
- [x] `/marketplace/[id]`: goal before/after copy, late-payout amber note (2026-07-29 20:15)
- [x] Verify tsc --noEmit + eslint on owned files (2026-07-29 20:15)

## PR4: Modernist redesign (feature/modernist-redesign)
- [x] Port Modernist tokens + component classes; Archivo via next/font; shared chrome (TopBar, DemoStrip, BottomNav) (2026-08-01 06:45)
- [x] `/` Today: ink hero, budget strip, goal, week glance, runway, obligations, close gap, advance vs shift (2026-08-01 06:45)
- [x] `/plan` `/needs` `/savings` Modernist restyle (2026-08-01 06:45)
- [x] `/marketplace` list + detail + my-shifts + light employer pass (2026-08-01 06:45)
- [x] Build green; no hard-coded Modernist hexes in Tailwind theme (2026-08-01 06:45)

## Cover sheet (feature/cover-sheet)
- [x] Cover landing at `/`; Today dashboard moved to `/today`; nav/chrome updates (2026-08-01 13:55)
- [x] Metadata + CTAs (demo, GitHub, build story); production build green (2026-08-01 13:55)

## Integration (owner: main agent)
- [x] Verify npx next build green after merges
- [x] Demo walkthrough check: claim OP-017 closes W-0014 gap; release Saturday shift warns
- [x] Push to GitHub / Vercel live at nextshift.vercel.app
- [x] Merge Modernist redesign PR #4 (2026-08-01)
- [x] Docs lifespan catalog updated through cover sheet + credits (2026-08-01)
- [x] Merge docs PR #5, then cover sheet PR #6 (2026-08-01)
