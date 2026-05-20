"use client";

import { toast } from "sonner";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import PageActions from "@/components/PageActions";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  client_id: string | null;
  campaign_title_snapshot: string | null;
  campaigns: {
    title: string;
    reward_amount: number;
    referral_reward_amount: number;
  } | null;
};

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  referral_reward_amount: number;
  is_active: boolean;
};

type Reward = {
  id: string;
  user_id: string;
  lead_id: string;
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
  is_active: boolean;
};

export default function FounderPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [email, setEmail] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardAmount, setRewardAmount] = useState(0);
  const [referralRewardAmount, setReferralRewardAmount] = useState(0);
  const [creatingCampaign, setCreatingCampaign] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState("all");
  const [challenges, setChallenges] = useState<Challenge[]>([]);

const [challengeTitle, setChallengeTitle] = useState("");
const [challengeDescription, setChallengeDescription] = useState("");

const [challengeReward, setChallengeReward] = useState(0);

const [challengePeriod, setChallengePeriod] =
  useState<"weekly" | "monthly">("weekly");

const [challengeStartDate, setChallengeStartDate] =
  useState("");

const [challengeEndDate, setChallengeEndDate] =
  useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

        async function loadDashboard() {
            const {
            data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
            window.location.href = "/login";
            return;
            }

            setEmail(user.email ?? "");

            const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

            if (profile?.role !== "founder") {
            window.location.href = "/client";
            return;
    }

    const { data: leadsData } = await supabase
      .from("leads")
      .select(`
        id,
        full_name,
        email,
        phone,
        status,
        created_at,
        client_id,
        campaign_title_snapshot,
        campaigns (
          title,
          reward_amount,
          referral_reward_amount
        )
      `)
      .order("created_at", { ascending: false });

    const { data: campaignsData } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: rewardsData } = await supabase
      .from("rewards")
      .select("*")
      .order("created_at", { ascending: false });
    
      const { data: challengesData } = await supabase
  .from("challenges")
  .select("*")
  .order("created_at", { ascending: false });

    setLeads((leadsData as unknown as Lead[]) ?? []);
    setCampaigns((campaignsData as Campaign[]) ?? []);
    setRewards((rewardsData as Reward[]) ?? []);
    setChallenges((challengesData as Challenge[]) ?? []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }


async function createChallenge() {
  if (!challengeTitle.trim()) {
    toast.error("Le titre du challenge est obligatoire.");
    return;
  }

  if (challengeReward <= 0) {
    toast.error("La récompense du challenge doit être supérieure à 0.");
    return;
  }

  if (!challengeStartDate || !challengeEndDate) {
    toast.error("Les dates du challenge sont obligatoires.");
    return;
  }

  const { error } = await supabase.from("challenges").insert({
    title: challengeTitle.trim(),
    description: challengeDescription.trim(),
    reward_amount: challengeReward,
    period_type: challengePeriod,
    start_date: challengeStartDate,
    end_date: challengeEndDate,
  });

  if (error) {
    toast.error(error.message);
    return;
  }

  toast.success("Challenge créé.");

  setChallengeTitle("");
  setChallengeDescription("");
  setChallengeReward(0);
  setChallengePeriod("weekly");
  setChallengeStartDate("");
  setChallengeEndDate("");

  loadDashboard();
}

