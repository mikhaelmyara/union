import type { Campaign } from "./types";

type Props = {
  campaigns: Campaign[];
  campaignSearch: string;
  campaignStatusFilter: string;
  setCampaignSearch: (value: string) => void;
  setCampaignStatusFilter: (value: string) => void;
  toggleCampaign: (campaignId: string, isActive: boolean) => void;
  deleteCampaign: (campaignId: string) => void;
};

export default function CampaignsSection({ campaigns, campaignSearch, campaignStatusFilter, setCampaignSearch, setCampaignStatusFilter, toggleCampaign, deleteCampaign }: Props) {
  const filtered = campaigns.filter((c) => {
    const matchSearch = `${c.title} ${c.description ?? ""}`.toLowerCase().includes(campaignSearch.toLowerCase());
    const matchStatus =
      campaignStatusFilter === "all" ||
      (campaignStatusFilter === "active" && c.is_active) ||
      (campaignStatusFilter === "inactive" && !c.is_active);
    return matchSearch && matchStatus;
  });

  const preview = filtered.slice(0, 2);
  const hasMore = filtered.length > 2;

  return (
    <section id="campaigns" className="mb-10">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">Campagnes</h2>
          <p className="mt-1 text-sm text-slate-400">{campaigns.length} campagne{campaigns.length !== 1 ? "s" : ""} au total</p>
        </div>
        <a
          href="/founder/campaigns"
          className="flex items-center gap-1.5 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100"
        >
          Gérer →
        </a>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[
          { label: "Toutes", value: "all" },
          { label: "Actives", value: "active" },
          { label: "Inactives", value: "inactive" },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setCampaignStatusFilter(f.value)}
            className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${
              campaignStatusFilter === f.value ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {f.label}
          </button>
        ))}
        <input
          className="ml-auto w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm outline-none focus:border-indigo-500 sm:w-56"
          placeholder="Rechercher..."
          value={campaignSearch}
          onChange={(e) => setCampaignSearch(e.target.value)}
        />
      </div>

      {/* Liste — 2 max */}
      <div className="space-y-3">
        {preview.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400">
            Aucune campagne trouvée.
          </div>
        ) : (
          preview.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-950">{c.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-slate-500">{c.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600">
                      {c.reward_amount} € / engagement
                    </span>
                    {c.referral_reward_amount > 0 && (
                      <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                        {c.referral_reward_amount} € parrain
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    onClick={() => toggleCampaign(c.id, c.is_active)}
                    className={`rounded-xl px-3 py-1.5 text-sm font-bold transition ${
                      c.is_active
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    {c.is_active ? "Désactiver" : "Activer"}
                  </button>
                  <button
                    onClick={() => deleteCampaign(c.id)}
                    className="rounded-xl bg-red-50 px-3 py-1.5 text-sm font-bold text-red-600 transition hover:bg-red-100"
                  >
                    Supprimer
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
          href="/founder/campaigns"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-100"
        >
          Voir les {filtered.length - 2} autres campagnes →
        </a>
      )}
    </section>
  );
}
