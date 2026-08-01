import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "NextShift — Know what you need. Find what pays.",
  description:
    "Hackathon prototype from Cursor Calgary (July 29, 2026). Turns a cash shortfall into matched shifts and jobs — built by RayRayRay Tan and Mandeep Saini.",
};

const GITHUB = "https://github.com/aibraincoach/nextshift";
const BUILD_STORY =
  "https://github.com/aibraincoach/nextshift/blob/main/docs/LIFESPAN.md";

export default function CoverSheetPage() {
  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text)]">
      {/* Hero */}
      <section className="border-b-2 border-[var(--color-divider)] px-5 pt-8 pb-8 sm:px-8 sm:pt-12 sm:pb-10">
        <p
          className="text-[11px] tracking-[0.12em] text-[var(--color-accent-700)] uppercase"
          style={{ fontWeight: 800 }}
        >
          Built at Cursor Calgary · July 29, 2026
        </p>
        <h1
          className="mt-4 text-[48px] leading-[0.95] tracking-tight sm:text-[64px]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          NextShift
        </h1>
        <p
          className="mt-4 max-w-xl text-[22px] leading-snug tracking-tight sm:text-[28px]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Know what you need. Find what pays.
        </p>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--color-neutral-700)]">
          Created by{" "}
          <span className="font-semibold text-[var(--color-text)]">RayRayRay Tan</span> and{" "}
          <span className="font-semibold text-[var(--color-text)]">Mandeep Saini</span>
        </p>

        <div className="mt-8 flex flex-col gap-2 sm:max-w-md">
          <Link href="/today" className="btn btn-primary btn-block no-underline">
            Enter the demo
            <ArrowRight size={16} strokeWidth={2.2} className="ml-auto" />
          </Link>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-block no-underline"
          >
            View the source
            <ExternalLink size={14} strokeWidth={2} className="ml-auto" />
          </a>
          <a
            href={BUILD_STORY}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary btn-block no-underline"
          >
            Read the build story
            <ExternalLink size={14} strokeWidth={2} className="ml-auto" />
          </a>
        </div>
      </section>

      <Section title="Why we built it">
        Most budgeting apps were designed around predictable paycheques. For workers paid by the
        day, shift, gig, or contract, knowing that money will run short is not enough. They need
        to know what action can close the gap.
      </Section>

      <hr className="section-rule !mx-5 sm:!mx-8" />

      <Section title="Core insight">
        Budgeting is the calculation layer, not the product. NextShift converts an upcoming cash
        shortfall into a specific earnings target, then ranks available work by how effectively
        and how quickly it closes that target.
      </Section>

      <hr className="section-rule !mx-5 sm:!mx-8" />

      <Section title="What the demo uses">
        NextShift uses six anonymized hackathon datasets covering worker profiles, daily earnings,
        recurring obligations, transactions, earned wage advances, and weekly cashflow. Marketplace
        opportunities are synthetic demo fixtures — employer listings were not in the supplied
        data.
      </Section>

      <hr className="section-rule !mx-5 sm:!mx-8" />

      <section className="px-5 py-6 sm:px-8">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          What to try
        </h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[var(--color-neutral-700)]">
          <li>Select a worker persona in the DEMO strip.</li>
          <li>Set an amount and deadline (“I need $___ by ___”).</li>
          <li>Review the projected shortfall date and runway.</li>
          <li>Inspect matched work and claim a shift that closes the gap.</li>
          <li>Compare the shift with an earned wage advance (fee + repayment).</li>
          <li>Test releasing an assigned shift and read the financial warning.</li>
        </ol>
      </section>

      <hr className="section-rule !mx-5 sm:!mx-8" />

      <section className="px-5 py-6 sm:px-8">
        <h2
          className="text-base text-[var(--color-text)]"
          style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
        >
          Prototype note
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-neutral-700)]">
          This is a hackathon prototype using static and synthetic data. It does not connect to
          live payroll systems, employers, bank accounts, or earned wage providers. No
          authentication, database, or production marketplace.
        </p>
      </section>

      <section className="border-t-2 border-[var(--color-divider)] px-5 py-8 sm:px-8">
        <Link href="/today" className="btn btn-primary btn-block no-underline sm:max-w-md">
          Enter the demo
          <ArrowRight size={16} strokeWidth={2.2} className="ml-auto" />
        </Link>
      </section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="px-5 py-6 sm:px-8">
      <h2
        className="text-base text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-heading)", fontWeight: 800 }}
      >
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-[var(--color-neutral-700)]">{children}</p>
    </section>
  );
}
