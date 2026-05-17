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
  const [email, setEmail] = useState("");

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

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const pendingLeads = leads.filter((lead) => lead.status === "pending").length;
  const approvedLeads = leads.filter((lead) => lead.status === "approved").length;
  const rejectedLeads = leads.filter((lead) => lead.status === "rejected").length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex min-h-screen max-w-7xl rounded border bg-white">
        <aside className="hidden w-72 flex-col justify-between border-r bg-white p-6 md:flex">
          <div>
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                U
              </div>
              <div>
                <p className="font-bold">UNION</p>
                <p className="text-sm text-gray-500">Portail client</p>
              </div>
            </div>

            <nav className="space-y-2">
              <a className="block rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white" href="/client">
                Tableau de bord
              </a>
              <a className="block rounded-xl px-4 py-3 font-medium text-gray-600" href="/client">
                Campagnes
              </a>
              <a className="block rounded-xl px-4 py-3 font-medium text-gray-600" href="/lead">
                Nouveau lead
              </a>
              <a className="block rounded-xl px-4 py-3 font-medium text-gray-600" href="/dashboard">
                Mon espace
              </a>
            </nav>
          </div>

          <div className="border-t pt-6">
            <p className="font-bold">Client UNION</p>
            <p className="mb-6 text-sm text-gray-500">{email}</p>

            <button
              onClick={handleLogout}
              className="text-sm font-bold text-gray-500"
            >
              Déconnexion
            </button>
          </div>
        </aside>

        <section className="flex-1 p-4 md:p-10">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">
                Bon retour sur UNION 👋
              </h1>
              <p className="mt-2 text-gray-500">
                Voici un résumé de ton activité de parrainage.
              </p>
            </div>

            <a
              href="/lead"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-center font-bold text-white shadow-sm"
            >
              + Nouveau lead
            </a>
          </div>

          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Mon code de parrainage</p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {referralCode}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Partage ce code pour relier les leads à ton compte.
            </p>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-5 md:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold">{leads.length}</p>
              <p className="mt-2 text-gray-500">Total leads</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold">{pendingLeads}</p>
              <p className="mt-2 text-gray-500">En attente</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold">{approvedLeads}</p>
              <p className="mt-2 text-gray-500">Approuvés</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-3xl font-bold">{rejectedLeads}</p>
              <p className="mt-2 text-gray-500">Refusés</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Campagnes actives</h2>
                <a href="/client" className="font-bold text-indigo-600">
                  Voir tout →
                </a>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <a
                    key={campaign.id}
                    href={`/lead?campaign=${campaign.id}`}
                    className="block rounded-2xl bg-white p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{campaign.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {campaign.description}
                        </p>
                        <p className="mt-3 font-bold text-indigo-600">
                          1 lead approuvé = {campaign.reward_amount} €
                        </p>
                      </div>

                      <span className="text-2xl text-gray-300">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Mes parrainages récents</h2>
                <a href="/client" className="font-bold text-indigo-600">
                  Voir tout →
                </a>
              </div>

              <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="rounded-2xl bg-white p-6 text-gray-500 shadow-sm">
                    Aucun lead pour le moment.
                  </div>
                ) : (
                  leads.slice(0, 5).map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-2xl bg-white p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-bold">{lead.full_name}</h3>
                          <p className="text-sm text-gray-500">{lead.email}</p>
                        </div>

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
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}