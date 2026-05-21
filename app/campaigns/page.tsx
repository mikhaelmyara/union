"use client";

import ClientPageLayout from "@/components/layout/ClientPageLayout";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  reward_amount: number;
  referral_reward_amount: number;
};

export default function CampaignsPage() {
  const t = useTranslations("campaigns");
  const tc = useTranslations("common");
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
    <ClientPageLayout active="campaigns" eyebrow={t("title")} title={t("title")} description={t("subtitle")}>
      {loading ? (
        <ListSkeleton rows={4} />
      ) : campaigns.length === 0 ? (
        <EmptyState message={t("noCampaigns")} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {campaigns.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 transition hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">{c.title}</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{c.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-xl bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {c.reward_amount} {t("perEngagement")}
                </span>
                {c.referral_reward_amount > 0 && (
                  <span className="rounded-xl bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {c.referral_reward_amount} {t("referralCommission")}
                  </span>
                )}
                <span className="rounded-xl bg-green-100 dark:bg-green-900/40 px-3 py-1.5 text-sm font-bold text-green-700 dark:text-green-400">
                  {tc("active")}
                </span>
              </div>
              <a href={`/lead?campaign=${c.id}`}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white transition hover:bg-indigo-700"
              >
                {t("addEngagement")}
              </a>
            </div>
          ))}
        </div>
      )}
    </ClientPageLayout>
  );
}
