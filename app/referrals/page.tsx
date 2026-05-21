"use client";

import ClientPageLayout from "@/components/layout/ClientPageLayout";
import EmptyState from "@/components/ui/EmptyState";
import { StatsSkeleton, ListSkeleton } from "@/components/ui/Skeleton";
import DashboardCard from "@/components/ui/DashboardCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ReferralUser = { id: string; full_name: string | null; referral_code: string | null; created_at: string };
type ReferralReward = { id: string; amount: number; type: "direct" | "referral" };
type Engagement = { id: string; client_id: string; status: "pending" | "approved" | "rejected" };

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<ReferralUser[]>([]);
  const [rewards, setRewards] = useState<ReferralReward[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      const { data: referralsData } = await supabase
        .from("profiles")
        .select("id, full_name, referral_code, created_at")
        .eq("referred_by", user.id)
        .order("created_at", { ascending: false });

      const referralIds = referralsData?.map((r) => r.id) ?? [];

      const [rewardsRes, engagementsRes] = await Promise.all([
        supabase.from("rewards").select("id, amount, type").eq("user_id", user.id).eq("type", "referral"),
        referralIds.length > 0
          ? supabase.from("leads").select("id, client_id, status").in("client_id", referralIds)
          : Promise.resolve({ data: [] }),
      ]);

      setReferrals((referralsData as ReferralUser[]) ?? []);
      setRewards((rewardsRes.data as ReferralReward[]) ?? []);
      setEngagements(((engagementsRes as { data: Engagement[] | null }).data as Engagement[]) ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const totalCommissions = rewards.reduce((s, r) => s + r.amount, 0);
  const approvedCount = engagements.filter((e) => e.status === "approved").length;

  return (
    <ClientPageLayout
      active="referrals"
      eyebrow="Parrainages"
      title="Mes parrainages"
      description="Suis les utilisateurs inscrits grâce à ton code et les commissions générées."
    >
      {loading ? (
        <>
          <StatsSkeleton count={3} />
          <ListSkeleton rows={3} />
        </>
      ) : (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <DashboardCard title="Utilisateurs parrainés" value={referrals.length} />
            <DashboardCard title="Engagements confirmés" value={approvedCount} tone="green" />
            <DashboardCard title="Commissions gagnées" value={`${totalCommissions} €`} tone="indigo" />
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-5 text-xl font-extrabold text-slate-950">Utilisateurs parrainés</h2>
            {referrals.length === 0 ? (
              <EmptyState message="Aucun utilisateur parrainé pour le moment." />
            ) : (
              <div className="space-y-4">
                {referrals.map((r) => {
                  const confirmed = engagements.filter((e) => e.client_id === r.id && e.status === "approved").length;
                  const pending = engagements.filter((e) => e.client_id === r.id && e.status === "pending").length;
                  return (
                    <div key={r.id} className="rounded-2xl border border-slate-100 p-5 transition hover:border-indigo-200">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-extrabold text-slate-950">{r.full_name ?? "Utilisateur"}</h3>
                          <p className="mt-0.5 text-sm text-slate-400">
                            Inscrit le {new Date(r.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="flex gap-3">
                          {pending > 0 && (
                            <div className="rounded-xl bg-yellow-50 px-3 py-2 text-center">
                              <p className="text-lg font-extrabold text-yellow-700">{pending}</p>
                              <p className="text-xs text-yellow-700">En attente</p>
                            </div>
                          )}
                          <div className="rounded-xl bg-green-50 px-3 py-2 text-center">
                            <p className="text-lg font-extrabold text-green-700">{confirmed}</p>
                            <p className="text-xs text-green-700">Confirmés</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </ClientPageLayout>
  );
}
