"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import FounderPageLayout from "@/components/layout/FounderPageLayout";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";

type Engagement = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  campaign_title_snapshot: string | null;
  client_id: string | null;
  campaigns: { title: string; reward_amount: number; referral_reward_amount: number } | null;
  profiles: { full_name: string | null } | null;
};

const PAGE_SIZE = 15;

export default function FounderEngagementsPage() {
  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "founder") { window.location.href = "/client"; return; }

    const { data, error } = await supabase
      .from("leads")
      .select("id, full_name, email, phone, status, created_at, campaign_title_snapshot, client_id, campaigns(title, reward_amount, referral_reward_amount)")
      .order("created_at", { ascending: false });

    if (error) { toast.error(error.message); return; }

    const clientIds = data?.map((e) => e.client_id).filter(Boolean) ?? [];
    const { data: profilesData } = clientIds.length > 0
      ? await supabase.from("profiles").select("id, full_name").in("id", clientIds)
      : { data: [] };

    setEngagements(
      (data?.map((e) => ({ ...e, profiles: profilesData?.find((p) => p.id === e.client_id) ?? null })) ?? []) as unknown as Engagement[]
    );
    setLoading(false);
  }

  // Le trigger Supabase gère les notifications et rewards automatiquement
  // On met juste à jour le statut ici
  async function updateStatus(id: string, status: "approved" | "rejected" | "pending") {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Statut mis à jour.");
    setEngagements((prev) => prev.map((e) => e.id === id ? { ...e, status } : e));
  }

  const filtered = engagements.filter((e) => {
    const campaign = e.campaigns?.title || e.campaign_title_snapshot || "";
    const matchSearch = `${e.full_name} ${e.email} ${e.phone ?? ""} ${campaign} ${e.profiles?.full_name ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const counts = {
    all: engagements.length,
    pending: engagements.filter((e) => e.status === "pending").length,
    approved: engagements.filter((e) => e.status === "approved").length,
    rejected: engagements.filter((e) => e.status === "rejected").length,
  };

  return (
    <FounderPageLayout active="engagements" title="Tous les engagements" description="Vue complète avec client, campagne et statut.">
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <input
          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="Rechercher par nom, email, campagne, client..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            { label: `Tous (${counts.all})`, value: "all" },
            { label: `En attente (${counts.pending})`, value: "pending" },
            { label: `Approuvés (${counts.approved})`, value: "approved" },
            { label: `Refusés (${counts.rejected})`, value: "rejected" },
          ]).map((f) => (
            <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(0); }}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${statusFilter === f.value ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : paginated.length === 0 ? (
        <EmptyState message="Aucun engagement trouvé." />
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((e) => (
              <div key={e.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-slate-950">{e.full_name}</h3>
                      <StatusBadge status={e.status} />
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{e.email}{e.phone ? ` · ${e.phone}` : ""}</p>
                    {e.profiles?.full_name && (
                      <p className="mt-1 text-sm font-bold text-indigo-600">Client : {e.profiles.full_name}</p>
                    )}
                    <p className="mt-0.5 text-sm text-slate-500">
                      {e.campaigns?.title || e.campaign_title_snapshot || "Campagne supprimée"}
                      {e.campaigns?.reward_amount ? ` · ${e.campaigns.reward_amount} €` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(e.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => updateStatus(e.id, "approved")} disabled={e.status === "approved"}
                      className="rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ✓ Approuver
                    </button>
                    <button onClick={() => updateStatus(e.id, "rejected")} disabled={e.status === "rejected"}
                      className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      ✕ Refuser
                    </button>
                    {e.status !== "pending" && (
                      <button onClick={() => updateStatus(e.id, "pending")}
                        className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-300"
                      >
                        ↩ En attente
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="rounded-xl bg-white px-4 py-2 font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40"
              >
                ← Précédent
              </button>
              <span className="text-sm font-bold text-slate-500">
                Page {page + 1} / {totalPages} · {filtered.length} engagements
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="rounded-xl bg-white px-4 py-2 font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </FounderPageLayout>
  );
}
