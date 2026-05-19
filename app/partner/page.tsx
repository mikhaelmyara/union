"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import PageActions from "@/components/PageActions";

type Engagement = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  campaign_title_snapshot: string | null;
  campaigns: {
    title: string;
    reward_amount: number;
    referral_reward_amount: number;
  } | null;
};

type Reward = {
  id: string;
  amount: number;
  type: "direct" | "referral";
};

export default function PartnerPage() {
  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    loadPartner();
  }, []);

  async function loadPartner() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    const { data: rewardsData } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", user.id);

    const { data } = await supabase
      .from("leads")
      .select(`
        id,
        full_name,
        email,
        phone,
        status,
        created_at,
        campaign_title_snapshot,
        campaigns (
          title,
          reward_amount,
          referral_reward_amount
        )
      `)
      .eq("partner_id", user.id)
      .order("created_at", { ascending: false });

    setReferralCode(profile?.referral_code ?? "");
    setRewards(rewardsData ?? []);
    setEngagements((data as unknown as Engagement[]) ?? []);
    setLoading(false);
  }

  const pendingEngagements = engagements.filter(
    (engagement) => engagement.status === "pending"
  ).length;

  const approvedEngagements = engagements.filter(
    (engagement) => engagement.status === "approved"
  ).length;

  const rejectedEngagements = engagements.filter(
    (engagement) => engagement.status === "rejected"
  ).length;

  const directRewards = rewards
    .filter((reward) => reward.type === "direct")
    .reduce((sum, reward) => sum + reward.amount, 0);

  const referralRewards = rewards
    .filter((reward) => reward.type === "referral")
    .reduce((sum, reward) => sum + reward.amount, 0);

  const totalRewards = directRewards + referralRewards;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        Chargement...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-indigo-600">Partenaire</p>

            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-950">
              Dashboard partenaire 🚀
            </h1>

            <p className="mt-3 text-lg text-slate-500">
              Suivez vos engagements, vos gains directs et vos commissions de parrainage.
            </p>
          </div>

          <PageActions backHref="/" />
        </div>

        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
            Mon code parrain
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-4">
            <div className="rounded-xl bg-indigo-600 px-5 py-3 text-2xl font-extrabold text-white">
              {referralCode}
            </div>

            <p className="max-w-xl text-slate-500">
              Partagez ce code pour inviter d’autres utilisateurs à rejoindre UNION.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-extrabold text-slate-950">
              {engagements.length}
            </p>
            <p className="mt-2 text-slate-500">Total engagements</p>
          </div>

          <div className="rounded-2xl bg-yellow-50 p-6 shadow-sm ring-1 ring-yellow-100">
            <p className="text-3xl font-extrabold text-yellow-700">
              {pendingEngagements}
            </p>
            <p className="mt-2 text-yellow-700">En attente</p>
          </div>

          <div className="rounded-2xl bg-green-50 p-6 shadow-sm ring-1 ring-green-100">
            <p className="text-3xl font-extrabold text-green-700">
              {approvedEngagements}
            </p>
            <p className="mt-2 text-green-700">Approuvés</p>
          </div>

          <div className="rounded-2xl bg-red-50 p-6 shadow-sm ring-1 ring-red-100">
            <p className="text-3xl font-extrabold text-red-700">
              {rejectedEngagements}
            </p>
            <p className="mt-2 text-red-700">Refusés</p>
          </div>

          <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-md shadow-indigo-200">
            <p className="text-3xl font-extrabold">{totalRewards} €</p>
            <p className="mt-2 text-indigo-100">Gains totaux</p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-3xl font-extrabold text-slate-950">
              {referralRewards} €
            </p>
            <p className="mt-2 text-slate-500">Commissions parrainage</p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-950">
                Mes engagements
              </h2>

              <p className="mt-2 text-slate-500">
                Historique de vos engagements enregistrés.
              </p>
            </div>

            <a
              href="/lead"
              className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
            >
              Nouvel engagement
            </a>
          </div>

          <div className="space-y-4">
            {engagements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-10 text-center text-slate-500">
                Aucun engagement pour le moment.
              </div>
            ) : (
              engagements.map((engagement) => (
                <div
                  key={engagement.id}
                  className="rounded-2xl border border-slate-100 p-5 transition hover:border-indigo-200 hover:shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-950">
                        {engagement.full_name}
                      </h3>

                      <p className="mt-1 text-slate-500">
                        {engagement.email}
                      </p>

                      <p className="text-slate-500">
                        {engagement.phone}
                      </p>

                      <p className="mt-3 font-bold text-indigo-600">
                        {engagement.campaigns?.title ||
                          engagement.campaign_title_snapshot ||
                          "Campagne supprimée"}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <span
                        className={`rounded-full px-4 py-2 text-sm font-bold ${
                          engagement.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : engagement.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {engagement.status === "pending"
                          ? "En attente"
                          : engagement.status === "approved"
                          ? "Approuvé"
                          : "Refusé"}
                      </span>

                      <p className="text-sm text-slate-400">
                        {new Date(engagement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}