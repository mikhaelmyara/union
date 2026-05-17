"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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
  status: string;
  campaigns: {
    title: string;
    reward_amount: number;
  } | null;
};

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  is_active: boolean;
};

export default function FounderPage() {
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [email, setEmail] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardAmount, setRewardAmount] = useState(0);

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
      .select(
        "id, full_name, email, phone, status, campaigns(title, reward_amount)"
      )
      .order("created_at", { ascending: false });

    const { data: campaignsData } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    setLeads(leadsData as unknown as Lead[]);
    setCampaigns(campaignsData ?? []);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  async function createCampaign() {
    const { error } = await supabase.from("campaigns").insert({
      title,
      description,
      reward_amount: rewardAmount,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Campagne créée ✅");
      setTitle("");
      setDescription("");
      setRewardAmount(0);
      loadDashboard();
    }
  }

  async function toggleCampaign(campaignId: string, isActive: boolean) {
    const { error } = await supabase
      .from("campaigns")
      .update({ is_active: !isActive })
      .eq("id", campaignId);

    if (error) {
      alert(error.message);
    } else {
      loadDashboard();
    }
  }

  async function updateStatus(
    leadId: string,
    status: "approved" | "rejected" | "pending"
  ) {
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", leadId);

    if (error) {
      alert(error.message);
    } else {
      loadDashboard();
    }
  }

  const pendingLeads = leads.filter((lead) => lead.status === "pending").length;
  const approvedLeads = leads.filter((lead) => lead.status === "approved").length;
  const rejectedLeads = leads.filter((lead) => lead.status === "rejected").length;

  const totalRewards = leads
    .filter((lead) => lead.status === "approved")
    .reduce((sum, lead) => sum + (lead.campaigns?.reward_amount ?? 0), 0);

  const chartData = [
    { name: "En attente", value: pendingLeads },
    { name: "Approuvés", value: approvedLeads },
    { name: "Refusés", value: rejectedLeads },
  ];

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
                <p className="text-sm text-slate-400">Portail fondateur</p>
              </div>
            </div>

            <nav className="space-y-3">
              <a
                href="/founder"
                className="block rounded-xl bg-indigo-600 px-4 py-3 font-bold text-white shadow-sm"
              >
                Tableau de bord
              </a>

              <a
                href="/founder"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Campagnes
              </a>

              <a
                href="/founder"
                className="block rounded-xl px-4 py-3 font-semibold text-slate-500 hover:bg-slate-50"
              >
                Leads
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
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 md:text-4xl">
              Dashboard fondateur 🚀
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Gère les campagnes, les leads et les récompenses depuis un seul espace.
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

          <div className="mb-10 grid gap-8 xl:grid-cols-2">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <h2 className="mb-6 text-2xl font-extrabold text-slate-950">
                Analytics des leads
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
                  placeholder="Récompense (€)"
                  type="number"
                  value={rewardAmount}
                  onChange={(e) => setRewardAmount(Number(e.target.value))}
                />

                <button
                  onClick={createCampaign}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md shadow-indigo-200"
                >
                  Créer campagne
                </button>
              </div>
            </div>
          </div>

          <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
            Campagnes
          </h2>

          <div className="mb-10 grid grid-cols-1 gap-4 xl:grid-cols-2">
            {campaigns.map((campaign) => (
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
                      1 lead approuvé = {campaign.reward_amount} €
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

                  <button
                    onClick={() =>
                      toggleCampaign(campaign.id, campaign.is_active)
                    }
                    className="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white"
                  >
                    {campaign.is_active ? "Désactiver" : "Activer"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h2 className="mb-4 text-2xl font-extrabold text-slate-950">
            Leads
          </h2>

          <div className="space-y-4">
            {leads.map((lead) => (
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

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(lead.id, "approved")}
                        className="rounded-xl bg-green-600 px-4 py-2 font-bold text-white"
                      >
                        Approve
                      </button>

                      <button
                        onClick={() => updateStatus(lead.id, "rejected")}
                        className="rounded-xl bg-red-600 px-4 py-2 font-bold text-white"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => updateStatus(lead.id, "pending")}
                        className="rounded-xl bg-yellow-500 px-4 py-2 font-bold text-white"
                      >
                        Pending
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}