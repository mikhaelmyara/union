"use client";

import DashboardCard from "@/components/ui/DashboardCard";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import NotificationBell from "@/components/ui/NotificationBell";
import StatusBadge from "@/components/ui/StatusBadge";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Campaign = { id: string; title: string; description: string | null; reward_amount: number };
type Engagement = { id: string; full_name: string; email: string; phone: string | null; status: string };
type Reward = { id: string; amount: number; type: "direct" | "referral" };
type Challenge = { id: string; title: string; description: string | null; reward_amount: number; period_type: "weekly" | "monthly"; start_date: string; end_date: string };
type LeaderboardUser = { user_id: string; full_name: string | null; total_rewards: number };

const navItems = [
  { href: "/client",    label: "Tableau de bord", key: "dashboard" },
  { href: "/campaigns", label: "Campagnes",        key: "campaigns" },
  { href: "/leads",     label: "Mes engagements",  key: "engagements" },
  { href: "/referrals", label: "Parrainages",       key: "referrals" },
  { href: "/settings",  label: "Paramètres",        key: "settings" },
];

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
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    initPage();
  }, []);

  async function initPage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    userIdRef.current = user.id;
    setEmail(user.email ?? "");
    setCurrentUserId(user.id);
    await fetchAll(user.id);

    const channel = supabase
      .channel(`client-live-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, () => fetchAll(userIdRef.current!))
      .on("postgres_changes", { event: "*", schema: "public", table: "rewards" }, () => fetchAll(userIdRef.current!))
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, () => fetchAll(userIdRef.current!))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  async function fetchAll(userId: string) {
    // Leaderboard selon la période sélectionnée — on charge les deux en parallèle
    const [rewardsRes, challengeRes, lbMonthRes, lbWeekRes, profileRes, campaignsRes, engagementsRes] = await Promise.all([
      supabase.from("rewards").select("*").eq("user_id", userId),
      supabase.from("challenges").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("leaderboard_month").select("*").order("total_rewards", { ascending: false }).limit(5),
      supabase.from("leaderboard_week").select("*").order("total_rewards", { ascending: false }).limit(3),
      supabase.from("profiles").select("referral_code").eq("id", userId).single(),
      supabase.from("campaigns").select("id, title, description, reward_amount").eq("is_active", true),
      supabase.from("leads").select("id, full_name, email, phone, status").eq("client_id", userId).order("created_at", { ascending: false }),
    ]);

    setRewards(rewardsRes.data ?? []);
    setActiveChallenge(challengeRes.data ?? null);
    // On stocke les deux dans un objet pour switcher sans refetch
    setLeaderboardData({
      month: (lbMonthRes.data as LeaderboardUser[]) ?? [],
      week: (lbWeekRes.data as LeaderboardUser[]) ?? [],
    });
    setReferralCode(profileRes.data?.referral_code ?? "");
    setCampaigns(campaignsRes.data ?? []);
    setEngagements(engagementsRes.data ?? []);
    setLoading(false);
  }

  const [leaderboardData, setLeaderboardData] = useState<{ month: LeaderboardUser[]; week: LeaderboardUser[] }>({ month: [], week: [] });

  // Leaderboard affiché selon la période
  const currentLeaderboard = leaderboardPeriod === "week" ? leaderboardData.week : leaderboardData.month;
  const currentUserRank = currentLeaderboard.findIndex((u) => u.user_id === currentUserId) + 1;
  const currentUserData = currentLeaderboard.find((u) => u.user_id === currentUserId);

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

  if (loading) return <PageSkeleton />;

  return (
    <>
      <MobileHeader title="Dashboard client" subtitle="UNION" />

      <main className="min-h-screen bg-[#F7F8FC] p-0 pb-28 lg:p-3 lg:pb-3">
        <div className="mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-[#F7F8FC] lg:min-h-[calc(100vh-24px)] lg:rounded-2xl lg:border lg:border-slate-200">

          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-6 lg:flex">
            <div>
              <a href="/" className="mb-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">U</div>
                <div>
                  <p className="text-lg font-bold leading-5 text-slate-900">UNION</p>
                  <p className="text-sm text-slate-400">Portail client</p>
                </div>
              </a>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <a key={item.key} href={item.href}
                    className={`block rounded-xl px-4 py-3 font-semibold transition ${
                      item.key === "dashboard" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">U</div>
                  <p className="truncate text-sm text-slate-500">{email}</p>
                </div>
                <NotificationBell />
              </div>
              <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
                Déconnexion
              </button>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 lg:px-12 lg:py-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Bon retour 👋</h1>
                <p className="mt-2 text-base text-slate-500">Voici un résumé de ton activité.</p>
              </div>
              <a href="/lead" className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-center font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 md:w-auto">
                + Nouvel engagement
              </a>
            </div>

            {/* Code parrainage */}
            <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-sm font-medium text-slate-500">Mon code de parrainage</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-3xl font-extrabold tracking-tight text-indigo-600 md:text-4xl">{referralCode}</p>
                <a href="/referrals" className="rounded-xl bg-indigo-50 px-4 py-2 text-center text-sm font-bold text-indigo-600 transition hover:bg-indigo-100">
                  Voir mes parrainages →
                </a>
              </div>
              <p className="mt-3 text-sm text-slate-500">Partage ce code pour inviter de nouveaux utilisateurs.</p>
            </div>

            {/* Challenge actif */}
            {activeChallenge && (
              <div className="mb-8 overflow-hidden rounded-2xl bg-linear-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-indigo-200 md:p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-indigo-100">Challenge actif</p>
                    <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">{activeChallenge.title}</h2>
                    <p className="mt-3 text-sm text-indigo-100">{activeChallenge.description}</p>
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

            {/* Campagnes + Engagements */}
            <div className="grid gap-8 xl:grid-cols-2">
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-950">Campagnes actives</h2>
                  <a href="/campaigns" className="text-sm font-bold text-indigo-600 hover:underline">Voir tout →</a>
                </div>
                <div className="space-y-3">
                  {campaigns.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 text-slate-400 shadow-sm ring-1 ring-slate-100">Aucune campagne active.</div>
                  ) : (
                    campaigns.slice(0, 3).map((c) => (
                      <a key={c.id} href={`/lead?campaign=${c.id}`}
                        className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-extrabold text-slate-950">{c.title}</h3>
                            <p className="mt-1 line-clamp-1 text-sm text-slate-500">{c.description}</p>
                            <p className="mt-2 text-sm font-extrabold text-indigo-600">{c.reward_amount} € par engagement</p>
                          </div>
                          <span className="text-2xl text-slate-300">→</span>
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </section>

              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-slate-950">Mes derniers engagements</h2>
                  <a href="/leads" className="text-sm font-bold text-indigo-600 hover:underline">Voir tout →</a>
                </div>
                <div className="space-y-3">
                  {engagements.length === 0 ? (
                    <div className="rounded-2xl bg-white p-6 text-slate-400 shadow-sm ring-1 ring-slate-100">Aucun engagement pour le moment.</div>
                  ) : (
                    engagements.slice(0, 5).map((e) => (
                      <div key={e.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <h3 className="font-extrabold text-slate-950">{e.full_name}</h3>
                            <p className="text-sm text-slate-400">{e.email}</p>
                          </div>
                          <StatusBadge status={e.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* Leaderboard — branché sur les vraies vues SQL */}
            <div className="mt-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
              <div className="mb-6">
                <h2 className="text-xl font-extrabold text-slate-950 md:text-2xl">Top performers 🏆</h2>
                <p className="mt-1 text-sm text-slate-500">Les meilleurs utilisateurs de la plateforme.</p>

                {currentUserRank > 0 && (
                  <div className="mt-4 rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                    <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Votre classement</p>
                    <div className="mt-2 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-3xl font-extrabold text-slate-950">#{currentUserRank}</p>
                        <p className="text-sm text-slate-500">{leaderboardPeriod === "week" ? "Cette semaine" : "Ce mois"}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-extrabold text-indigo-600">{currentUserData?.total_rewards ?? 0} €</p>
                        <p className="text-sm text-slate-500">Gains</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Toggle période — switche sans refetch */}
              <div className="mb-6 flex gap-3">
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

              <div className="space-y-3">
                {currentLeaderboard.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                    Aucun classement pour cette période.
                  </div>
                ) : (
                  currentLeaderboard.map((user, index) => {
                    const initials = user.full_name?.split(" ").map((p) => p[0]).join("").toUpperCase() || "U";
                    const medals = ["🥇", "🥈", "🥉"];
                    return (
                      <div key={user.user_id} className={`flex items-center justify-between rounded-2xl border p-4 ${user.user_id === currentUserId ? "border-indigo-200 bg-indigo-50" : "border-slate-100"}`}>
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-extrabold text-indigo-600">
                            {medals[index] ?? `#${index + 1}`}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-950">{initials}</p>
                            <p className="text-xs text-slate-400">
                              {user.user_id === currentUserId ? "Vous" : "Top performer"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-extrabold text-indigo-600">{user.total_rewards} €</p>
                          <p className="text-xs text-slate-400">Gains</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      <MobileBottomNav active="dashboard" />
    </>
  );
}
