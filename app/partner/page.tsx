"use client";

import ClientPageLayout from "@/components/layout/ClientPageLayout";
import DashboardCard from "@/components/ui/DashboardCard";
import EmptyState from "@/components/ui/EmptyState";
import StatusBadge from "@/components/ui/StatusBadge";
import { PageSkeleton } from "@/components/ui/Skeleton";
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
  campaigns: { title: string; reward_amount: number; referral_reward_amount: number } | null;
};

type Reward = { id: string; amount: number; type: "direct" | "referral" };

export default function PartnerPage() {
  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isFounder, setIsFounder] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const [profileRes, rewardsRes, engagementsRes] = await Promise.all([
      supabase.from("profiles").select("referral_code, role").eq("id", user.id).single(),
      supabase.from("rewards").select("*").eq("user_id", user.id),
      supabase.from("leads")
        .select("id, full_name, email, phone, status, created_at, campaign_title_snapshot, campaigns(title, reward_amount, referral_reward_amount)")
        .eq("partner_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    setReferralCode(profileRes.data?.referral_code ?? "");
    setIsFounder(profileRes.data?.role === "founder");
    setRewards(rewardsRes.data ?? []);
    setEngagements((engagementsRes.data as unknown as Engagement[]) ?? []);
    setLoading(false);
  }

  function copyCode() {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pending         = engagements.filter((e) => e.status === "pending").length;
  const approved        = engagements.filter((e) => e.status === "approved").length;
  const rejected        = engagements.filter((e) => e.status === "rejected").length;
  const directRewards   = rewards.filter((r) => r.type === "direct").reduce((s, r) => s + r.amount, 0);
  const referralRewards = rewards.filter((r) => r.type === "referral").reduce((s, r) => s + r.amount, 0);
  const totalRewards    = directRewards + referralRewards;

  if (loading) return <PageSkeleton />;

  return (
    <ClientPageLayout
      active="referrals"
      eyebrow="Partenaire"
      title="Dashboard partenaire"
      description="Suivez vos engagements, vos gains directs et vos commissions."
      actions={
        <div className="flex flex-wrap gap-3">
          {isFounder && (
            <a href="/founder" className="rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-3 font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700">
              ← Dashboard fondateur
            </a>
          )}
          <a href="/lead" className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700">
            + Nouvel engagement
          </a>
        </div>
      }
    >
      <div className="mb-8 rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Mon code parrain</p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="rounded-xl bg-indigo-600 px-5 py-3 text-2xl font-extrabold text-white">{referralCode || "—"}</div>
          <button onClick={copyCode} className="rounded-xl bg-indigo-50 dark:bg-indigo-900/40 px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-100">
            {copied ? "Copié ✓" : "Copier"}
          </button>
          <p className="text-sm text-slate-500 dark:text-slate-400">Partagez ce code pour inviter d'autres utilisateurs.</p>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-6">
        <DashboardCard title="Total"       value={engagements.length} />
        <DashboardCard title="En attente"  value={pending}                   tone="yellow" />
        <DashboardCard title="Approuvés"   value={approved}                  tone="green" />
        <DashboardCard title="Refusés"     value={rejected}                  tone="red" />
        <DashboardCard title="Gains"       value={`${totalRewards} €`}       tone="indigo" />
        <DashboardCard title="Commissions" value={`${referralRewards} €`} />
      </div>

      <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <h2 className="mb-5 text-xl font-extrabold text-slate-950 dark:text-white">Mes engagements</h2>
        {engagements.length === 0 ? (
          <EmptyState message="Aucun engagement pour le moment." />
        ) : (
          <div className="space-y-3">
            {engagements.map((e) => (
              <div key={e.id} className="rounded-2xl border border-slate-100 dark:border-slate-800 p-5 transition hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-950 dark:text-white">{e.full_name}</h3>
                    <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{e.email}{e.phone ? ` · ${e.phone}` : ""}</p>
                    <p className="mt-1 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {e.campaigns?.title || e.campaign_title_snapshot || "Campagne supprimée"}
                      {e.campaigns?.reward_amount ? ` · ${e.campaigns.reward_amount} €` : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <StatusBadge status={e.status} />
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(e.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ClientPageLayout>
  );
}