# NextShift

**Know what you need. Find what pays.**

NextShift turns a worker’s cash-flow gap into an earnings plan, then matches shifts, jobs, and coworker-released shifts that close it.

Live demo: **[nextshift.vercel.app](https://nextshift.vercel.app/)**  
Built at **Cursor Calgary** · **July 29, 2026** · **RayRayRay Tan** and **Mandeep Saini**

## What it is

A static Next.js hackathon prototype (no auth, no backend). Workers see exact shortfall dates from anonymized Alberta cash-flow data, set needs and goals, and claim marketplace opportunities that improve their runway. Employers see staffing demand and claims without private budget details. Marketplace listings are synthetic demo fixtures.

## Stack

- Next.js App Router · TypeScript · Tailwind CSS
- Client-side data from `public/generated/app-data.json` (built from CSVs)
- Recharts · lucide-react · localStorage demo state
- Deployed on Vercel

## Local development

```bash
npm install
node scripts/normalize-data.mjs   # regenerate app-data.json if CSVs change
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Cover sheet is `/`; enter the demo at `/today`. Use the DEMO strip to switch personas and Reset.

## Docs

| Doc | Purpose |
| --- | --- |
| [docs/LIFESPAN.md](docs/LIFESPAN.md) | **Full project history** — PRs, reviews, architecture, demo script |
| [BUILD_PLAN.md](BUILD_PLAN.md) | Original product brief and MVP scope |
| [planning.md](planning.md) | Architecture + shared contract for agents |
| [AGENTS.md](AGENTS.md) | Rules for coding agents |
| [tasks.md](tasks.md) | Living checklist |

## Routes

| Path | Role |
| --- | --- |
| `/` | Project cover sheet |
| `/today` | Today — goal, shortfall, runway, close gap |
| `/plan` | Day-by-day cash plan |
| `/needs` | Buffer, spend, obligations, goal |
| `/savings` | Pay-yourself-first |
| `/marketplace` | Shifts / Jobs / Swaps |
| `/my-shifts` | Assigned, claimed, released |
| `/employer` | Employer dashboard (mock) |

## License

Hackathon demo project.
