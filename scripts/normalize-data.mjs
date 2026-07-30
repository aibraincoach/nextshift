// One-time normalization: converts the six source CSVs in public/data into
// a compact public/generated/app-data.json used by the app at runtime.
// Run: node scripts/normalize-data.mjs
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = "public/data";
const OUT_DIR = "public/generated";
const DEMO_TODAY = "2026-07-06"; // day after the last ledger entry in the dataset
// Chosen for visibly different situations: negative balance gig driver,
// advance-dependent cleaner, and an Edmonton event worker with rent looming.
const PERSONA_IDS = ["W-0014", "W-0087", "W-0183"];

function parseCsv(file) {
  const text = fs.readFileSync(path.join(DATA_DIR, file), "utf8").trim();
  const [headerLine, ...lines] = text.split(/\r?\n/);
  const headers = headerLine.split(",");
  return lines.map((line) => {
    // Dataset has no quoted commas; simple split is safe (verified).
    const cells = line.split(",");
    const row = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

const num = (v) => (v === "" || v == null ? 0 : Number(v));

const workersRaw = parseCsv("workers.csv");
const earningsRaw = parseCsv("daily_earnings.csv");
const obligationsRaw = parseCsv("recurring_obligations.csv");
const transactionsRaw = parseCsv("transactions.csv");
const advancesRaw = parseCsv("earned_wage_advances.csv");

const workers = workersRaw.map((r) => ({
  workerId: r.worker_id,
  city: r.city,
  province: r.province,
  occupation: r.occupation,
  payType: r.pay_type,
  typicalDailyNetCad: num(r.typical_daily_net_cad),
  incomeVolatility: num(r.income_volatility),
  tipShare: num(r.tip_share),
  householdSize: num(r.household_size),
  dependents: num(r.dependents),
  hasBankAccount: r.has_bank_account === "1",
  usesPrepaidCard: r.uses_prepaid_card === "1",
  primaryEmployerId: r.primary_employer_id,
  tenureMonths: num(r.tenure_months),
  hasSideGig: r.has_side_gig === "1",
  commuteMode: r.commute_mode,
  rentBurdenBand: r.rent_burden_band,
}));

const byWorker = (rows, key = "worker_id") => {
  const map = new Map();
  for (const r of rows) {
    const id = r[key];
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(r);
  }
  return map;
};

const earningsBy = byWorker(earningsRaw);
const obligationsBy = byWorker(obligationsRaw);
const txnsBy = byWorker(transactionsRaw);
const advancesBy = byWorker(advancesRaw);

const EMPLOYER_NAMES = {}; // deterministic pseudo-names per employer id
const NAME_POOL = [
  "Bow River Logistics", "Prairie Clean Co", "Foothills Events", "Chinook Warehousing",
  "Aurora Security", "Stampede Hospitality", "Rundle Moving", "Glacier Foods",
  "Sunrise Care Services", "Nose Hill Retail", "Elk Island Grounds", "Peace Bridge Couriers",
  "Saddledome Staffing", "Whyte Ave Kitchens", "Tamarack Construction",
];
function employerName(id) {
  if (!EMPLOYER_NAMES[id]) {
    const n = Number(String(id).replace(/\D/g, "")) || 0;
    EMPLOYER_NAMES[id] = `${NAME_POOL[n % NAME_POOL.length]}`;
  }
  return EMPLOYER_NAMES[id];
}

const financials = {};
for (const w of workers) {
  const id = w.workerId;
  const txns = (txnsBy.get(id) ?? []).slice().sort((a, b) => a.txn_ts.localeCompare(b.txn_ts));
  const latest = txns[txns.length - 1];

  // Average daily everyday spend over the last 28 days, excluding obligation
  // payments (those are projected separately by due date). In this dataset the
  // is_essential flag mostly marks obligations, so day-to-day spend (food,
  // transport, etc.) is captured by all remaining debits.
  const cutoff = new Date(DEMO_TODAY);
  cutoff.setDate(cutoff.getDate() - 28);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  const everydaySpend = txns
    .filter(
      (t) =>
        t.direction === "debit" &&
        !t.notes.includes("obligation_id") &&
        !t.notes.includes("advance") &&
        t.txn_ts.slice(0, 10) >= cutoffIso
    )
    .reduce((s, t) => s + num(t.amount_cad), 0);
  const avgDailyEssentialSpendCad = Math.round((everydaySpend / 28) * 100) / 100;

  const earnings = (earningsBy.get(id) ?? [])
    .slice()
    .sort((a, b) => a.work_date.localeCompare(b.work_date));
  const recent = earnings.slice(-21).map((e) => ({
    date: e.work_date,
    netCad: num(e.net_pay_cad),
    grossCad: num(e.gross_pay_cad),
    hours: num(e.hours_worked),
    employerId: e.employer_id,
  }));
  const last28 = earnings.filter((e) => {
    const c = new Date(DEMO_TODAY);
    c.setDate(c.getDate() - 28);
    return e.work_date >= c.toISOString().slice(0, 10);
  });
  const netLast28 = last28.reduce((s, e) => s + num(e.net_pay_cad), 0);
  const expectedDailyNetCad = Math.round((netLast28 / 28) * 100) / 100;
  const workDaysPerWeek = Math.round((last28.length / 4) * 10) / 10;

  const obligations = (obligationsBy.get(id) ?? []).map((o) => ({
    obligationId: o.obligation_id,
    workerId: id,
    name: o.name,
    category: o.category,
    amountCad: num(o.amount_cad),
    frequency: o.frequency,
    dueDayOfMonth: num(o.due_day_of_month),
    autopay: o.autopay === "1",
    essential: o.essential === "1",
  }));

  const adv = advancesBy.get(id) ?? [];
  const totalAmount = adv.reduce((s, a) => s + num(a.amount_cad), 0);
  const totalFees = adv.reduce((s, a) => s + num(a.fee_cad), 0);
  const outstanding = adv
    .filter((a) => a.status !== "repaid")
    .reduce((s, a) => s + num(a.amount_cad) + num(a.fee_cad), 0);

  // Synthetic future assigned shifts (demo only): pattern based on the
  // worker's real cadence and typical net, at their primary employer.
  const assignedShifts = [];
  const shiftOffsets = [1, 3, 5]; // Tue, Thu, Sat relative to Monday demoToday
  shiftOffsets.forEach((off, i) => {
    if (i >= Math.max(1, Math.min(3, Math.round(workDaysPerWeek / 2)))) return;
    const d = new Date(DEMO_TODAY);
    d.setDate(d.getDate() + off);
    assignedShifts.push({
      id: `AS-${id}-${off}`,
      employerId: w.primaryEmployerId,
      employerName: employerName(w.primaryEmployerId),
      role: w.occupation,
      date: d.toISOString().slice(0, 10),
      startHour: 9 + (i % 2) * 8,
      endHour: 9 + (i % 2) * 8 + 6,
      estimatedNetCad: Math.round(w.typicalDailyNetCad * 100) / 100,
    });
  });

  financials[id] = {
    workerId: id,
    latestBalanceCad: latest ? num(latest.running_balance_cad) : 0,
    latestBalanceDate: latest ? latest.txn_ts.slice(0, 10) : DEMO_TODAY,
    avgDailyEssentialSpendCad,
    expectedDailyNetCad,
    workDaysPerWeek,
    obligations,
    recentEarnings: recent,
    advances: {
      count: adv.length,
      totalAmountCad: Math.round(totalAmount * 100) / 100,
      totalFeesCad: Math.round(totalFees * 100) / 100,
      avgFeeRate: totalAmount > 0 ? Math.round((totalFees / totalAmount) * 10000) / 10000 : 0.03,
      outstandingCad: Math.round(outstanding * 100) / 100,
      lastReason: adv.length ? adv[adv.length - 1].reason_code : null,
    },
    assignedShifts,
  };
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const out = { demoToday: DEMO_TODAY, personaIds: PERSONA_IDS, workers, financials };
fs.writeFileSync(path.join(OUT_DIR, "app-data.json"), JSON.stringify(out));
console.log(
  `Wrote ${OUT_DIR}/app-data.json: ${workers.length} workers, ` +
    `${Object.keys(financials).length} financial summaries`
);
