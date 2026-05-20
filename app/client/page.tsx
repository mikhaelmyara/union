"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
};

type Engagement = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
};

type Reward = {
  id: string;
  amount: number;
  type: "direct" | "referral";
};

type Challenge = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  period_type: "weekly" | "monthly";
  start_date: string;
  end_date: string;
};

type LeaderboardUser = {
  user_id: string;
  full_name: string | null;
  total_rewards: number;
};

export default function ClientPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] =
    useState<"week" | "month">("month");
  const [email, setEmail] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    setEmail(user.email ?? "");
    setCurrentUserId(user.id);

    const { data: rewardsData } = await supabase
      .from("rewards")
      .select("*")
      .eq("user_id", user.id);

    const { data: challengeData } = await supabase
      .from("challenges")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: leaderboardData } = await supabase
      .from("leaderboard")
      .select("*")
      .order("total_rewards", { ascending: false })
      .limit(5);

    const { data: profile } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", user.id)
      .single();

    const { data: campaignsData } = await supabase
      .from("campaigns")
      .select("id, title, description, reward_amount")
      .eq("is_active", true);

    const { data: engagementsData } = await supabase
      .from("leads")
      .select("id, full_name, email, phone, status")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    setRewards(rewardsData ?? []);
    setActiveChallenge(challengeData ?? null);
    setLeaderboard((leaderboardData as LeaderboardUser[]) ?? []);
    setReferralCode(profile?.referral_code ?? "");
    setCampaigns(campaignsData ?? []);
    setEngagements(engagementsData ?? []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
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

  const currentUserRank =
    leaderboard.findIndex((user) => user.user_id === currentUserId) + 1;

  const currentUserLeaderboardData = leaderboard.find(
    (user) => user.user_id === currentUserId
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        <p className="font-semibold text-slate-500">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] p-0 lg:p-3">
      <div className="mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-[#F7F8FC] lg:min-h-[calc(100vh-24px)] lg:rounded-2xl lg:border lg:border-slate-200">
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-6 lg:flex">
          <div>
            <a href="/" className="mb-12 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
                U
              </div>

              <div>
                <p className="text-lg font-bold leading-5 text-slate-900">
                  UNION
                </p>
                <p className="text-sm text-slate-400">Portail client</p>
              </div>
            </a>

            <nav className="space-y-3">
              <a
                href="/client"
                className="block rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-sm"
              >
                Tableau de bord
              </a>

              <a
                href="/campaigns"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Campagnes
              </a>

              <a
                href="/leads"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Mes engagements
              </a>

              <a
                href="/settings"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Paramètres
              </a>
            </nav>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                U
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-900">Client UNION</p>
                <p className="truncate text-sm text-slate-400">{email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="font-semibold text-slate-500 hover:text-slate-900"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        <section className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 lg:px-12 lg:py-8">
          <header className="mb-6 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 lg:hidden">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                U
              </div>

              <div>
                <p className="font-extrabold text-slate-950">UNION</p>
                <p className="text-xs font-medium text-slate-400">
                  Portail client
                </p>
              </div>
            </a>

            <a
              href="/settings"
              className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
            >
              Paramètres
            </a>
          </header>

          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                Bon retour 👋
              </h1>

              <p className="mt-2 max-w-2xl text-base text-slate-500 md:text-lg">
                Voici un résumé de ton activité de collecte d’engagements.
              </p>
            </div>

            <a
              href="/lead"
              className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-center font-bold text-white shadow-md shadow-indigo-200 transition hover:opacity-90 md:w-auto"
            >
              + Nouvel engagement
            </a>
          </div>

          <div className="mb-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
            <p className="text-sm font-medium text-slate-500">
              Mon code de parrainage
            </p>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="break-all text-3xl font-extrabold tracking-tight text-indigo-600 md:text-4xl">
                {referralCode}
              </p>

              <a
                href="/signup"
                className="rounded-xl bg-indigo-50 px-4 py-2 text-center text-sm font-bold text-indigo-600"
              >
                Inviter
              </a>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              Partage ce code pour inviter de nouveaux utilisateurs sur la plateforme.
            </p>
          </div>

          {activeChallenge && (
            <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-5 text-white shadow-xl shadow-indigo-200 md:p-6">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-indigo-100">
                    Challenge actif
                  </p>

                  <h2 className="mt-2 text-2xl font-extrabold md:text-3xl">
                    {activeChallenge.title}
                  </h2>

                  <p className="mt-3 max-w-2xl text-sm text-indigo-100 md:text-base">
                    {activeChallenge.description}
                  </p>

                  <p className="mt-4 font-bold">
                    Prix : {activeChallenge.reward_amount} €
                  </p>

                  <p className="mt-1 text-sm text-indigo-100">
                    {activeChallenge.period_type === "weekly"
                      ? "Hebdomadaire"
                      : "Mensuel"}{" "}
                    · {activeChallenge.start_date} → {activeChallenge.end_date}
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 px-6 py-4 backdrop-blur">
                  <p className="text-sm font-bold uppercase tracking-wide text-indigo-100">
                    Bonus
                  </p>

                  <p className="mt-2 text-4xl font-extrabold">
                    {activeChallenge.reward_amount}€
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-10 grid grid-cols-2 gap-4 xl:grid-cols-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <p className="text-2xl font-extrabold text-slate-950 md:text-3xl">
                {engagements.length}
              </p>
              <p className="mt-2 text-sm font-medium text-slate-500 md:text-base">
                Engagements
              </p>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-5 shadow-sm ring-1 ring-yellow-100">
              <p className="text-2xl font-extrabold text-yellow-700 md:text-3xl">
                {pendingEngagements}
              </p>
              <p className="mt-2 text-sm font-medium text-yellow-700 md:text-base">
                En attente
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5 shadow-sm ring-1 ring-green-100">
              <p className="text-2xl font-extrabold text-green-700 md:text-3xl">
                {approvedEngagements}
              </p>
              <p className="mt-2 text-sm font-medium text-green-700 md:text-base">
                Approuvés
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-5 shadow-sm ring-1 ring-red-100">
              <p className="text-2xl font-extrabold text-red-700 md:text-3xl">
                {rejectedEngagements}
              </p>
              <p className="mt-2 text-sm font-medium text-red-700 md:text-base">
                Refusés
              </p>
            </div>

            <div className="col-span-2 rounded-2xl bg-indigo-600 p-5 text-white shadow-md shadow-indigo-200 xl:col-span-1">
              <p className="text-2xl font-extrabold md:text-3xl">
                {totalRewards} €
              </p>
              <p className="mt-2 text-sm font-medium text-indigo-100 md:text-base">
                Gains totaux
              </p>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold text-slate-950 md:text-2xl">
                  Campagnes actives
                </h2>

                <a href="/campaigns" className="text-sm font-bold text-indigo-600 md:text-base">
                  Voir tout →
                </a>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <a
                    key={campaign.id}
                    href={`/lead?campaign=${campaign.id}`}
                    className="block rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md md:p-6"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-950">
                          {campaign.title}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-sm text-slate-500 md:text-base">
                          {campaign.description}
                        </p>

                        <p className="mt-3 text-sm font-extrabold text-indigo-600 md:text-base">
                          Engagement approuvé = {campaign.reward_amount} €
                        </p>
                      </div>

                      <span className="text-3xl text-slate-300">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-extrabold text-slate-950 md:text-2xl">
                  Mes engagements récents
                </h2>

                <a href="/leads" className="text-sm font-bold text-indigo-600 md:text-base">
                  Voir tout →
                </a>
              </div>

              <div className="space-y-4">
                {engagements.length === 0 ? (
                  <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm ring-1 ring-slate-100">
                    Aucun engagement pour le moment.
                  </div>
                ) : (
                  engagements.slice(0, 5).map((engagement) => (
                    <div
                      key={engagement.id}
                      className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="font-extrabold text-slate-950">
                            {engagement.full_name}
                          </h3>

                          <p className="text-sm font-medium text-slate-400">
                            {engagement.email}
                          </p>
                        </div>

                        <span
                          className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${
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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>

          <div className="mt-10 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
            <div className="mb-6">
              <h2 className="text-xl font-extrabold text-slate-950 md:text-2xl">
                Top performers 🏆
              </h2>

              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Les meilleurs utilisateurs de la plateforme.
              </p>

              {currentUserRank > 0 && (
                <div className="mt-4 rounded-2xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
                  <p className="text-sm font-bold uppercase tracking-wide text-indigo-600">
                    Votre classement
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-3xl font-extrabold text-slate-950">
                        #{currentUserRank}
                      </p>

                      <p className="text-sm text-slate-500">
                        Classement actuel
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-extrabold text-indigo-600">
                        {currentUserLeaderboardData?.total_rewards ?? 0} €
                      </p>

                      <p className="text-sm text-slate-500">Gains cumulés</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              <button
                onClick={() => setLeaderboardPeriod("week")}
                className={`rounded-xl px-4 py-2 font-bold ${
                  leaderboardPeriod === "week"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                Cette semaine
              </button>

              <button
                onClick={() => setLeaderboardPeriod("month")}
                className={`rounded-xl px-4 py-2 font-bold ${
                  leaderboardPeriod === "month"
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                Ce mois
              </button>
            </div>

            <div className="space-y-4">
              {leaderboard
                .filter((user, index) => {
                  if (leaderboardPeriod === "week") return index < 3;
                  return true;
                })
                .map((user, index) => {
                  const initials =
                    user.full_name
                      ?.split(" ")
                      .map((part) => part[0])
                      .join("")
                      .toUpperCase() || "U";

                  return (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between rounded-2xl border border-slate-100 p-4 md:p-5"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-extrabold text-indigo-600 md:h-12 md:w-12">
                          #{index + 1}
                        </div>

                        <div>
                          <p className="text-lg font-extrabold text-slate-950">
                            {initials}
                          </p>

                          <p className="text-sm text-slate-500">
                            Top performer
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-extrabold text-indigo-600 md:text-2xl">
                          {user.total_rewards} €
                        </p>

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
  );
}