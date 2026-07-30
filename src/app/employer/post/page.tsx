"use client";

import { useAppData } from "@/lib/data/useAppData";
import { EmployerHeader } from "@/components/employer/EmployerHeader";
import { PostOpportunityForm } from "@/components/employer/PostOpportunityForm";

export default function EmployerPostPage() {
  const { loading, error, data, demoToday } = useAppData();

  if (loading) {
    return <p className="py-16 text-center text-sm text-zinc-500">Loading…</p>;
  }
  if (error || !data) {
    return (
      <p className="py-16 text-center text-sm text-amber-400">
        Could not load data. {error ?? ""}
      </p>
    );
  }

  return (
    <div>
      <EmployerHeader />
      <PostOpportunityForm data={data} demoToday={demoToday} />
    </div>
  );
}
