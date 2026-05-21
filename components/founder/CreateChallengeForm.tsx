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
  const inputClass = "rounded-xl border border-slate-200 p-3 text-slate-950 dark:text-white outline-none focus:border-indigo-600 w-full";

  return (
    <div className="mb-8 grid gap-4">
      <input className={inputClass} placeholder="Titre du challenge" value={challengeTitle} onChange={(e) => setChallengeTitle(e.target.value)} />
      <textarea className={`${inputClass} resize-none`} placeholder="Description" value={challengeDescription} onChange={(e) => setChallengeDescription(e.target.value)} />
      <input className={inputClass} placeholder="Récompense challenge (€)" type="number"
        value={challengeReward === 0 ? "" : challengeReward}
        onChange={(e) => setChallengeReward(e.target.value === "" ? 0 : Number(e.target.value))}
      />
      <select className={inputClass} value={challengePeriod} onChange={(e) => setChallengePeriod(e.target.value as Challenge["period_type"])}>
        <option value="weekly">Hebdomadaire</option>
        <option value="monthly">Mensuel</option>
      </select>
      <input className={inputClass} type="date" value={challengeStartDate} onChange={(e) => setChallengeStartDate(e.target.value)} />
      <input className={inputClass} type="date" value={challengeEndDate} onChange={(e) => setChallengeEndDate(e.target.value)} />
      <button onClick={createChallenge} className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700">
        Créer challenge
      </button>
    </div>
  );
}