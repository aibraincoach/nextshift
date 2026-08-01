# NextShift: Hackathon Build Plan

## 1. Product in one sentence

**NextShift turns a worker’s real cash-flow gap into an actionable earnings plan, then matches that worker with available shifts, longer-term jobs, and coworker-released shifts that close the gap.**

The budgeting layer is not the product. It is the calculation engine that tells the marketplace what the worker actually needs.

## 2. Why this is the right hackathon product

The supplied data already supports the core financial story:

- worker profiles
- daily earnings and shifts
- recurring obligations
- transaction ledger
- earned-wage advances
- weekly cash-flow summaries

That lets us calculate a credible worker-specific result such as:

> You need to earn **$86 by Friday** to cover rent and keep a two-day buffer.

The hackathon data does not include employer job postings, open shifts, or released shifts. Those should be added as clearly labelled demo fixtures.

## 3. Download the data now

Download all six CSV files and place them in:

```text
nextshift/public/data/
```

Use predictable filenames:

```text
workers.csv
earnings.csv
obligations.csv
transactions.csv
advances.csv
weekly_cashflow.csv
```

Also create three mock marketplace files:

```text
jobs.json
open-shifts.json
released-shifts.json
```

Point Cursor at the entire project folder. Include this plan as `BUILD_PLAN.md` in the repository so Cursor has the product logic, scope, and naming conventions.

## 4. Recommended stack

Use a static Next.js application. No database and no authentication are needed for the hackathon demo.

- Next.js App Router
- TypeScript
- Tailwind CSS
- Papa Parse for CSV ingestion
- Recharts for one simple runway chart
- Local storage for claimed/released shift state
- Static JSON fixtures for jobs and marketplace inventory

## 5. Bootstrap the app

From the empty `nextshift` directory:

```bash
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

npm install papaparse recharts lucide-react
npm install -D @types/papaparse
npm run dev
```

Then copy this plan into the repository root as `BUILD_PLAN.md`.

## 6. Product roles

### Worker

A worker can:

- see current cash position
- see upcoming obligations
- see predicted shortfall date
- see a specific earnings target
- browse matched shifts
- browse matched jobs
- claim a shift
- release one of their own shifts
- set an automatic savings percentage

### Employer

An employer can:

- post an open shift
- post a longer-term job
- see workers whose earnings needs and availability align
- review claimed shifts
- fill staffing gaps through existing employees or the wider marketplace

For the hackathon, the employer experience can be a separate route with mock company data.

## 7. Core problem statements

1. **Daily earners do not need another historical budget.** They need to know what action to take before the next bill is due.

2. **Irregular earnings and fixed obligations operate on different schedules.** A worker may earn enough over a month and still run out of money on Tuesday.

3. **Earned-wage advances solve timing, not income sufficiency.** Workers need visibility into whether an extra shift can prevent or reduce an advance.

4. **Workers waste time applying for jobs that do not meet their actual income requirements.** NextShift should show whether a role meaningfully closes their gap.

5. **Employers struggle to fill short-notice shifts.** Existing workers should be able to release shifts into a trusted marketplace where qualified coworkers can claim them.

6. **Traditional job marketplaces ignore financial urgency.** NextShift ranks opportunities by how well and how quickly they improve the worker’s runway.

7. **Saving is difficult when income is volatile.** A safe-to-save calculation should reserve a small amount only when upcoming obligations remain covered.

## 8. MVP feature scope

### A. Demo worker selector

Provide three seeded personas from the dataset:

- Calgary gig delivery driver
- Calgary cleaning or janitorial worker
- Edmonton security guard

Each persona should have visibly different income volatility and obligations.

### B. Today dashboard

The first screen should answer four questions:

1. How much money do I have now?
2. What bills are coming next?
3. When will I run short?
4. What can I do about it?

Recommended cards:

- **Available now**
- **Next obligation**
- **Runway** in days
- **Earnings needed** by a specific date
- **Safe to save today**

Hero example:

> Earn **$86 by Friday** to cover rent and preserve a two-day buffer.

Primary button:

> Find a shift

Secondary button:

> View my plan

### C. Seven-day runway

Show a simple daily projected balance chart.

Inputs:

- current ledger balance
- expected earnings
- recurring obligations by due date
- essential spending estimate
- advance repayment, when relevant

Display:

- green or neutral days above target buffer
- shortfall day
- effect of claiming a recommended shift

The chart should visibly update when a shift is claimed.

### D. Opportunity marketplace

Use three tabs:

