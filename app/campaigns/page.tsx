"use client";
import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import DashboardNav from "@/components/layout/DashboardNav";
import PageShell from "@/components/layout/PageShell";
import EmptyState from "@/components/ui/EmptyState";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCampaigns() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, description, reward_amount")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        alert(error.message);
        return;
      }

      setCampaigns(data ?? []);
      setLoading(false);
    }

    loadCampaigns();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC]">
        Chargement...
      </main>
    );
  }

  return (
  <>
    <MobileHeader
      title="Campagnes"
      subtitle="UNION"
    />

    <PageShell
      eyebrow="Campagnes"
      title="Campagnes disponibles"
      description="Sélectionne une campagne et ajoute un nouvel engagement."
      backHref="/client"
    >
      <DashboardNav active="campaigns" />

      {campaigns.length === 0 ? (
        <EmptyState message="Aucune campagne active pour le moment." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <h2 className="text-2xl font-extrabold text-slate-950">
                {campaign.title}
              </h2>

              <p className="mt-2 text-slate-500">{campaign.description}</p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-bold text-indigo-600">
                  Engagement approuvé = {campaign.reward_amount} €
                </p>

                <span className="w-fit rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  Active
                </span>
              </div>

              <a
                href={`/lead?campaign=${campaign.id}`}
                className="mt-6 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:opacity-90"
              >
                Ajouter un engagement
              </a>
            </div>
          ))}
        </div>
      )}
        </PageShell>

    <MobileBottomNav active="campaigns" />
  </>
);
}
