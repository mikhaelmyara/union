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
    await supabase
      .from("campaigns")
      .update({ is_active: !isActive })
      .eq("id", campaignId);

    loadDashboard();
  }

  async function updateStatus(
    leadId: string,
    status: "approved" | "rejected" | "pending"
  ) {
    await supabase.from("leads").update({ status }).eq("id", leadId);
    loadDashboard();
  }

  const approvedLeads = leads.filter(
  (lead) => lead.status === "approved"
).length;

const pendingLeads = leads.filter(
  (lead) => lead.status === "pending"
).length;

const rejectedLeads = leads.filter(
  (lead) => lead.status === "rejected"
).length;

const chartData = [
  {
    name: "Pending",
    value: pendingLeads,
  },
  {
    name: "Approved",
    value: approvedLeads,
  },
  {
    name: "Rejected",
    value: rejectedLeads,
  },
];

  const totalRewards = leads
    .filter((lead) => lead.status === "approved")
    .reduce((sum, lead) => sum + (lead.campaigns?.reward_amount ?? 0), 0);

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
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">Dashboard</p>
          <h1 className="text-3xl font-bold">Espace fondateur</h1>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total leads</p>
            <p className="text-3xl font-bold">{leads.length}</p>
          </div>

          <div className="rounded bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-3xl font-bold">{pendingLeads}</p>
          </div>

          <div className="rounded bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-3xl font-bold">{approvedLeads}</p>
          </div>

          <div className="rounded bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Récompenses</p>
            <p className="text-3xl font-bold">{totalRewards} €</p>
          </div>
        </div>

        <div className="mb-8 rounded bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold">Analytics des leads</h2>

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

        <div className="mb-8 rounded bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-2xl font-bold">Créer une campagne</h2>

          <div className="grid gap-4">
            <input
              className="rounded border p-3"
              placeholder="Titre"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="rounded border p-3"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              className="rounded border p-3"
              placeholder="Récompense (€)"
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Number(e.target.value))}
            />

            <button
              onClick={createCampaign}
              className="rounded bg-black px-6 py-3 text-white"
            >
              Créer campagne
            </button>
          </div>
        </div>

        <h2 className="mb-4 text-2xl font-bold">Campagnes</h2>

        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded bg-white p-6 shadow-sm">
              <h3 className="text-xl font-bold">{campaign.title}</h3>
              <p className="mt-2 text-gray-600">{campaign.description}</p>

              <p className="mt-4 font-bold">
                Récompense : {campaign.reward_amount} €
              </p>

              <p className="font-bold">
                Statut : {campaign.is_active ? "Active" : "Inactive"}
              </p>

              <button
                onClick={() =>
                  toggleCampaign(campaign.id, campaign.is_active)
                }
                className="mt-4 rounded bg-black px-4 py-2 text-white"
              >
                {campaign.is_active ? "Désactiver" : "Activer"}
              </button>
            </div>
          ))}
        </div>

        <h2 className="mb-4 text-2xl font-bold">Leads</h2>

        <div className="grid gap-4">
          {leads.map((lead) => (
            <div key={lead.id} className="rounded bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-xl font-bold">{lead.full_name}</h3>
                  <p className="text-gray-600">Email : {lead.email}</p>
                  <p className="text-gray-600">Téléphone : {lead.phone}</p>
                  <p className="text-gray-600">
                    Campagne : {lead.campaigns?.title}
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      lead.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : lead.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {lead.status}
                  </span>

                  <p className="mt-3 font-bold">
                    Récompense : {lead.campaigns?.reward_amount ?? 0} €
                  </p>

                    <div className="mt-4 flex flex-wrap gap-2 md:justify-end">
                    <button
                        onClick={() => updateStatus(lead.id, "approved")}
                        className="rounded bg-green-600 px-4 py-2 text-white"
                    >
                        Approve
                    </button>

                    <button
                        onClick={() => updateStatus(lead.id, "rejected")}
                        className="rounded bg-red-600 px-4 py-2 text-white"
                    >
                        Reject
                    </button>

                    <button
                        onClick={() => updateStatus(lead.id, "pending")}
                        className="rounded bg-yellow-500 px-4 py-2 text-white"
                    >
                        Pending
                    </button>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}