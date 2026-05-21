"use client";
import MobileHeader from "@/components/mobile/MobileHeader";
import FounderMobileBottomNav from "@/components/mobile/FounderMobileBottomNav";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import PageActions from "@/components/PageActions";
import AnalyticsSection from "@/components/founder/AnalyticsSection";
import CampaignsSection from "@/components/founder/CampaignsSection";
import ChallengesSection from "@/components/founder/ChallengesSection";
import CreateCampaignForm from "@/components/founder/CreateCampaignForm";
import EngagementsSection from "@/components/founder/EngagementsSection";
import FounderStats from "@/components/founder/FounderStats";
import type {
  Campaign,
  Challenge,
  EngagementStatus,
  Lead,
  Reward,
} from "@/components/founder/types";

export default function FounderPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
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

  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeReward, setChallengeReward] = useState(0);
  const [challengePeriod, setChallengePeriod] =
    useState<"weekly" | "monthly">("weekly");
  const [challengeStartDate, setChallengeStartDate] = useState("");
  const [challengeEndDate, setChallengeEndDate] = useState("");

  useEffect(() => {
  loadDashboard();

  const channel = supabase
    .channel("founder-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "leads" },
      () => loadDashboard()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "rewards" },
      () => loadDashboard()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "campaigns" },
      () => loadDashboard()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "challenges" },
      () => loadDashboard()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
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

  async function toggleChallenge(challengeId: string, isActive: boolean) {
    const { error } = await supabase
      .from("challenges")
      .update({ is_active: !isActive })
      .eq("id", challengeId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(isActive ? "Challenge désactivé." : "Challenge activé.");
    loadDashboard();
  }

  async function deleteChallenge() {
  if (!challengeToDelete) return;

  const { error } = await supabase
    .from("challenges")
    .delete()
    .eq("id", challengeToDelete);

  if (error) {
    toast.error(error.message);
    return;
  }

  toast.success("Challenge supprimé.");

  setChallengeToDelete(null);
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

    toast.success(isActive ? "Campagne désactivée." : "Campagne activée.");
    loadDashboard();
  }

const [campaignToDelete, setCampaignToDelete] =
  useState<string | null>(null);

async function deleteCampaign() {
  if (!campaignToDelete) return;

  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", campaignToDelete);

  if (error) {
    toast.error(error.message);
    return;
  }

  toast.success("Campagne supprimée.");

  setCampaignToDelete(null);

  loadDashboard();
}

const [challengeToDelete, setChallengeToDelete] =
  useState<string | null>(null);

const [logoutOpen, setLogoutOpen] = useState(false);

const [statusAction, setStatusAction] =
  useState<{
    leadId: string;
    status: EngagementStatus;
  } | null>(null);

  async function updateStatus() {
  if (!statusAction) return;

  const { error } = await supabase
    .from("leads")
    .update({ status: statusAction.status })
    .eq("id", statusAction.leadId);

  if (error) {
    toast.error(error.message);
    return;
  }

  toast.success("Statut mis à jour.");

  setStatusAction(null);
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
  <>
    <MobileHeader title="Fondateur" subtitle="UNION" />

    <main className="min-h-screen bg-[#F7F8FC] p-3 pb-28 lg:pb-3">
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
                href="/founder/engagements"
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
              onClick={() => setLogoutOpen(true)}
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

          <FounderStats
            totalEngagements={leads.length}
            pending={pendingLeads}
            approved={approvedLeads}
            rejected={rejectedLeads}
            totalRewards={totalRewards}
            referralRewards={referralRewards}
          />

          <ChallengesSection
            challenges={challenges}
            challengeTitle={challengeTitle}
            challengeDescription={challengeDescription}
            challengeReward={challengeReward}
            challengePeriod={challengePeriod}
            challengeStartDate={challengeStartDate}
            challengeEndDate={challengeEndDate}
            setChallengeTitle={setChallengeTitle}
            setChallengeDescription={setChallengeDescription}
            setChallengeReward={setChallengeReward}
            setChallengePeriod={setChallengePeriod}
            setChallengeStartDate={setChallengeStartDate}
            setChallengeEndDate={setChallengeEndDate}
            createChallenge={createChallenge}
            toggleChallenge={toggleChallenge}
            deleteChallenge={setChallengeToDelete}
          />

          <div id="create-campaign" className="mb-10 grid gap-8 xl:grid-cols-2">
            <AnalyticsSection
              pending={pendingLeads}
              approved={approvedLeads}
              rejected={rejectedLeads}
            />

            <CreateCampaignForm 
              
              title={title}
              description={description}
              rewardAmount={rewardAmount}
              referralRewardAmount={referralRewardAmount}
              creatingCampaign={creatingCampaign}
              setTitle={setTitle}
              setDescription={setDescription}
              setRewardAmount={setRewardAmount}
              setReferralRewardAmount={setReferralRewardAmount}
              createCampaign={createCampaign}
            />
          </div>

          <CampaignsSection
            campaigns={campaigns}
            campaignSearch={campaignSearch}
            campaignStatusFilter={campaignStatusFilter}
            setCampaignSearch={setCampaignSearch}
            setCampaignStatusFilter={setCampaignStatusFilter}
            toggleCampaign={toggleCampaign}
            deleteCampaign={setCampaignToDelete}
          />

          <EngagementsSection
            leads={leads}
            search={search}
            statusFilter={statusFilter}
            setSearch={setSearch}
            setStatusFilter={setStatusFilter}
            updateStatus={(leadId, status) =>
            setStatusAction({ leadId, status })
          }
          />
        </section>
        <ConfirmModal
  open={campaignToDelete !== null}
  title="Supprimer la campagne"
  description="Cette action est définitive."
  confirmLabel="Supprimer"
  cancelLabel="Annuler"
  variant="danger"
  onConfirm={deleteCampaign}
  onCancel={() => setCampaignToDelete(null)}
/>

<ConfirmModal
  open={challengeToDelete !== null}
  title="Supprimer le challenge"
  description="Cette action est définitive."
  confirmLabel="Supprimer"
  cancelLabel="Annuler"
  variant="danger"
  onConfirm={deleteChallenge}
  onCancel={() => setChallengeToDelete(null)}
/>

<ConfirmModal
  open={logoutOpen}
  title="Se déconnecter"
  description="Voulez-vous vraiment quitter votre session ?"
  confirmLabel="Déconnexion"
  cancelLabel="Annuler"
  variant="danger"
  onConfirm={handleLogout}
  onCancel={() => setLogoutOpen(false)}
/>

<ConfirmModal
  open={statusAction !== null}
  title="Modifier le statut"
  description="Confirmer la modification du statut de cet engagement ?"
  confirmLabel="Confirmer"
  cancelLabel="Annuler"
  onConfirm={updateStatus}
  onCancel={() => setStatusAction(null)}
/>
      </div>
        </main>
          <a
            href="#create-campaign"
            className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white shadow-2xl shadow-indigo-300 transition hover:scale-105 lg:hidden"
          >
            +
          </a>
    <FounderMobileBottomNav active="dashboard" />
  </>
);
}