1. **Shifts**
2. **Jobs**
3. **Shift swaps**

Every opportunity card should show:

- employer
- role
- date and hours
- location
- estimated take-home pay
- match reason
- resulting runway improvement

Example:

> Warehouse shift, Thursday 5–10 PM  
> Estimated net: **$104**  
> Covers your Friday gap and adds **1.4 buffer days**.

### E. Claim a shift

Claim flow:

1. Worker opens shift details.
2. App shows estimated net earnings.
3. App shows before-and-after runway.
4. Worker claims the shift.
5. Dashboard recalculates immediately.
6. Claimed state persists in local storage.

No real approval workflow is required. The demo can show `Claimed` or `Pending employer approval`.

### F. Release a shift

Worker flow:

1. Open `My shifts`.
2. Select an assigned shift.
3. Click `Release to marketplace`.
4. Confirm.
5. Shift appears under `Shift swaps`.

The app should warn the worker if releasing the shift creates a new cash gap.

Example:

> Releasing this shift will reduce expected earnings by $92 and create a $41 shortfall on Monday.

That warning strongly connects workforce scheduling to financial wellness.

### G. Jobs

Jobs are longer-term opportunities rather than immediate shifts.

Each job should show:

- hourly or salary range
- expected weekly net income
- estimated monthly surplus after obligations
- whether it satisfies the worker’s minimum income requirement

Example:

> This role is projected to leave you **$310 above recurring monthly obligations**.

### H. Pay yourself first

Provide a lightweight savings control:

- off
- 2%
- 5%
- custom

The app should calculate `safe to save`, not blindly deduct savings.

Example:

> Saving $8 from today’s pay keeps all bills covered and preserves your minimum buffer.

This is supportive, but it should not displace the shift marketplace as the central product.

### I. Employer view

Create `/employer` with:

- open shifts
- released employee shifts
- applicants or claimants
- post shift form
- post job form

When an employer posts a shift, show a mock result:

> 18 eligible workers  
> 7 workers have a predicted cash gap within seven days  
> 4 match the required role and availability

Do not expose private budget details to employers. Only expose a suitability score and worker-approved availability.

## 9. Data model

Create TypeScript interfaces under `src/types/`.

```ts
export interface Worker {
  workerId: string;
  city: string;
  province: string;
  occupation: string;
  payType: string;
  typicalDailyNetCad: number;
  incomeVolatility?: number;
  bankingAccess?: string;
  rentBurden?: number;
  dependents?: number;
}

export interface EarningShift {
  workerId: string;
  shiftDate: string;
  grossCad: number;
  tipsCad: number;
  deductionsCad: number;
  netCad: number;
  payoutTiming: string;
}

export interface Obligation {
  workerId: string;
  category: string;
  amountCad: number;
  dueDay: number;
  frequency: string;
}

export interface LedgerTransaction {
  workerId: string;
  date: string;
  amountCad: number;
  direction: "credit" | "debit";
  essential: boolean;
  runningBalanceCad: number;
}

export interface Advance {
  workerId: string;
  amountCad: number;
  feeCad: number;
  reason: string;
  repaymentStatus: string;
}

export interface Opportunity {
  id: string;
  type: "shift" | "job" | "released-shift";
  employerId: string;
  employerName: string;
  role: string;
  city: string;
  startAt?: string;
  endAt?: string;
  hourlyRateCad?: number;
  estimatedNetCad: number;
  requiredOccupation?: string;
  status: "open" | "claimed" | "filled";
}
```

Adjust field names after inspecting the actual CSV headers. Do not invent mappings without checking the downloaded files.

## 10. Data ingestion

### Fastest approach

Parse CSVs in the browser with Papa Parse and cache them in memory.

Create:

```text
src/lib/data/loadCsv.ts
src/lib/data/workers.ts
src/lib/data/earnings.ts
src/lib/data/obligations.ts
src/lib/data/transactions.ts
src/lib/data/advances.ts
src/lib/data/weeklyCashflow.ts
```

Generic loader:

```ts
import Papa from "papaparse";

export async function loadCsv<T>(path: string): Promise<T[]> {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  const csv = await response.text();
  const parsed = Papa.parse<T>(csv, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length) {
    console.warn(`CSV parse warnings for ${path}`, parsed.errors);
  }

  return parsed.data;
}
```

### Better hackathon approach

Add a one-time normalization script that converts CSV into compact JSON. This keeps the app fast and makes field mapping explicit.

