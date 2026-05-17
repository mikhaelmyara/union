"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: string;
  campaigns: {
    title: string;
    reward_amount: number;
  } | null;
};

export default function PartnerPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [referralCode, setReferralCode] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadPartner();
  }, []);

  async function loadPartner() {
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
      .select("role, referral_code")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "partner" && profile?.role !== "founder") {
      window.location.href = "/client";
      return;
    }

    setReferralCode(profile?.referral_code ?? "");

    const { data } = await supabase
      .from("leads")
      .select("id, full_name, email, phone, status, campaigns(title, reward_amount)")
      .eq("partner_id", user.id)
      .order("created_at", { ascending: false });

    setLeads(data as unknown as Lead[]);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const pendingLeads = leads.filter((lead) => lead.status === "pending").length;
  const approvedLeads = leads.filter((lead) => lead.status === "approved").length;
  const rejectedLeads = leads.filter((lead) => lead.status === "rejected").length;

  const totalRewards = leads
    .filter((lead) => lead.status === "approved")
    .reduce((sum, lead) => sum + (lead.campaigns?.reward_amount ?? 0), 0);

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
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">
                U
              </div>
              <div>
                <p className="text-lg font-bold leading-5 text-slate-900">
                  UNION
                </p>
                <p className="text-sm text-slate-400">Portail partenaire</p>
              </div>
            </div>

            <nav className="space-y-3">
              <a
                href="/partner"
                className="block rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-sm"
              >
                Tableau de bord
              </a>

              <a
                href="/partner"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Mes leads
              </a>

              <a
                href="/lead"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Nouveau lead
              </a>

              <a
                href="/dashboard"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Mon espace
              </a>
            </nav>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                P
              </div>

              <div className="min-w-0">
                <p className="font-bold text-slate-900">Partenaire UNION</p>
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
                Espace partenaire 👋
              </h1>
              <p className="mt-2 text-lg text-slate-500">
                Suis tes leads, tes validations et tes récompenses.
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
              Mon code partenaire
            </p>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-indigo-600">
              {referralCode}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Partage ce code pour relier automatiquement les leads à ton compte.
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

            <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-md shadow-indigo-200">
              <p className="text-3xl font-extrabold">{totalRewards} €</p>
              <p className="mt-2 font-medium text-indigo-100">Récompenses</p>
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-950">
                Mes leads récents
              </h2>
              <a href="/partner" className="font-bold text-indigo-600">
                Voir tout →
              </a>
            </div>

            <div className="space-y-4">
              {leads.length === 0 ? (
                <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm ring-1 ring-slate-100">
                  Aucun lead pour le moment.
                </div>
              ) : (
                leads.map((lead) => (
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
                          Campagne : {lead.campaigns?.title}
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
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}