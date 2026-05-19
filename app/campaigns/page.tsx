"use client";

import PageActions from "@/components/PageActions";
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
        .select("*")
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
    <main className="min-h-screen bg-[#F7F8FC] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-indigo-600">
              Campagnes
            </p>

            <h1 className="mt-2 text-4xl font-extrabold">
              Campagnes disponibles
            </h1>

            <p className="mt-2 text-slate-500">
              Sélectionne une campagne et ajoute un nouvel engagement.
            </p>
          </div>

          <PageActions backHref="/client" />
        </div>

        {campaigns.length === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-slate-500 shadow-sm">
            Aucune campagne active pour le moment.
          </div>
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

                <p className="mt-2 text-slate-500">
                  {campaign.description}
                </p>

                <div className="mt-5 flex items-center justify-between">
                  <p className="font-bold text-indigo-600">
                    Engagement approuvé = {campaign.reward_amount} €
                  </p>

                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
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
      </div>
    </main>
  );
}