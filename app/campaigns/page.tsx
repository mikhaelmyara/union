"use client";

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

  useEffect(() => {
    async function loadCampaigns() {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .eq("is_active", true);

      setCampaigns(data ?? []);
    }

    loadCampaigns();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F8FC] p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="font-bold text-indigo-600">
              Campagnes
            </p>

            <h1 className="mt-2 text-4xl font-extrabold">
              Campagnes disponibles
            </h1>
          </div>

          <a
            href="/client"
            className="rounded-xl bg-black px-5 py-3 font-bold text-white"
          >
            Retour
          </a>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <h2 className="text-2xl font-extrabold">
                {campaign.title}
              </h2>

              <p className="mt-2 text-slate-500">
                {campaign.description}
              </p>

              <p className="mt-5 font-bold text-indigo-600">
                1 lead approuvé = {campaign.reward_amount} €
              </p>

              <a
                href={`/lead?campaign=${campaign.id}`}
                className="mt-5 inline-block rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
              >
                Créer un lead
              </a>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}