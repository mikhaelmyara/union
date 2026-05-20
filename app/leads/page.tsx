"use client";

import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import DashboardNav from "@/components/layout/DashboardNav";
import PageShell from "@/components/layout/PageShell";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Engagement = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  campaign_title_snapshot: string | null;
  campaigns: {
    title: string;
  } | null;
};

export default function EngagementsPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadEngagements() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("leads")
        .select(`
          id,
          full_name,
          email,
          phone,
          status,
          created_at,
          campaign_title_snapshot,
          campaigns(title)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      setEngagements((data as unknown as Engagement[]) ?? []);
      setLoading(false);
    }

    loadEngagements();
  }, []);

  const filteredEngagements = engagements.filter((engagement) => {
    const campaignName =
      engagement.campaigns?.title ||
      engagement.campaign_title_snapshot ||
      "Campagne supprimée";

    const matchesSearch =
      `${engagement.full_name} ${engagement.email} ${engagement.phone ?? ""} ${campaignName}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || engagement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        Chargement...
      </main>
    );
  }

  return (
  <>
    <MobileHeader title="Mes engagements" subtitle="UNION" />

    <PageShell eyebrow="Engagements" title="Tous mes engagements" backHref="/client">
      <DashboardNav active="engagements" />

      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <input
          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
          placeholder="Rechercher un engagement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: "Tous", value: "all" },
            { label: "En attente", value: "pending" },
            { label: "Approuvés", value: "approved" },
            { label: "Refusés", value: "rejected" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-xl px-4 py-2 font-bold ${
                statusFilter === filter.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredEngagements.length === 0 ? (
          <EmptyState message="Aucun engagement pour le moment." />
        ) : (
          filteredEngagements.map((engagement) => (
            <div
              key={engagement.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-950">
                    {engagement.full_name}
                  </h2>

                  <p className="mt-1 text-slate-500">{engagement.email}</p>
                  <p className="text-slate-500">{engagement.phone}</p>

                  <p className="mt-3 font-bold text-indigo-600">
                    {engagement.campaigns?.title ||
                      engagement.campaign_title_snapshot ||
                      "Campagne supprimée"}
                  </p>
                </div>

                <div className="flex flex-col items-start gap-3 md:items-end">
                  <StatusBadge status={engagement.status} />

                  <p className="text-sm text-slate-400">
                    {new Date(engagement.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
        </PageShell>

    <MobileBottomNav active="engagements" />
  </>
);
}