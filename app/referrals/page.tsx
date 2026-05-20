"use client";

import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import DashboardNav from "@/components/layout/DashboardNav";
import PageShell from "@/components/layout/PageShell";
import EmptyState from "@/components/ui/EmptyState";
import StatCard from "@/components/ui/StatCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ReferralUser = {
  id: string;
  full_name: string | null;
  referral_code: string | null;
  created_at: string;
};

type ReferralReward = {
  id: string;
  user_id: string;
  amount: number;
  type: "direct" | "referral";
};

type Engagement = {
  id: string;
  client_id: string;
  status: "pending" | "approved" | "rejected";
};

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);

  useEffect(() => {
    loadReferrals();
  }, []);

  async function loadReferrals() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: referralsData } = await supabase
      .from("profiles")
      .select("id, full_name, referral_code, created_at")
      .eq("referred_by", user.id)
      .order("created_at", { ascending: false });

    const referralIds = referralsData?.map((referral) => referral.id) ?? [];

    const { data: rewardsData } = await supabase
      .from("rewards")
      .select("id, user_id, amount, type")
      .eq("user_id", user.id)
      .eq("type", "referral");

    let engagementsData: Engagement[] = [];

    if (referralIds.length > 0) {
      const { data } = await supabase
        .from("leads")
        .select("id, client_id, status")
        .in("client_id", referralIds);

      engagementsData = (data as Engagement[]) ?? [];
    }

    setReferrals((referralsData as ReferralUser[]) ?? []);
    setRewards((rewardsData as ReferralReward[]) ?? []);
    setEngagements(engagementsData);
    setLoading(false);
  }

  const totalReferralRewards = rewards.reduce(
    (sum, reward) => sum + reward.amount,
    0
  );

  const approvedEngagements = engagements.filter(
    (engagement) => engagement.status === "approved"
  ).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        Chargement...
      </main>
    );
  }

  return (
  <>
    <MobileHeader
      title="Mes parrainages"
      subtitle="UNION"
    />
    <PageShell
      eyebrow="Parrainages"
      title="Mes parrainages"
      description="Suis les utilisateurs inscrits grâce à ton code et les commissions générées."
      backHref="/client"
    >
      <DashboardNav active="referrals" />

      <div className="mb-10 grid gap-5 md:grid-cols-3">
        <StatCard label="Utilisateurs parrainés" value={referrals.length} />
        <StatCard label="Engagements confirmés" value={approvedEngagements} tone="green" />
        <StatCard label="Commissions gagnées" value={`${totalReferralRewards} €`} tone="indigo" />
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="text-2xl font-extrabold text-slate-950">
          Utilisateurs parrainés
        </h2>

        <div className="mt-6 space-y-4">
          {referrals.length === 0 ? (
            <EmptyState message="Aucun utilisateur parrainé pour le moment." />
          ) : (
            referrals.map((referral) => {
              const confirmedCount = engagements.filter(
                (engagement) =>
                  engagement.client_id === referral.id &&
                  engagement.status === "approved"
              ).length;

              return (
                <div
                  key={referral.id}
                  className="rounded-2xl border border-slate-100 p-5"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-950">
                        {referral.full_name ?? "Utilisateur"}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Code : {referral.referral_code ?? "—"}
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Inscrit le {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="rounded-xl bg-green-50 px-4 py-3">
                      <p className="text-xl font-extrabold text-green-700">
                        {confirmedCount}
                      </p>
                      <p className="text-sm text-green-700">Confirmés</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </PageShell>

    <MobileBottomNav active="referrals" />

  </>

);

}