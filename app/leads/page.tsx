"use client";

import PageActions from "@/components/PageActions";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Engagement = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  campaign_title_snapshot: string | null;
  campaigns: {
    title: string;
  } | null;
};

export default function EngagementsPage() {
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function loadEngagements() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("leads")
        .select(`
          id,
          full_name,
          email,
          phone,
          status,
          created_at,
          campaign_title_snapshot,
          campaigns(title)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

        setEngagements((data as unknown as Engagement[]) ?? []);
        setLoading(false);
    }

    loadEngagements();
  }, []);

  const filteredEngagements = engagements.filter((engagement) => {
    const campaignName =
      engagement.campaigns?.title ||
      engagement.campaign_title_snapshot ||
      "Campagne supprimée";

    const matchesSearch =
      `${engagement.full_name} ${engagement.email} ${engagement.phone ?? ""} ${campaignName}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || engagement.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
              Engagements
            </p>

            <h1 className="mt-2 text-4xl font-extrabold">
              Tous mes engagements
            </h1>
          </div>

          <PageActions backHref="/client" />
        </div>

        <div className="mb-6">
          <input
            className="w-full rounded-2xl border border-slate-200 bg-white p-4 outline-none focus:border-indigo-600"
            placeholder="Rechercher un engagement..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {[
            { label: "Tous", value: "all" },
            { label: "En attente", value: "pending" },
            { label: "Approuvés", value: "approved" },
            { label: "Refusés", value: "rejected" },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`rounded-xl px-4 py-2 font-bold ${
                statusFilter === filter.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredEngagements.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Aucun engagement pour le moment.
            </div>
          ) : (
            filteredEngagements.map((engagement) => (
              <div
                key={engagement.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold">
                      {engagement.full_name}
                    </h2>

                    <p className="mt-1 text-slate-500">
                      {engagement.email}
                    </p>

                    <p className="text-slate-500">
                      {engagement.phone}
                    </p>

                    <p className="mt-3 font-bold text-indigo-600">
                      {engagement.campaigns?.title ||
                        engagement.campaign_title_snapshot ||
                        "Campagne supprimée"}
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-3 md:items-end">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-bold ${
                        engagement.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : engagement.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {engagement.status === "pending"
                        ? "En attente"
                        : engagement.status === "approved"
                        ? "Approuvé"
                        : "Refusé"}
                    </span>

                    <p className="text-sm text-slate-400">
                      {new Date(engagement.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}