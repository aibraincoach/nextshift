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
- [ ] `/` dashboard: CashGapHero (big dollar target + deadline), 5 MetricCards (Available now, Next obligation, Runway days, Earnings needed, Safe to save), UpcomingObligations list, RunwayChart (recharts 7-day projected balance with buffer line), AdvanceVsShift card (compareAdvanceVsShift vs best-scoring shift), Find-a-shift + View-my-plan buttons, WorkerSwitcher + DemoResetButton
- [ ] `/plan`: full 7-day table (earnings, obligations, spend, ending balance per day), buffer explanation, 30-day upcoming obligations list
- [ ] `/savings`: savings rate control (off/2%/5%/custom), safe-to-save explainer, effect on runway
- [ ] Loading + error + empty states for all three pages

## Area B: Marketplace + my-shifts (owner: agent B)
- [ ] `/marketplace`: tabs Shifts | Jobs | Shift swaps, OpportunityCard (employer, role, date/hours via fmtDate + opportunityDate, city, est. net, match reason via scoreOpportunity/primaryReason, runway improvement via opportunityImpact), sorted by score desc, claimed items badged
- [ ] `/marketplace/[id]`: detail with before/after gap (opportunityImpact with planOptions), match-score breakdown, EWA comparison when gap>0, Claim button (claim/unclaim via useDemoState), jobs show weekly net + jobMonthlySurplus
- [ ] `/my-shifts`: assigned shifts (financials.assignedShifts minus released), claimed opportunities, ReleaseShiftDialog with releaseImpact warning (creates-gap amber warning with date), released shifts listed as "In marketplace"
- [ ] Loading + error + empty states

## Area C: Employer view (owner: agent C)
- [ ] `/employer`: mock company header (Chinook Warehousing), open shifts list (fixtures for EMP-901 + posted), released employee shifts (type released-shift), claim status from demo state, eligible-worker aggregate counts computed from data.workers/financials (workers with cashGap>0 via buildCashPlan — compute across all 220, memoized), no private budget details (counts only)
- [ ] `/employer/post`: post shift + post job forms -> postOpportunity (dayOffset from date input relative to demoToday), success panel with mock match summary (eligible workers, N with predicted gap in 7 days, M role+city match)
- [ ] Loading + error states

## Integration (owner: main agent)
- [ ] Verify npx next build green after merges
- [ ] Demo walkthrough check: claim OP-001 closes W-0014 gap; release Saturday shift warns
- [ ] Push to GitHub
- [ ] Deploy to Vercel (waiting on user credentials/info)
