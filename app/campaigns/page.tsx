"use client";

import ClientPageLayout from "@/components/layout/ClientPageLayout";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  referral_reward_amount: number;
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, description, reward_amount, referral_reward_amount")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) { toast.error(error.message); return; }
      setCampaigns(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <ClientPageLayout
      active="campaigns"
      eyebrow="Campagnes"
      title="Campagnes disponibles"
      description="Sélectionne une campagne et ajoute un engagement."
    >
      {loading ? (
        <ListSkeleton rows={4} />
      ) : campaigns.length === 0 ? (
        <EmptyState message="Aucune campagne active pour le moment." />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-xl font-extrabold text-slate-950">{c.title}</h2>
              <p className="mt-2 text-slate-500">{c.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-sm font-bold text-indigo-600">
                  {c.reward_amount} € par engagement
                </span>
                {c.referral_reward_amount > 0 && (
                  <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-bold text-emerald-600">
                    {c.referral_reward_amount} € commission parrain
                  </span>
                )}
                <span className="rounded-xl bg-green-100 px-3 py-1.5 text-sm font-bold text-green-700">Active</span>
              </div>

              <a
                href={`/lead?campaign=${c.id}`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
              >
                Ajouter un engagement →
              </a>
            </div>
          ))}
        </div>
      )}
    </ClientPageLayout>
  );
}
