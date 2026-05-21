import type { Challenge } from "./types";

type Props = {
  challengeTitle: string;
  challengeDescription: string;
  challengeReward: number;
  challengePeriod: "weekly" | "monthly";
  challengeStartDate: string;
  challengeEndDate: string;
  setChallengeTitle: (value: string) => void;
  setChallengeDescription: (value: string) => void;
  setChallengeReward: (value: number) => void;
  setChallengePeriod: (value: "weekly" | "monthly") => void;
  setChallengeStartDate: (value: string) => void;
  setChallengeEndDate: (value: string) => void;
  createChallenge: () => void;
};

export default function CreateChallengeForm({
  challengeTitle, challengeDescription, challengeReward, challengePeriod,
  challengeStartDate, challengeEndDate, setChallengeTitle, setChallengeDescription,
  setChallengeReward, setChallengePeriod, setChallengeStartDate, setChallengeEndDate,
  createChallenge,
}: Props) {
  const inputClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900 w-full";

  return (
    <div className="mb-8 grid gap-4">
      <div className="grid gap-1">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Titre du challenge</label>
        <input className={inputClass} placeholder="Ex : Top vendeur du mois" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description</label>
        <textarea
          className={`${inputClass} min-h-20 resize-none`}
          placeholder="Décris les règles et l'objectif du challenge..."
          value={challengeDescription}
          onChange={(e) => setChallengeDescription(e.target.value)}
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
          Récompense <span className="font-normal text-slate-400 dark:text-slate-500">(€)</span>
        </label>
        <div className="relative">
          <input
            className={inputClass}
            placeholder="Ex : 200"
            type="number"
            min="0"
            value={challengeReward === 0 ? "" : challengeReward}
            onChange={(e) => setChallengeReward(e.target.value === "" ? 0 : Number(e.target.value))}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 dark:text-slate-500">€</span>
        </div>
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Période</label>
        <select
          className={inputClass}
          value={challengePeriod}
          onChange={(e) => setChallengePeriod(e.target.value as Challenge["period_type"])}
        >
          <option value="weekly">Hebdomadaire</option>
          <option value="monthly">Mensuel</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date de début</label>
          <input className={inputClass} type="date" value={challengeStartDate} onChange={(e) => setChallengeStartDate(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Date de fin</label>
          <input className={inputClass} type="date" value={challengeEndDate} onChange={(e) => setChallengeEndDate(e.target.value)} />
        </div>
      </div>

      <button
        onClick={createChallenge}
        className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
      >
        Créer le challenge
      </button>
    </div>
  );
}