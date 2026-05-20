"use client";

import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import DashboardNav from "@/components/layout/DashboardNav";
import PageShell from "@/components/layout/PageShell";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
  <>
    <MobileHeader title="Partenaire" subtitle="UNION" />

    <PageShell
      eyebrow="Partenaire"
      title="Dashboard partenaire 🚀"
      description="Suivez vos engagements, vos gains directs et vos commissions de parrainage."
      backHref="/client"
    >
      <DashboardNav active="partner" variant="partner" />

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

      <div className="mb-10 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total engagements" value={engagements.length} />
        <StatCard label="En attente" value={pendingEngagements} tone="yellow" />
        <StatCard label="Approuvés" value={approvedEngagements} tone="green" />
        <StatCard label="Refusés" value={rejectedEngagements} tone="red" />
        <StatCard label="Gains totaux" value={`${totalRewards} €`} tone="indigo" />
        <StatCard label="Commissions" value={`${referralRewards} €`} />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
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
            <EmptyState message="Aucun engagement pour le moment." />
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

                    <p className="mt-1 text-slate-500">{engagement.email}</p>
                    <p className="text-slate-500">{engagement.phone}</p>

                    <p className="mt-3 font-bold text-indigo-600">
                      {engagement.campaigns?.title ||
                        engagement.campaign_title_snapshot ||
                        "Campagne supprimée"}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <StatusBadge status={engagement.status} />

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
    </PageShell>

    <MobileBottomNav active="referrals" />
  </>
)
};