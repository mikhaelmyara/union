import type { EngagementStatus, Lead } from "./types";

type Props = {
  leads: Lead[];
  search: string;
  statusFilter: string;
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  updateStatus: (leadId: string, status: EngagementStatus) => void;
};

const statusStyle: Record<string, string> = {
  approved: "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-700",
  pending:   "bg-yellow-100 text-yellow-700",
};
const statusLabel: Record<string, string> = {
  approved: "Approuvé",
  rejected:  "Refusé",
  pending:   "En attente",
};

export default function EngagementsSection({ leads, search, statusFilter, setSearch, setStatusFilter, updateStatus }: Props) {
  const filtered = leads.filter((lead) => {
    const campaign = lead.campaigns?.title || lead.campaign_title_snapshot || "";
    const matchSearch = `${lead.full_name} ${lead.email} ${lead.phone ?? ""} ${campaign}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const preview = filtered.slice(0, 3);
  const hasMore = filtered.length > 3;

  return (
    <section id="engagements" className="mb-10">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">Derniers engagements</h2>
          <p className="mt-1 text-sm text-slate-400">{filtered.length} engagement{filtered.length !== 1 ? "s" : ""} au total</p>
        </div>
        <a
          href="/founder/engagements"
          className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100"
        >
          Voir tout →
        </a>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "Tous", value: "all" },
          { label: "En attente", value: "pending" },
          { label: "Approuvés", value: "approved" },
          { label: "Refusés", value: "rejected" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${
              statusFilter === f.value ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          className="ml-auto w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 sm:w-56"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Liste — 3 max */}
      <div className="space-y-3">
        {preview.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
            Aucun engagement trouvé.
          </div>
        ) : (
          preview.map((lead) => (
            <div key={lead.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-950">{lead.full_name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyle[lead.status]}`}>
                      {statusLabel[lead.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">{lead.email}{lead.phone ? ` · ${lead.phone}` : ""}</p>
                  <p className="mt-0.5 text-sm font-bold text-indigo-600">
                    {lead.campaigns?.title || lead.campaign_title_snapshot || "Campagne supprimée"}
                    {lead.campaigns?.reward_amount ? ` · ${lead.campaigns.reward_amount} €` : ""}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(lead.id, "approved")}
                    disabled={lead.status === "approved"}
                    className="rounded-xl bg-green-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-40"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => updateStatus(lead.id, "pending")}
                    disabled={lead.status === "pending"}
                    className="rounded-xl bg-yellow-500 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-yellow-600 disabled:opacity-40"
                  >
                    ↩
                  </button>
                  <button
                    onClick={() => updateStatus(lead.id, "rejected")}
                    disabled={lead.status === "rejected"}
                    className="rounded-xl bg-red-600 px-3 py-1.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-40"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Voir plus */}
      {hasMore && (
        <a
          href="/founder/engagements"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100"
        >
          Voir les {filtered.length - 3} autres engagements →
        </a>
      )}
    </section>
  );
}
