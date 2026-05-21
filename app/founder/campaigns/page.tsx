"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import FounderPageLayout from "@/components/layout/FounderPageLayout";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import ConfirmModal from "@/components/ui/ConfirmModal";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  referral_reward_amount: number;
  is_active: boolean;
  created_at: string;
};

const inputClass = "rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 w-full";

export default function FounderCampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardAmount, setRewardAmount] = useState<number | "">("");
  const [referralRewardAmount, setReferralRewardAmount] = useState<number | "">("");
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "founder") { window.location.href = "/client"; return; }

    const { data, error } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) { toast.error(error.message); return; }
    setCampaigns((data as Campaign[]) ?? []);
    setLoading(false);
  }

  async function createCampaign() {
    if (creating) return;
    if (!title.trim()) { toast.error("Le titre est obligatoire."); return; }
    if ((description ?? "").trim().length < 10) { toast.error("La description doit contenir au moins 10 caractères."); return; }
    if (!rewardAmount || Number(rewardAmount) <= 0) { toast.error("La récompense doit être supérieure à 0."); return; }

    setCreating(true);
    const { error } = await supabase.from("campaigns").insert({
      title: title.trim(),
      description: description.trim(),
      reward_amount: Number(rewardAmount),
      referral_reward_amount: Number(referralRewardAmount) || 0,
    });
    setCreating(false);

    if (error) { toast.error(error.message); return; }

    toast.success("Campagne créée !");
    setTitle(""); setDescription(""); setRewardAmount(""); setReferralRewardAmount("");
    setShowForm(false);
    load();
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

  const filtered = campaigns.filter((c) => {
    const matchSearch = `${c.title} ${c.description ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || (statusFilter === "active" && c.is_active) || (statusFilter === "inactive" && !c.is_active);
    return matchSearch && matchStatus;
  });

  return (
    <FounderPageLayout
      active="campaigns"
      title="Gestion des campagnes"
      description="Crée, active, désactive et supprime tes campagnes."
      actions={
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
        >
          {showForm ? "Annuler" : "+ Nouvelle campagne"}
        </button>
      }
    >
      {/* Formulaire création */}
      {showForm && (
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-indigo-100">
          <h2 className="mb-6 text-xl font-extrabold text-slate-950">Nouvelle campagne</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Titre</label>
              <input className={inputClass} placeholder="Ex : Recrutement CDI Paris" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="grid gap-1 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">Description</label>
              <textarea
                className={`${inputClass} min-h-24 resize-none`}
                placeholder="Décris l'objectif, le profil recherché..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-bold text-slate-700">
                Récompense par engagement validé <span className="font-normal text-slate-400">(€)</span>
              </label>
              <div className="relative">
                <input
                  className={inputClass}
                  placeholder="Ex : 50"
                  type="number"
                  min="0"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
              </div>
              <p className="text-xs text-slate-400">Gagné par le client pour chaque engagement approuvé.</p>
            </div>

            <div className="grid gap-1">
              <label className="text-sm font-bold text-slate-700">
                Commission parrain <span className="font-normal text-slate-400">(€ — optionnel)</span>
              </label>
              <div className="relative">
                <input
                  className={inputClass}
                  placeholder="Ex : 10"
                  type="number"
                  min="0"
                  value={referralRewardAmount}
                  onChange={(e) => setReferralRewardAmount(e.target.value === "" ? "" : Number(e.target.value))}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">€</span>
              </div>
              <p className="text-xs text-slate-400">Versé au parrain quand un filleul fait un engagement approuvé.</p>
            </div>
          </div>

          <button
            onClick={createCampaign}
            disabled={creating}
            className="mt-6 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {creating ? "Création..." : "Créer la campagne"}
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <input
          className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="Rechercher une campagne..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: `Toutes (${campaigns.length})`, value: "all" },
            { label: `Actives (${campaigns.filter((c) => c.is_active).length})`, value: "active" },
            { label: `Inactives (${campaigns.filter((c) => !c.is_active).length})`, value: "inactive" },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${statusFilter === f.value ? "bg-indigo-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <ListSkeleton rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState message="Aucune campagne trouvée." />
      ) : (
        <div className="grid gap-5 xl:grid-cols-2">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-950">{c.title}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${c.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                      {c.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500 line-clamp-2">{c.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-xl bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-600">
                      {c.reward_amount} € / engagement
                    </span>
                    {c.referral_reward_amount > 0 && (
                      <span className="rounded-xl bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-600">
                        {c.referral_reward_amount} € parrain
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">
                    Créée le {new Date(c.created_at).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  onClick={() => toggleCampaign(c.id, c.is_active)}
                  className={`rounded-xl px-4 py-2 text-sm font-bold transition ${c.is_active ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
                >
                  {c.is_active ? "Désactiver" : "Activer"}
                </button>
                <button
                  onClick={() => setCampaignToDelete(c.id)}
                  className="rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-100"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={campaignToDelete !== null}
        title="Supprimer la campagne"
        description="Cette action est définitive. Tous les engagements liés resteront mais afficheront 'Campagne supprimée'."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        variant="danger"
        onConfirm={deleteCampaign}
        onCancel={() => setCampaignToDelete(null)}
      />
    </FounderPageLayout>
  );
}
