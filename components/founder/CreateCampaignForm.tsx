type Props = {
  title: string;
  description: string;
  rewardAmount: number | "";
  referralRewardAmount: number | "";
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
  const inputClass = "rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-6 text-2xl font-extrabold text-slate-950">
        Créer une campagne
      </h2>

      <div className="grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm font-bold text-slate-700">Titre de la campagne</label>
          <input
            className={inputClass}
            placeholder="Ex : Recrutement CDI Paris"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-bold text-slate-700">Description</label>
          <textarea
            className={`${inputClass} min-h-24 resize-none`}
            placeholder="Décris l'objectif de la campagne, le profil recherché..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-bold text-slate-700">
            Récompense par engagement validé
            <span className="ml-1 font-normal text-slate-400">(€)</span>
          </label>
          <div className="relative">
            <input
              className={`${inputClass} w-full pr-10`}
              placeholder="Ex : 50"
              type="number"
              min="0"
              value={rewardAmount === 0 ? "" : rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value === "" ? 0 : Number(e.target.value))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
          </div>
          <p className="text-xs text-slate-400">Montant gagné par le client pour chaque engagement approuvé.</p>
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-bold text-slate-700">
            Commission parrain
            <span className="ml-1 font-normal text-slate-400">(€ — optionnel)</span>
          </label>
          <div className="relative">
            <input
              className={`${inputClass} w-full pr-10`}
              placeholder="Ex : 10"
              type="number"
              min="0"
              value={referralRewardAmount === 0 ? "" : referralRewardAmount}
              onChange={(e) => setReferralRewardAmount(e.target.value === "" ? 0 : Number(e.target.value))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
          </div>
          <p className="text-xs text-slate-400">Montant versé au parrain quand un de ses filleuls fait un engagement approuvé. Laisse vide pour 0.</p>
        </div>

        <button
          onClick={createCampaign}
          disabled={creatingCampaign}
          className="mt-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {creatingCampaign ? "Création en cours..." : "Créer la campagne"}
        </button>
      </div>
    </div>
  );
}
