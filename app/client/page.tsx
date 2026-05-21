"use client";

import DashboardCard from "@/components/ui/DashboardCard";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import StatusBadge from "@/components/ui/StatusBadge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Campaign = { id: string; title: string; description: string | null; reward_amount: number };
type Engagement = { id: string; full_name: string; email: string; phone: string | null; status: string };
type Reward = { id: string; amount: number; type: "direct" | "referral" };
type Challenge = { id: string; title: string; description: string | null; reward_amount: number; period_type: "weekly" | "monthly"; start_date: string; end_date: string };
type LeaderboardUser = { user_id: string; full_name: string | null; total_rewards: number };

export default function ClientPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<"week" | "month">("month");
  const [email, setEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    loadPage();
    const channel = supabase
      .channel("client-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => loadPage())
      .on("postgres_changes", { event: "*", schema: "public", table: "rewards" }, () => loadPage())
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, () => loadPage())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadPage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    setEmail(user.email ?? "");
    setCurrentUserId(user.id);

    const [rewardsRes, challengeRes, leaderboardRes, profileRes, campaignsRes, engagementsRes] = await Promise.all([
      supabase.from("rewards").select("*").eq("user_id", user.id),
      supabase.from("challenges").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("leaderboard").select("*").order("total_rewards", { ascending: false }).limit(5),
      supabase.from("profiles").select("referral_code").eq("id", user.id).single(),
      supabase.from("campaigns").select("id, title, description, reward_amount").eq("is_active", true),
      supabase.from("leads").select("id, full_name, email, phone, status").eq("client_id", user.id).order("created_at", { ascending: false }),
    ]);

    setRewards(rewardsRes.data ?? []);
    setActiveChallenge(challengeRes.data ?? null);
    setLeaderboard((leaderboardRes.data as LeaderboardUser[]) ?? []);
    setReferralCode(profileRes.data?.referral_code ?? "");
    setCampaigns(campaignsRes.data ?? []);
    setEngagements(engagementsRes.data ?? []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const pendingEngagements = engagements.filter((e) => e.status === "pending").length;
  const approvedEngagements = engagements.filter((e) => e.status === "approved").length;
  const rejectedEngagements = engagements.filter((e) => e.status === "rejected").length;
  const directRewards = rewards.filter((r) => r.type === "direct").reduce((s, r) => s + r.amount, 0);
  const referralRewards = rewards.filter((r) => r.type === "referral").reduce((s, r) => s + r.amount, 0);
  const totalRewards = directRewards + referralRewards;
  const currentUserRank = leaderboard.findIndex((u) => u.user_id === currentUserId) + 1;
  const currentUserLeaderboardData = leaderboard.find((u) => u.user_id === currentUserId);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F7F8FC]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="font-bold text-slate-400">Chargement...</p>
      </main>
    );
  }

  return (
    <>
      <MobileHeader title="Dashboard client" subtitle="UNION" />

      <main className="min-h-screen bg-[#F7F8FC] p-0 pb-28 lg:p-3 lg:pb-3">
        <div className="mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-[#F7F8FC] lg:min-h-[calc(100vh-24px)] lg:rounded-2xl lg:border lg:border-slate-200">
          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-6 lg:flex">
            <div>
              <a href="/" className="mb-12 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">U</div>
                <div>
                  <p className="text-lg font-bold leading-5 text-slate-900">UNION</p>
                  <p className="text-sm text-slate-400">Portail client</p>
                </div>
              </a>
              <nav className="space-y-1">
                {[
                  { href: "/client", label: "Tableau de bord", active: true },
                  { href: "/campaigns", label: "Campagnes", active: false },
                  { href: "/leads", label: "Mes engagements", active: false },
                  { href: "/referrals", label: "Parrainages", active: false },
                  { href: "/notifications", label: "Notifications", active: false },
                  { href: "/settings", label: "Paramètres", active: false },
                ].map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl px-4 py-3 font-semibold transition ${
                      item.active
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">U</div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">Client UNION</p>
                  <p className="truncate text-sm text-slate-400">{email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 hover:text-slate-900">
                Déconnexion
              </button>
            </div>
          </aside>

          {/* Main content */}
          <section className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 lg:px-12 lg:py-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Bon retour 👋</h1>
                <p className="mt-2 max-w-2xl text-base text-slate-500 md:text-lg">Voici un résumé de ton activité de collecte d'engagements.</p>
              </div>
              <a href="/lead" className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-center font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 md:w-auto">
                + Nouvel engagement
              </a>
            </div>

            {/* Code parrainage */}
            <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
              <p className="text-sm font-medium text-slate-500">Mon code de parrainage</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="break-all text-3xl font-extrabold tracking-tight text-indigo-600 md:text-4xl">{referralCode}</p>
                <a href="/referrals" className="rounded-xl bg-indigo-50 px-4 py-2 text-center text-sm font-bold text-indigo-600 transition hover:bg-indigo-100">
                  Voir mes parrainages →
                </a>
              </div>
              <p className="mt-3 text-sm text-slate-500">Partage ce code pour inviter de nouveaux utilisateurs sur la plateforme.</p>
            </div>

            {/* Challenge actif */}
            {activeChallenge && (
              <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-indigo-200 md:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-indigo-100">Challenge actif</p>
                    <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">{activeChallenge.title}</h2>
                    <p className="mt-3 max-w-2xl text-sm text-indigo-100 md:text-base">{activeChallenge.description}</p>
                    <p className="mt-4 font-bold">Prix : {activeChallenge.reward_amount} €</p>
                    <p className="mt-1 text-sm text-indigo-100">
                      {activeChallenge.period_type === "weekly" ? "Hebdomadaire" : "Mensuel"}
                      {" "}· {activeChallenge.start_date} → {activeChallenge.end_date}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
                    <p className="text-sm font-bold uppercase tracking-wide text-indigo-100">Bonus</p>
                    <p className="mt-2 text-4xl font-extrabold">{activeChallenge.reward_amount}€</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="mb-10 grid grid-cols-2 gap-4 xl:grid-cols-5">
              <DashboardCard title="Engagements" value={engagements.length} />
              <DashboardCard title="En attente" value={pendingEngagements} tone="yellow" />
              <DashboardCard title="Approuvés" value={approvedEngagements} tone="green" />
              <DashboardCard title="Refusés" value={rejectedEngagements} tone="red" />
              <DashboardCard title="Gains totaux" value={`${totalRewards} €`} tone="indigo" />
            </div>

            {/* Grille campagnes + engagements */}
            <div className="grid gap-8 xl:grid-cols-2">
              {/* Campagnes */}
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-extrabold text-slate-950 md:text-2xl">Campagnes actives</h2>
                  <a href="/campaigns" className="text-sm font-bold text-indigo-600 hover:underline">Voir tout →</a>
                </div>
                <div className="space-y-4">
                  {campaigns.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 text-slate-400 shadow-sm ring-1 ring-slate-100">Aucune campagne active.</div>
                  ) : (
                    campaigns.slice(0, 3).map((campaign) => (
                      <a
                        key={campaign.id}
                        href={`/lead?campaign=${campaign.id}`}
                        className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md md:p-6"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-extrabold text-slate-950">{campaign.title}</h3>
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{campaign.description}</p>
                            <p className="mt-3 text-sm font-extrabold text-indigo-600">Approuvé = {campaign.reward_amount} €</p>
                          </div>
                          <span className="text-2xl text-slate-300">→</span>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </section>

              {/* Derniers engagements */}
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-xl font-extrabold text-slate-950 md:text-2xl">Mes derniers engagements</h2>
                  <a href="/leads" className="text-sm font-bold text-indigo-600 hover:underline">Voir tout →</a>
                </div>
                <div className="space-y-4">
                  {engagements.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 text-slate-400 shadow-sm ring-1 ring-slate-100">Aucun engagement pour le moment.</div>
                  ) : (
                    engagements.slice(0, 5).map((engagement) => (
                      <div key={engagement.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h3 className="font-extrabold text-slate-950">{engagement.full_name}</h3>
                            <p className="text-sm font-medium text-slate-400">{engagement.email}</p>
                          </div>
                          <StatusBadge status={engagement.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Leaderboard */}
            <div className="mt-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-950 md:text-2xl">Top performers 🏆</h2>
                <p className="mt-2 text-sm text-slate-500">Les meilleurs utilisateurs de la plateforme.</p>
                {currentUserRank > 0 && (
                  <div className="mt-4 rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                    <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">Votre classement</p>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-3xl font-extrabold text-slate-950">#{currentUserRank}</p>
                        <p className="text-sm text-slate-500">Classement actuel</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-indigo-600">{currentUserLeaderboardData?.total_rewards ?? 0} €</p>
                        <p className="text-sm text-slate-500">Gains cumulés</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6 flex flex-wrap gap-3">
                {(["week", "month"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setLeaderboardPeriod(p)}
                    className={`rounded-xl px-4 py-2 font-bold transition ${leaderboardPeriod === p ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
                  >
                    {p === "week" ? "Cette semaine" : "Ce mois"}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {leaderboard
                  .filter((_, i) => leaderboardPeriod === "week" ? i < 3 : true)
                  .map((user, index) => {
                    const initials = user.full_name?.split(" ").map((p) => p[0]).join("").toUpperCase() || "U";
                    return (
                      <div key={user.user_id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 md:p-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-extrabold text-indigo-600">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="text-lg font-extrabold text-slate-950">{initials}</p>
                            <p className="text-sm text-slate-500">Top performer</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-indigo-600">{user.total_rewards} €</p>
                          <p className="text-sm text-slate-500">Gains</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </section>
        </div>
      </main>

      <MobileBottomNav active="dashboard" />
    </>
  );
}
