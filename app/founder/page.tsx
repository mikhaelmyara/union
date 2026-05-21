"use client";
import { exportLeadsToExcel } from "@/lib/exportLeads";
import MobileHeader from "@/components/mobile/MobileHeader";
import FounderMobileBottomNav from "@/components/mobile/FounderMobileBottomNav";
import ConfirmModal from "@/components/ui/ConfirmModal";
import NotificationBell from "@/components/ui/NotificationBell";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import AnalyticsSection from "@/components/founder/AnalyticsSection";
import CampaignsSection from "@/components/founder/CampaignsSection";
import ChallengesSection from "@/components/founder/ChallengesSection";
import CreateCampaignForm from "@/components/founder/CreateCampaignForm";
import EngagementsSection from "@/components/founder/EngagementsSection";
import FounderStats from "@/components/founder/FounderStats";
import type { Campaign, Challenge, EngagementStatus, Lead, Reward } from "@/components/founder/types";

export default function FounderPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [email, setEmail] = useState("");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardAmount, setRewardAmount] = useState<number | "">(0);
  const [referralRewardAmount, setReferralRewardAmount] = useState<number | "">(0);
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignSearch, setCampaignSearch] = useState("");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState("all");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDescription, setChallengeDescription] = useState("");
  const [challengeReward, setChallengeReward] = useState(0);
  const [challengePeriod, setChallengePeriod] = useState<"weekly" | "monthly">("weekly");
  const [challengeStartDate, setChallengeStartDate] = useState("");
  const [challengeEndDate, setChallengeEndDate] = useState("");
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  const [challengeToDelete, setChallengeToDelete] = useState<string | null>(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [statusAction, setStatusAction] = useState<{ leadId: string; status: EngagementStatus } | null>(null);

  // Garde une ref de l'userId pour ne pas re-vérifier le rôle à chaque realtime
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    initPage();
  }, []);

  async function initPage() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "founder") { window.location.href = "/client"; return; }

    userIdRef.current = user.id;
    setEmail(user.email ?? "");

    await fetchAll();

    // Realtime — appelle fetchAll() seulement, pas initPage()
    const channel = supabase
      .channel(`founder-live-${Math.random()}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "leads" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "rewards" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "campaigns" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "challenges" }, fetchAll)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }

  // Toutes les requêtes en parallèle, sans re-vérifier l'auth
  async function fetchAll() {
    const [leadsRes, campaignsRes, rewardsRes, challengesRes] = await Promise.all([
      supabase.from("leads").select(`id, full_name, email, phone, status, created_at, client_id, campaign_title_snapshot, campaigns(title, reward_amount, referral_reward_amount)`).order("created_at", { ascending: false }),
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("rewards").select("*").order("created_at", { ascending: false }),
      supabase.from("challenges").select("*").order("created_at", { ascending: false }),
    ]);

    setLeads((leadsRes.data as unknown as Lead[]) ?? []);
    setCampaigns((campaignsRes.data as Campaign[]) ?? []);
    setRewards((rewardsRes.data as Reward[]) ?? []);
    setChallenges((challengesRes.data as Challenge[]) ?? []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function createChallenge() {
    if (!challengeTitle.trim()) { toast.error("Le titre du challenge est obligatoire."); return; }
    if (challengeReward <= 0) { toast.error("La récompense doit être supérieure à 0."); return; }
    if (!challengeStartDate || !challengeEndDate) { toast.error("Les dates sont obligatoires."); return; }

    const { error } = await supabase.from("challenges").insert({
      title: challengeTitle.trim(),
      description: challengeDescription.trim(),
      reward_amount: challengeReward,
      period_type: challengePeriod,
      start_date: challengeStartDate,
      end_date: challengeEndDate,
    });

    if (error) { toast.error(error.message); return; }
    toast.success("Challenge créé.");
    setChallengeTitle(""); setChallengeDescription(""); setChallengeReward(0);
    setChallengePeriod("weekly"); setChallengeStartDate(""); setChallengeEndDate("");
    fetchAll();
  }

  async function toggleChallenge(id: string, isActive: boolean) {
    const { error } = await supabase.from("challenges").update({ is_active: !isActive }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(isActive ? "Challenge désactivé." : "Challenge activé.");
    setChallenges((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !isActive } : c));
  }

  async function deleteChallenge() {
    if (!challengeToDelete) return;
    const { error } = await supabase.from("challenges").delete().eq("id", challengeToDelete);
    if (error) { toast.error(error.message); return; }
    toast.success("Challenge supprimé.");
    setChallengeToDelete(null);
    setChallenges((prev) => prev.filter((c) => c.id !== challengeToDelete));
  }

  async function createCampaign() {
    if (creatingCampaign) return;
    if (!title.trim()) { toast.error("Le titre est obligatoire."); return; }
    if (description.trim().length < 10) { toast.error("La description doit contenir au moins 10 caractères."); return; }
    if (!rewardAmount || Number(rewardAmount) <= 0) { toast.error("La récompense doit être supérieure à 0."); return; }
    if (Number(referralRewardAmount) < 0) { toast.error("La récompense parrain ne peut pas être négative."); return; }

    setCreatingCampaign(true);
    const { error } = await supabase.from("campaigns").insert({
      title: title.trim(),
      description: description.trim(),
      reward_amount: Number(rewardAmount),
      referral_reward_amount: Number(referralRewardAmount) || 0,
    });
    setCreatingCampaign(false);

    if (error) { toast.error(error.message); return; }
    toast.success("Campagne créée.");
    setTitle(""); setDescription(""); setRewardAmount(0); setReferralRewardAmount(0);
    fetchAll();
  }

  async function toggleCampaign(id: string, isActive: boolean) {
    const { error } = await supabase.from("campaigns").update({ is_active: !isActive }).eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success(isActive ? "Campagne désactivée." : "Campagne activée.");
    setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, is_active: !isActive } : c));
  }

  async function deleteCampaign() {
    if (!campaignToDelete) return;
    const { error } = await supabase.from("campaigns").delete().eq("id", campaignToDelete);
    if (error) { toast.error(error.message); return; }
    toast.success("Campagne supprimée.");
    setCampaignToDelete(null);
    setCampaigns((prev) => prev.filter((c) => c.id !== campaignToDelete));
  }

  async function updateStatus() {
    if (!statusAction) return;
    const { error } = await supabase.from("leads").update({ status: statusAction.status }).eq("id", statusAction.leadId);
    if (error) { toast.error(error.message); return; }
    toast.success("Statut mis à jour.");
    setLeads((prev) => prev.map((l) => l.id === statusAction.leadId ? { ...l, status: statusAction.status } : l));
    setStatusAction(null);
  }

  const pendingLeads = leads.filter((l) => l.status === "pending").length;
  const approvedLeads = leads.filter((l) => l.status === "approved").length;
  const rejectedLeads = leads.filter((l) => l.status === "rejected").length;
  const directRewards = rewards.filter((r) => r.type === "direct").reduce((s, r) => s + r.amount, 0);
  const referralRewards = rewards.filter((r) => r.type === "referral").reduce((s, r) => s + r.amount, 0);
  const totalRewards = directRewards + referralRewards;

  if (loading) return <PageSkeleton />;

  return (
    <>
      <MobileHeader title="Fondateur" subtitle="UNION" />

      <main className="min-h-screen bg-[#F7F8FC] p-0 pb-28 lg:p-3 lg:pb-3">
        <div className="mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-[#F7F8FC] lg:min-h-[calc(100vh-24px)] lg:rounded-2xl lg:border lg:border-slate-200">

          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 bg-white p-6 lg:flex">
            <div>
              <a href="/" className="mb-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">U</div>
                <div>
                  <p className="text-lg font-bold leading-5 text-slate-900">UNION</p>
                  <p className="text-sm text-slate-400">Portail fondateur</p>
                </div>
              </a>
              <nav className="space-y-1">
                {[
                  { href: "/founder",             label: "Tableau de bord", active: true },
                  { href: "/founder/campaigns",   label: "Campagnes",       active: false },
                  { href: "/founder/engagements", label: "Engagements",     active: false },
                  { href: "/partner",             label: "Vue partenaire",  active: false },
                ].map((item) => (
                  <a key={item.href} href={item.href}
                    className={`block rounded-xl px-4 py-3 font-semibold transition ${item.active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className="border-t border-slate-200 pt-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">F</div>
                  <p className="truncate text-sm text-slate-500">{email}</p>
                </div>
                <NotificationBell />
              </div>
              <button onClick={() => setLogoutOpen(true)} className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
                Déconnexion
              </button>
            </div>
          </aside>

          {/* Content */}
          <section className="flex-1 overflow-y-auto px-5 py-8 md:px-10 lg:px-12">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">Dashboard fondateur 🚀</h1>
                <p className="mt-2 text-lg text-slate-500">Gère les campagnes, les engagements et les récompenses.</p>
              </div>
              <button onClick={() => exportLeadsToExcel().catch(e => toast.error(e.message))}>
                Télécharger Excel
              </button>
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
              <AnalyticsSection pending={pendingLeads} approved={approvedLeads} rejected={rejectedLeads} />
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
              updateStatus={(leadId, status) => setStatusAction({ leadId, status })}
            />
          </section>
        </div>
      </main>

      <a href="#create-campaign" className="fixed bottom-24 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white shadow-2xl shadow-indigo-300 transition hover:scale-105 lg:hidden">+</a>

      <FounderMobileBottomNav active="dashboard" />

      <ConfirmModal open={campaignToDelete !== null} title="Supprimer la campagne" description="Cette action est définitive." confirmLabel="Supprimer" cancelLabel="Annuler" variant="danger" onConfirm={deleteCampaign} onCancel={() => setCampaignToDelete(null)} />
      <ConfirmModal open={challengeToDelete !== null} title="Supprimer le challenge" description="Cette action est définitive." confirmLabel="Supprimer" cancelLabel="Annuler" variant="danger" onConfirm={deleteChallenge} onCancel={() => setChallengeToDelete(null)} />
      <ConfirmModal open={logoutOpen} title="Se déconnecter" description="Voulez-vous vraiment quitter votre session ?" confirmLabel="Déconnexion" cancelLabel="Annuler" variant="danger" onConfirm={handleLogout} onCancel={() => setLogoutOpen(false)} />
      <ConfirmModal open={statusAction !== null} title="Modifier le statut" description="Confirmer la modification du statut de cet engagement ?" confirmLabel="Confirmer" cancelLabel="Annuler" onConfirm={updateStatus} onCancel={() => setStatusAction(null)} />
    </>
  );
}