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
            <a href="/" className="mb-12 flex items-center gap-3">              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
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
                Mes leads
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

        <section className="flex-1 overflow-y-auto px-5 py-8 md:px-10 lg:px-12">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
                Bon retour sur UNION 👋
              </h1>
              <p className="mt-2 text-lg text-slate-500">
                Voici un résumé de ton activité de parrainage.
              </p>
            </div>

            <a
              href="/lead"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-center font-bold text-white shadow-md shadow-indigo-200"
            >
              + Nouveau lead
            </a>
          </div>

          <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-slate-500">
              Mon code de parrainage
            </p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-indigo-600">
              {referralCode}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Partage ce code pour relier les leads à ton compte.
            </p>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <p className="text-3xl font-extrabold text-slate-950">
                {leads.length}
              </p>
              <p className="mt-2 font-medium text-slate-500">Total leads</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <p className="text-3xl font-extrabold text-slate-950">
                {pendingLeads}
              </p>
              <p className="mt-2 font-medium text-slate-500">En attente</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <p className="text-3xl font-extrabold text-slate-950">
                {approvedLeads}
              </p>
              <p className="mt-2 font-medium text-slate-500">Approuvés</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <p className="text-3xl font-extrabold text-slate-950">
                {rejectedLeads}
              </p>
              <p className="mt-2 font-medium text-slate-500">Refusés</p>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-2">
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Campagnes actives
                </h2>
                <a href="/client" className="font-bold text-indigo-600">
                  Voir tout →
                </a>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <a
                    key={campaign.id}
                    href={`/lead?campaign=${campaign.id}`}
                    className="block rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-950">
                          {campaign.title}
                        </h3>
                        <p className="mt-1 line-clamp-2 text-slate-500">
                          {campaign.description}
                        </p>
                        <p className="mt-3 font-extrabold text-indigo-600">
                          1 lead approuvé = {campaign.reward_amount} €
                        </p>
                      </div>

                      <span className="text-3xl text-slate-300">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-950">
                  Mes parrainages récents
                </h2>
                <a href="/client" className="font-bold text-indigo-600">
                  Voir tout →
                </a>
              </div>

              <div className="space-y-4">
                {leads.length === 0 ? (
                  <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm ring-1 ring-slate-100">
                    Aucun lead pour le moment.
                  </div>
                ) : (
                  leads.slice(0, 5).map((lead) => (
                    <div
                      key={lead.id}
                      className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-extrabold text-slate-950">
                            {lead.full_name}
                          </h3>
                          <p className="text-sm font-medium text-slate-400">
                            {lead.email}
                          </p>
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
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}