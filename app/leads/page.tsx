"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  campaign_title_snapshot: string | null;
  campaigns: {
    title: string;
  } | null;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeads() {
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
          *,
          campaigns(title)
        `)
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      setLeads(data as Lead[]);
      setLoading(false);
    }

    loadLeads();
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
        <div className="mb-10 flex items-center justify-between">
          <div>
            <p className="font-bold text-indigo-600">
              Leads
            </p>

            <h1 className="mt-2 text-4xl font-extrabold">
              Tous mes leads
            </h1>
          </div>

          <a
            href="/client"
            className="rounded-xl bg-black px-5 py-3 font-bold text-white"
          >
            Retour
          </a>
        </div>

        <div className="space-y-4">
          {leads.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              Aucun lead pour le moment.
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-2xl font-extrabold">
                      {lead.full_name}
                    </h2>

                    <p className="mt-1 text-slate-500">
                      {lead.email}
                    </p>

                    <p className="text-slate-500">
                      {lead.phone}
                    </p>

                    <p className="mt-3 font-bold text-indigo-600">
                      {lead.campaigns?.title ||
                        lead.campaign_title_snapshot ||
                        "Campagne supprimée"}
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

                    <p className="text-sm text-slate-400">
                      {new Date(
                        lead.created_at
                      ).toLocaleDateString()}
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