async function toggleChallenge(
  challengeId: string,
  isActive: boolean
) {
  const { error } = await supabase
    .from("challenges")
    .update({ is_active: !isActive })
    .eq("id", challengeId);

  if (error) {
    toast.error(error.message);
    return;
  }

  loadDashboard();
}
  async function createCampaign() {
    if (creatingCampaign) return;

    if (!title.trim()) {
      toast.error("Le titre est obligatoire.");
      return;
    }

    if (description.trim().length < 10) {
      toast.error("La description doit contenir au moins 10 caractères.");
      return;
    }

    if (rewardAmount <= 0) {
      toast.error("La récompense doit être supérieure à 0.");
      return;
    }

    if (referralRewardAmount < 0) {
      toast.error("La récompense parrain ne peut pas être négative.");
      return;
    }

    setCreatingCampaign(true);

    const { error } = await supabase.from("campaigns").insert({
      title: title.trim(),
      description: description.trim(),
      reward_amount: rewardAmount,
      referral_reward_amount: referralRewardAmount,
    });

    setCreatingCampaign(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Campagne créée.");

    setTitle("");
    setDescription("");
    setRewardAmount(0);
    setReferralRewardAmount(0);

    loadDashboard();
  }

  async function toggleCampaign(campaignId: string, isActive: boolean) {
    const { error } = await supabase
      .from("campaigns")
      .update({ is_active: !isActive })
      .eq("id", campaignId);

    if (error) {
      toast.error(error.message);
      return;
    }

    loadDashboard();
  }

  async function deleteCampaign(campaignId: string) {
    const confirmed = confirm(
      "Supprimer cette campagne ? Les engagements resteront sauvegardés."
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", campaignId);

    if (error) {
      toast.error(error.message);
      return;
    }

    loadDashboard();
  }

 async function updateStatus(
  leadId: string,
  status: "approved" | "rejected" | "pending"
) {
  const { error: updateError } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId);

  if (updateError) {
    toast.error(updateError.message);
    return;
  }

  if (status !== "approved") {
    await supabase
      .from("rewards")
      .delete()
      .eq("lead_id", leadId);

    loadDashboard();
    return;
  }

  const { data: leadData, error: leadError } = await supabase
    .from("leads")
    .select(`
      id,
      client_id,
      campaign_id,
      campaigns (
        reward_amount,
        referral_reward_amount
      )
    `)
    .eq("id", leadId)
    .single();

  if (leadError || !leadData) {
    toast.error(leadError?.message || "Engagement introuvable.");
    return;
  }

  const campaignData = Array.isArray(leadData.campaigns)
    ? leadData.campaigns[0]
    : leadData.campaigns;

  const clientId = leadData.client_id;

  if (!clientId) {
    toast.error("Cet engagement n'a pas de client associé.");
    return;
  }

  const { data: clientProfile } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", clientId)
    .single();

  const directAmount = campaignData?.reward_amount ?? 0;
  const referralAmount = campaignData?.referral_reward_amount ?? 0;
  const referrerId = clientProfile?.referred_by;

  if (directAmount > 0) {
    const { error: directError } = await supabase.from("rewards").upsert(
      {
        user_id: clientId,
        lead_id: leadId,
        amount: directAmount,
        type: "direct",
      },
      {
        onConflict: "user_id,lead_id,type",
        ignoreDuplicates: false,
      }
    );

    if (directError) {
      toast.error(directError.message);
      return;
    }
  }

  if (referrerId && referralAmount > 0) {
    const { error: referralError } = await supabase.from("rewards").upsert(
      {
        user_id: referrerId,
        lead_id: leadId,
        amount: referralAmount,
        type: "referral",
      },
      {
        onConflict: "user_id,lead_id,type",
        ignoreDuplicates: false,
      }
    );

    if (referralError) {
      toast.error(referralError.message);
      return;
    }
  }

  loadDashboard();
}

  function exportLeadsToExcel() {
    const formattedLeads = leads.map((lead) => ({
      Nom: lead.full_name,
      Email: lead.email,
      Téléphone: lead.phone,
      Statut: lead.status,
      Campagne:
        lead.campaigns?.title ||
        lead.campaign_title_snapshot ||
        "Campagne supprimée",
      Récompense: lead.campaigns?.reward_amount ?? 0,
      "Récompense parrain": lead.campaigns?.referral_reward_amount ?? 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedLeads);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Engagements");
    XLSX.writeFile(workbook, "union-engagements.xlsx");
  }

  const pendingLeads = leads.filter((lead) => lead.status === "pending").length;
  const approvedLeads = leads.filter((lead) => lead.status === "approved").length;
  const rejectedLeads = leads.filter((lead) => lead.status === "rejected").length;

  const directRewards = rewards
    .filter((reward) => reward.type === "direct")
    .reduce((sum, reward) => sum + reward.amount, 0);

  const referralRewards = rewards
    .filter((reward) => reward.type === "referral")
    .reduce((sum, reward) => sum + reward.amount, 0);

  const totalRewards = directRewards + referralRewards;

  const chartData = [
    { name: "En attente", value: pendingLeads },
    { name: "Approuvés", value: approvedLeads },
    { name: "Refusés", value: rejectedLeads },
  ];

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = `${campaign.title} ${campaign.description ?? ""}`
      .toLowerCase()
      .includes(campaignSearch.toLowerCase());

    const matchesStatus =
      campaignStatusFilter === "all" ||
      (campaignStatusFilter === "active" && campaign.is_active) ||
      (campaignStatusFilter === "inactive" && !campaign.is_active);

    return matchesSearch && matchesStatus;
  });

  const filteredLeads = leads.filter((lead) => {
    const campaignName =
      lead.campaigns?.title ||
      lead.campaign_title_snapshot ||
      "Campagne supprimée";

    const matchesSearch = `${lead.full_name} ${lead.email} ${lead.phone} ${campaignName}`
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] p-3">
      <div className="mx-auto flex min-h-[calc(100vh-24px)] max-w-7xl overflow-hidden rounded-2xl border border-slate-200 bg-[#F7F8FC]">
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
                <p className="text-sm text-slate-400">Portail fondateur</p>
              </div>
            </a>

            <nav className="space-y-3">
              <a
                href="/founder"
                className="block rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-sm"
              >
                Tableau de bord
              </a>

              <a
                href="#campaigns"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Campagnes
              </a>

              <a
                href="#engagements"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Engagements
              </a>

              <a
                href="/partner"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Vue partenaire
              </a>
            </nav>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                F
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-900">Fondateur UNION</p>
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

        <section className="flex-1 overflow-y-auto px-5 py-8 md:px-10 lg:px-12">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                Dashboard fondateur 🚀
              </h1>

              <p className="mt-2 text-lg text-slate-500">
                Gère les campagnes, les engagements et les récompenses depuis un seul espace.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <PageActions backHref="/" />

              <button
                onClick={exportLeadsToExcel}
                className="rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white"
              >
                Télécharger Excel
              </button>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <p className="text-3xl font-extrabold text-slate-950">
                {leads.length}
              </p>
              <p className="mt-2 font-medium text-slate-500">Total engagements</p>
            </div>

            <div className="rounded-2xl bg-yellow-50 p-6 shadow-sm ring-1 ring-yellow-100">
              <p className="text-3xl font-extrabold text-yellow-700">
                {pendingLeads}
              </p>
              <p className="mt-2 font-medium text-yellow-700">En attente</p>
            </div>

            <div className="rounded-2xl bg-green-50 p-6 shadow-sm ring-1 ring-green-100">
              <p className="text-3xl font-extrabold text-green-700">
                {approvedLeads}
              </p>
              <p className="mt-2 font-medium text-green-700">Approuvés</p>
            </div>

            <div className="rounded-2xl bg-red-50 p-6 shadow-sm ring-1 ring-red-100">
              <p className="text-3xl font-extrabold text-red-700">
                {rejectedLeads}
              </p>
              <p className="mt-2 font-medium text-red-700">Refusés</p>
            </div>

            <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-md shadow-indigo-200">
              <p className="text-3xl font-extrabold">{totalRewards} €</p>
              <p className="mt-2 font-medium text-indigo-100">Gains totaux</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <p className="text-3xl font-extrabold text-slate-950">
                {referralRewards} €
              </p>
              <p className="mt-2 font-medium text-slate-500">
                Commissions parrainage
              </p>
            </div>
          </div>

<div className="mb-10 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
  <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
    Challenges
  </h2>

  <div className="mb-8 grid gap-4">
    <input
      className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
      placeholder="Titre du challenge"
      value={challengeTitle}
      onChange={(e) => setChallengeTitle(e.target.value)}
    />

    <textarea
      className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
      placeholder="Description"
      value={challengeDescription}
      onChange={(e) => setChallengeDescription(e.target.value)}
    />

    <input
      className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
      placeholder="Récompense challenge (€)"
      type="number"
      value={challengeReward}
      onChange={(e) => setChallengeReward(Number(e.target.value))}
    />

    <select
      className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
      value={challengePeriod}
      onChange={(e) =>
        setChallengePeriod(e.target.value as "weekly" | "monthly")
      }
    >
      <option value="weekly">Hebdomadaire</option>
      <option value="monthly">Mensuel</option>
    </select>

    <input
      className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
      type="date"
      value={challengeStartDate}
      onChange={(e) => setChallengeStartDate(e.target.value)}
    />

    <input
      className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
      type="date"
      value={challengeEndDate}
      onChange={(e) => setChallengeEndDate(e.target.value)}
    />

    <button
      onClick={createChallenge}
      className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white"
    >
      Créer challenge
    </button>
  </div>

  <div className="space-y-4">
    {challenges.map((challenge) => (
      <div
        key={challenge.id}
        className="rounded-2xl border border-slate-100 p-5"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-slate-950">
              {challenge.title}
            </h3>

            <p className="mt-1 text-slate-500">
              {challenge.description}
            </p>

            <p className="mt-3 font-bold text-indigo-600">
              Prix : {challenge.reward_amount} €
            </p>

            <p className="text-sm text-slate-500">
              {challenge.period_type === "weekly" ? "Hebdomadaire" : "Mensuel"} ·{" "}
              {challenge.start_date} → {challenge.end_date}
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

          <button
            onClick={() =>
              toggleChallenge(challenge.id, challenge.is_active)
            }
            className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white"
          >
            {challenge.is_active ? "Désactiver" : "Activer"}
          </button>
        </div>
      </div>
    ))}
  </div>
</div>

          <div className="mb-10 grid gap-8 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-6 text-2xl font-extrabold text-slate-950">
                Analytics des engagements
              </h2>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
                Créer une campagne
              </h2>

              <div className="grid gap-4">
                <input
                  className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
                  placeholder="Titre"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <textarea
                  className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <input
                  className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
                  placeholder="Récompense engagement (€)"
                  type="number"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(Number(e.target.value))}
                />

                <input
                  className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
                  placeholder="Commission parrain (€)"
                  type="number"
                  value={referralRewardAmount}
                  onChange={(e) =>
                    setReferralRewardAmount(Number(e.target.value))
                  }
                />

                <button
                  onClick={createCampaign}
                  disabled={creatingCampaign}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creatingCampaign ? "Création..." : "Créer campagne"}
                </button>
              </div>
            </div>
          </div>

          <section id="campaigns">
            <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
              Campagnes
            </h2>

            <div className="mb-6">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none focus:border-indigo-600"
                placeholder="Rechercher une campagne..."
                value={campaignSearch}
                onChange={(e) => setCampaignSearch(e.target.value)}
              />
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              {[
                { label: "Toutes", value: "all" },
                { label: "Actives", value: "active" },
                { label: "Inactives", value: "inactive" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setCampaignStatusFilter(filter.value)}
                  className={`rounded-xl px-4 py-2 font-bold ${
                    campaignStatusFilter === filter.value
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="mb-10 grid grid-cols-1 gap-4 xl:grid-cols-2">
              {filteredCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-950">
                        {campaign.title}
                      </h3>

                      <p className="mt-1 text-slate-500">
                        {campaign.description}
                      </p>

                      <p className="mt-3 font-extrabold text-indigo-600">
                        Engagement approuvé = {campaign.reward_amount} €
                      </p>

                      <p className="font-bold text-emerald-600">
                        Commission parrain = {campaign.referral_reward_amount} €
                      </p>

                      <span
                        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-bold ${
                          campaign.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {campaign.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() =>
                          toggleCampaign(campaign.id, campaign.is_active)
                        }
                        className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white"
                      >
                        {campaign.is_active ? "Désactiver" : "Activer"}
                      </button>

                      <button
                        onClick={() => deleteCampaign(campaign.id)}
                        className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="engagements">
            <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
              Engagements
            </h2>

            <div className="mb-6">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none focus:border-indigo-600"
                placeholder="Rechercher un engagement..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
              {[
                { label: "Tous", value: "all" },
                { label: "En attente", value: "pending" },
                { label: "Approuvés", value: "approved" },
                { label: "Refusés", value: "rejected" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`rounded-xl px-4 py-2 font-bold ${
                    statusFilter === filter.value
                      ? "bg-indigo-600 text-white"
                      : "bg-white text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-950">
                        {lead.full_name}
                      </h3>

                      <p className="text-sm font-medium text-slate-400">
                        {lead.email}
                      </p>

                      <p className="text-sm text-slate-500">
                        Téléphone : {lead.phone}
                      </p>

                      <p className="text-sm text-slate-500">
                        Campagne :{" "}
                        {lead.campaigns?.title ||
                          lead.campaign_title_snapshot ||
                          "Campagne supprimée"}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-3 md:items-end">
                      <span
                        className={`rounded-full px-3 py-1 text-sm font-bold ${
                          lead.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : lead.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {lead.status === "pending"
                          ? "En attente"
                          : lead.status === "approved"
                          ? "Approuvé"
                          : "Refusé"}
                      </span>

                      <p className="font-extrabold text-indigo-600">
                        {lead.campaigns?.reward_amount ?? 0} €
                      </p>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => updateStatus(lead.id, "approved")}
                          className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white"
                        >
                          Approuver
                        </button>

                        <button
                          onClick={() => updateStatus(lead.id, "pending")}
                          className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-white"
                        >
                          En attente
                        </button>

                        <button
                          onClick={() => updateStatus(lead.id, "rejected")}
                          className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
                        >
                          Refuser
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}