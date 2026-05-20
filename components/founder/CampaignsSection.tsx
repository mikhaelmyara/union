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

export default function CampaignsSection({
  campaigns,
  campaignSearch,
  campaignStatusFilter,
  setCampaignSearch,
  setCampaignStatusFilter,
  toggleCampaign,
  deleteCampaign,
}: Props) {
  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = `${campaign.title} ${campaign.description ?? ""}`
      .toLowerCase()
      .includes(campaignSearch.toLowerCase());

    const matchesStatus =
      campaignStatusFilter === "all" ||
      (campaignStatusFilter === "active" && campaign.is_active) ||
      (campaignStatusFilter === "inactive" && !campaign.is_active);

    return matchesSearch && matchesStatus;
  });

  return (
    <section id="campaigns">
      <h2 className="mb-4 text-2xl font-extrabold text-slate-950">Campagnes</h2>

      <div className="mb-6">
        <input
          className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none focus:border-indigo-600"
          placeholder="Rechercher une campagne..."
          value={campaignSearch}
          onChange={(e) => setCampaignSearch(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        {[
          { label: "Toutes", value: "all" },
          { label: "Actives", value: "active" },
          { label: "Inactives", value: "inactive" },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => setCampaignStatusFilter(filter.value)}
            className={`rounded-xl px-4 py-2 font-bold ${
              campaignStatusFilter === filter.value
                ? "bg-indigo-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mb-10 grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredCampaigns.map((campaign) => (
          <div key={campaign.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <h3 className="text-lg font-extrabold text-slate-950">{campaign.title}</h3>

                <p className="mt-1 text-slate-500">{campaign.description}</p>

                <p className="mt-3 font-extrabold text-indigo-600">
                  Engagement approuvé = {campaign.reward_amount} €
                </p>

                <p className="font-bold text-emerald-600">
                  Commission parrain = {campaign.referral_reward_amount} €
                </p>

                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-bold ${
                    campaign.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}
                >
                  {campaign.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => toggleCampaign(campaign.id, campaign.is_active)}
                  className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white"
                >
                  {campaign.is_active ? "Désactiver" : "Activer"}
                </button>

                <button
                  onClick={() => deleteCampaign(campaign.id)}
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