```text
scripts/normalize-data.mjs
public/generated/workers.json
public/generated/worker-financials.json
```

Run:

```bash
node scripts/normalize-data.mjs
```

## 11. Core calculations

Create `src/lib/engine/`.

### Current balance

Use the latest ledger running balance for the selected worker.

### Upcoming obligations

Convert recurring due days into actual dates for the next 30 days.

### Baseline essential spending

Estimate from recent essential debit transactions. Use a seven- or fourteen-day average.

### Expected earnings

Use scheduled or historical daily earnings. For a demo, use the worker’s typical daily net and pay type to create a conservative projection.

### Projected daily balance

For each of the next seven days:

```text
prior balance
+ expected net earnings
- scheduled obligations
- expected essential spend
- advance repayment
= projected ending balance
```

### Minimum buffer

Set a demo buffer target equal to two days of essential spending.

### Cash gap

```text
cash gap = max(0, target buffer - lowest projected balance)
```

### Earnings target

Account for deductions conservatively:

```text
required gross opportunity pay = cash gap / estimated take-home ratio
```

For the demo, opportunity cards can directly use estimated net pay.

### Opportunity impact

For each shift:

```text
new projected balance = baseline projection + opportunity net pay on payout date
buffer days gained = net pay / average daily essential spend
```

### Match score

Use a simple transparent score:

- 40% closes the cash gap
- 20% role match
- 15% city match
- 15% availability match
- 10% payout speed

Do not call this AI unless you actually add an LLM or learned model. Call it a matching engine.

## 12. Routes

```text
/                  Worker dashboard
/marketplace       Shifts, jobs, and swaps
/marketplace/[id]  Opportunity details
/my-shifts         Assigned, claimed, and released shifts
/plan              Seven-day cash-flow plan
/savings           Pay-yourself-first settings
/employer           Employer dashboard
/employer/post      Post shift or job
```

## 13. Suggested folder structure

```text
nextshift/
├── BUILD_PLAN.md
├── public/
│   ├── data/
│   │   ├── workers.csv
│   │   ├── earnings.csv
│   │   ├── obligations.csv
│   │   ├── transactions.csv
│   │   ├── advances.csv
│   │   └── weekly_cashflow.csv
│   └── fixtures/
│       ├── jobs.json
│       ├── open-shifts.json
│       └── released-shifts.json
├── src/
│   ├── app/
│   ├── components/
│   │   ├── dashboard/
│   │   ├── marketplace/
│   │   ├── employer/
│   │   └── shared/
│   ├── lib/
│   │   ├── data/
│   │   ├── engine/
│   │   └── storage/
│   ├── types/
│   └── fixtures/
└── scripts/
    └── normalize-data.mjs
```

## 14. UI components

Build these first:

```text
WorkerSwitcher
CashGapHero
MetricCard
RunwayChart
UpcomingObligations
OpportunityCard
OpportunityImpact
MarketplaceTabs
ClaimShiftButton
ReleaseShiftDialog
SavingsControl
EmployerShiftForm
EmployerMatchSummary
DemoResetButton
```

## 15. Visual direction

Keep it practical and legible, not fintech-generic.

- mobile-first layout
- large dollar figure in the hero
- clear date attached to every warning
- minimal charts
- strong before-and-after state
- plain language
- no shame-based red alerts everywhere

Suggested navigation:

```text
Today | Find Work | My Shifts | Plan
```

## 16. Build order

### Phase 1: Working skeleton, 20–30 minutes

- scaffold Next.js
- install packages
- add routes
- copy CSVs into `public/data`
- add marketplace fixture files
- create worker selector

### Phase 2: Financial engine, 45–60 minutes

- load worker data
- calculate current balance
- calculate upcoming obligations
- generate seven-day projection
- calculate cash gap and due date
- render hero and runway chart

### Phase 3: Marketplace, 45–60 minutes

- build opportunity cards
- add match scoring
- show `closes your gap` and `buffer days gained`
- create shift detail page
- implement claim action with local storage

### Phase 4: Shift release, 30–45 minutes

- create `My shifts`
- add release dialog
- add financial impact warning
- publish released shift into local marketplace state

### Phase 5: Employer view, 30–45 minutes

- build open-shift list
- build post-shift form
- show eligible worker count
- show claimed or released shift status

### Phase 6: Demo polish, 30 minutes

- add a guided demo persona
- add reset button
- ensure every interaction updates the dashboard
- remove dead routes
- improve empty and loading states

## 17. Cursor workflow

