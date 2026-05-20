import CreateChallengeForm from "./CreateChallengeForm";
import type { Challenge } from "./types";

type Props = {
  challenges: Challenge[];
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
  toggleChallenge: (challengeId: string, isActive: boolean) => void;
  deleteChallenge: (challengeId: string) => void;
};

export default function ChallengesSection(props: Props) {
  return (
    <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-4 text-2xl font-extrabold text-slate-950">Challenges</h2>

      <CreateChallengeForm {...props} />

      <div className="space-y-4">
        {props.challenges.map((challenge) => (
          <div key={challenge.id} className="rounded-2xl border border-slate-100 p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-slate-950">{challenge.title}</h3>

                <p className="mt-1 text-slate-500">{challenge.description}</p>

                <p className="mt-3 font-bold text-indigo-600">Prix : {challenge.reward_amount} €</p>

                <p className="text-sm text-slate-500">
                  {challenge.period_type === "weekly" ? "Hebdomadaire" : "Mensuel"} · {challenge.start_date} → {challenge.end_date}
                </p>

                <span
                  className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-bold ${
                    challenge.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {challenge.is_active ? "Actif" : "Inactif"}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => props.toggleChallenge(challenge.id, challenge.is_active)}
                  className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white"
                >
                  {challenge.is_active ? "Désactiver" : "Activer"}
                </button>

                <button
                  onClick={() => props.deleteChallenge(challenge.id)}
                  className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
