"use client";

import ClientPageLayout from "@/components/layout/ClientPageLayout";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

type Engagement = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  campaign_title_snapshot: string | null;
  campaigns: { title: string } | null;
};

const PAGE_SIZE = 10;

export default function EngagementsPage() {
  const t = useTranslations("leads");
  const tc = useTranslations("common");
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data } = await supabase
        .from("leads")
        .select("id, full_name, email, phone, status, created_at, campaign_title_snapshot, campaigns(title)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });
      setEngagements((data as unknown as Engagement[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = engagements.filter((e) => {
    const campaign = e.campaigns?.title || e.campaign_title_snapshot || t("deletedCampaign");
    const matchSearch = `${e.full_name} ${e.email} ${e.phone ?? ""} ${campaign}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  return (
    <ClientPageLayout
      active="engagements"
      eyebrow={t("title")}
      title={t("title")}
      description={t("subtitle")}
      actions={
        <a href="/lead" className="rounded-xl bg-indigo-600 px-4 py-2.5 font-bold text-white transition hover:bg-indigo-700">
          {t("newEngagement")}
        </a>
      }
    >
      <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <input
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900"
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {([
            { label: tc("all"), value: "all" },
            { label: tc("pending"), value: "pending" },
            { label: tc("approved"), value: "approved" },
            { label: tc("rejected"), value: "rejected" },
          ]).map((f) => (
            <button key={f.value} onClick={() => { setStatusFilter(f.value); setPage(0); }}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${statusFilter === f.value ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-slate-400 dark:text-slate-500">{filtered.length} résultats</span>
        </div>
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : paginated.length === 0 ? (
        <EmptyState message={t("noEngagements")} />
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((e) => (
              <div key={e.id} className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 transition hover:shadow-md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-950 dark:text-white">{e.full_name}</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{e.email}{e.phone ? ` · ${e.phone}` : ""}</p>
                    <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {e.campaigns?.title || e.campaign_title_snapshot || t("deletedCampaign")}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:items-end">
                    <StatusBadge status={e.status} />
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(e.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                className="rounded-xl bg-white dark:bg-slate-900 px-4 py-2 font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                {t("prev")}
              </button>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
                {t("page").replace("{current}", String(page + 1)).replace("{total}", String(totalPages))}
              </span>
              <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="rounded-xl bg-white dark:bg-slate-900 px-4 py-2 font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
              >
                {t("next")}
              </button>
            </div>
          )}
        </>
      )}
    </ClientPageLayout>
  );
}