Give Cursor one narrow task at a time. Do not ask it to build the entire app in one prompt.

### Prompt 1: Scaffold and inspect data

```text
Read BUILD_PLAN.md. Inspect every CSV in public/data and report the exact headers, row counts, date formats, missing values, and relationships between worker_id fields. Do not write application code yet. Create DATA_DICTIONARY.md with your findings.
```

### Prompt 2: Types and loaders

```text
Using DATA_DICTIONARY.md, create strict TypeScript types and robust CSV loaders. Preserve the source column names in raw types and map them into normalized application types. Add validation and useful errors. Do not build UI yet.
```

### Prompt 3: Financial engine

```text
Build pure functions for current balance, upcoming obligations, seven-day projected balance, minimum buffer, cash gap, cash-gap date, and safe-to-save amount. Add unit tests using one seeded worker. Keep all calculations explainable.
```

### Prompt 4: Worker dashboard

```text
Build the mobile-first worker dashboard using the existing financial engine. Include CashGapHero, five metric cards, UpcomingObligations, and a seven-day runway chart. Use one seeded worker and add a worker switcher.
```

### Prompt 5: Marketplace fixtures

```text
Create realistic Alberta-based fixture data for jobs, open shifts, and released shifts. Clearly mark these files as synthetic. Build a transparent opportunity match function that scores gap coverage, role, city, availability, and payout timing.
```

### Prompt 6: Claim and release flows

```text
Build the marketplace, opportunity detail, claim shift, my shifts, and release shift flows. Persist demo state in localStorage. Recalculate runway after every claim or release. Add a reset demo button.
```

### Prompt 7: Employer view

```text
Build a separate employer dashboard with post-shift and post-job forms, open shift status, released employee shifts, claimant status, and aggregate eligible-worker counts. Do not expose private worker budgets.
```

### Prompt 8: Demo hardening

```text
Audit the app for broken states, hydration issues, CSV load failures, invalid dates, mobile layout problems, and inconsistent calculations. Fix them. Add a guided demo sequence and concise explanatory copy.
```

## 18. Synthetic marketplace fixtures

Create 10–15 opportunities around Alberta:

- warehouse evening shift
- event setup crew
- cleaning shift
- moving helper
- kitchen prep
- retail inventory count
- security coverage
- delivery block
- hospitality banquet shift
- longer-term full-time roles

Include a few deliberately poor matches so the ranking is obvious.

For released shifts, include:

- employee name or anonymous initials
- original employer
- date and time
- role
- estimated net pay
- release reason category
- qualification requirements

Do not include sensitive reasons in the marketplace.

## 19. Demo scenario

Use one worker throughout the presentation.

### Start

The worker has:

- a current balance
- rent due Friday
- a projected $86 shortfall
- one recent earned-wage advance

### Action

The worker opens `Find Work` and sees a Thursday warehouse shift paying an estimated $104 net.

### Result

After claiming it:

- shortfall becomes $0
- runway increases
- advance need disappears or decreases
- safe-to-save amount becomes positive

### Shift-release twist

The worker then attempts to release a Saturday shift. NextShift warns that doing so would recreate a shortfall. This demonstrates that the product understands both money and scheduling.

### Employer close

Switch to the employer view and show that the released shift is immediately visible to qualified workers, reducing staffing friction.

## 20. Hackathon pitch

> Budgeting tells daily earners what already happened. NextShift tells them what to do next. It predicts a cash gap, converts that gap into an earnings target, and connects the worker to open shifts, longer-term jobs, and coworker-released shifts that can close it. For employers, it turns existing workforce integrations into a faster way to fill labour gaps.

## 21. What not to build tonight

Do not build:

- Supabase
- real authentication
- real payroll integration
- payments
- employer verification
- worker background checks
- chat
- notifications
- bidding or auctions
- full application workflows
- production privacy controls
- machine-learning matching

Show the complete product loop instead:

```text
financial gap → matched opportunity → claim or release → recalculated runway
```

## 22. Definition of done

The demo is ready when:

1. A seeded worker loads from the supplied dataset.
2. The dashboard calculates a seven-day shortfall.
3. The app states a specific amount and deadline.
4. The marketplace ranks relevant shifts, jobs, and shift swaps.
5. Claiming a shift removes or reduces the shortfall.
6. Releasing a shift warns about its financial impact.
7. The released shift appears in the marketplace.
8. The employer view shows staffing demand and claims.
9. The app resets cleanly for another demo.
10. The entire flow runs locally without a backend.
