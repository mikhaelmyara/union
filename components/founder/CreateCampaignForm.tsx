type Props = {
  title: string;
  description: string;
  rewardAmount: number;
  referralRewardAmount: number;
  creatingCampaign: boolean;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setRewardAmount: (value: number) => void;
  setReferralRewardAmount: (value: number) => void;
  createCampaign: () => void;
};

export default function CreateCampaignForm({
  title,
  description,
  rewardAmount,
  referralRewardAmount,
  creatingCampaign,
  setTitle,
  setDescription,
  setRewardAmount,
  setReferralRewardAmount,
  createCampaign,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
        Créer une campagne
      </h2>

      <div className="grid gap-4">
        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
          placeholder="Titre"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
          placeholder="Récompense engagement (€)"
          type="number"
          value={rewardAmount}
          onChange={(e) => setRewardAmount(Number(e.target.value))}
        />

        <input
          className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
          placeholder="Commission parrain (€)"
          type="number"
          value={referralRewardAmount}
          onChange={(e) => setReferralRewardAmount(Number(e.target.value))}
        />

        <button
          onClick={createCampaign}
          disabled={creatingCampaign}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creatingCampaign ? "Création..." : "Créer campagne"}
        </button>
      </div>
    </div>
  );
}
