import type { EngagementStatus, Lead } from "./types";

type Props = {
  leads: Lead[];
  search: string;
  statusFilter: string;
  setSearch: (value: string) => void;
  setStatusFilter: (value: string) => void;
  updateStatus: (leadId: string, status: EngagementStatus) => void;
};

export default function EngagementsSection({
  leads,
  search,
  statusFilter,
  setSearch,
  setStatusFilter,
  updateStatus,
}: Props) {
  const filteredLeads = leads.filter((lead) => {
    const campaignName =
      lead.campaigns?.title ||
      lead.campaign_title_snapshot ||
      "Campagne supprimée";

    const matchesSearch = `${lead.full_name} ${lead.email} ${lead.phone} ${campaignName}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <section id="engagements">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-extrabold text-slate-950">Engagements</h2>

        <a
          href="/founder/engagements"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-center font-bold text-white"
        >
          Voir tous les détails
        </a>
      </div>

      <div className="mb-6">
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none focus:border-indigo-600"
          placeholder="Rechercher un engagement..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
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

      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <div key={lead.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950">{lead.full_name}</h3>

                <p className="text-sm font-medium text-slate-400">{lead.email}</p>

                <p className="text-sm text-slate-500">Téléphone : {lead.phone}</p>

                <p className="text-sm text-slate-500">
                  Campagne : {lead.campaigns?.title || lead.campaign_title_snapshot || "Campagne supprimée"}
                </p>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <span
                  className={`rounded-full px-3 py-1 text-sm font-bold ${
                    lead.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : lead.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {lead.status === "pending" ? "En attente" : lead.status === "approved" ? "Approuvé" : "Refusé"}
                </span>

                <p className="font-extrabold text-indigo-600">{lead.campaigns?.reward_amount ?? 0} €</p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => updateStatus(lead.id, "approved")}
                    className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white"
                  >
                    Approuver
                  </button>

                  <button
                    onClick={() => updateStatus(lead.id, "pending")}
                    className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-white"
                  >
                    En attente
                  </button>

                  <button
                    onClick={() => updateStatus(lead.id, "rejected")}
                    className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
                  >
                    Refuser
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
