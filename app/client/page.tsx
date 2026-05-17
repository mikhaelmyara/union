"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
};

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
};

export default function ClientPage() {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    async function loadPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_code")
        .eq("id", user.id)
        .single();

      setReferralCode(profile?.referral_code ?? "");

      const { data: campaignsData } = await supabase
        .from("campaigns")
        .select("id, title, description, reward_amount")
        .eq("is_active", true);

      const { data: leadsData } = await supabase
        .from("leads")
        .select("id, full_name, email, phone, status")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      setCampaigns(campaignsData ?? []);
      setLeads(leadsData ?? []);
      setLoading(false);
    }

    loadPage();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">Dashboard</p>
            <h1 className="text-3xl font-bold">Espace client</h1>
          </div>

          <button
            onClick={handleLogout}
            className="rounded bg-black px-5 py-3 text-white"
          >
            Se déconnecter
          </button>
        </div>

        <div className="mb-8 rounded bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Mon code de parrainage</p>
          <p className="mt-2 text-3xl font-bold">{referralCode}</p>
          <p className="mt-2 text-sm text-gray-500">
            Donne ce code à une personne pour qu’elle l’ajoute dans le formulaire lead.
          </p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Campagnes actives</p>
            <p className="text-3xl font-bold">{campaigns.length}</p>
          </div>

          <div className="rounded bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Mes leads</p>
            <p className="text-3xl font-bold">{leads.length}</p>
          </div>

          <div className="rounded bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Leads approuvés</p>
            <p className="text-3xl font-bold">
              {leads.filter((lead) => lead.status === "approved").length}
            </p>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-bold">Campagnes disponibles</h2>

        <div className="mb-10 grid gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">{campaign.title}</h3>
              <p className="mt-2 text-gray-600">{campaign.description}</p>

              <p className="mt-4 font-bold">
                Récompense : {campaign.reward_amount} €
              </p>

              <a
                href={`/lead?campaign=${campaign.id}`}
                className="mt-4 inline-block rounded bg-black px-4 py-2 text-white"
              >
                Ajouter un lead
              </a>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-bold">Mes leads</h2>

        <div className="grid gap-4">
          {leads.length === 0 ? (
            <div className="rounded bg-white p-6 shadow-sm">
              Aucun lead pour le moment.
            </div>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="rounded bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold">{lead.full_name}</h3>
                <p className="text-gray-600">Email : {lead.email}</p>
                <p className="text-gray-600">Téléphone : {lead.phone}</p>
                <p className="mt-2 font-bold">Statut : {lead.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}