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

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, referral_code")
      .eq("id", user.id)
      .single();

    if (
      profile?.role !== "partner" &&
      profile?.role !== "founder"
    ) {
      window.location.href = "/client";
      return;
    }

    setReferralCode(profile?.referral_code ?? "");

    const { data } = await supabase
      .from("leads")
      .select(
        "id, full_name, email, phone, status, campaigns(title, reward_amount)"
      )
      .eq("partner_id", user.id)
      .order("created_at", { ascending: false });

    setLeads(data as unknown as Lead[]);
    setLoading(false);
  }

  const approvedLeads = leads.filter(
    (lead) => lead.status === "approved"
  ).length;

  const pendingLeads = leads.filter(
    (lead) => lead.status === "pending"
  ).length;

  const totalRewards = leads
    .filter((lead) => lead.status === "approved")
    .reduce(
      (sum, lead) => sum + (lead.campaigns?.reward_amount ?? 0),
      0
    );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p>Chargement...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-500">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold">
            Espace partenaire
          </h1>
        </div>

        <div className="mb-8 rounded bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">
            Mon code partenaire
          </p>
          <p className="mt-2 text-3xl font-bold">
            {referralCode}
          </p>
        </div>

            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">          <div className="rounded bg-white p-6 shadow-sm">
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

        <h2 className="mb-4 text-2xl font-bold">
          Mes leads
        </h2>

        <div className="grid gap-4">
          {leads.length === 0 ? (
            <div className="rounded bg-white p-6 shadow-sm">
              Aucun lead pour le moment.
            </div>
          ) : (
            leads.map((lead) => (
              <div
                key={lead.id}
                className="rounded bg-white p-6 shadow-sm"
              >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">                  <div>
                    <h3 className="text-xl font-bold">
                      {lead.full_name}
                    </h3>
                    <p className="text-gray-600">
                      Email : {lead.email}
                    </p>
                    <p className="text-gray-600">
                      Téléphone : {lead.phone}
                    </p>
                    <p className="text-gray-600">
                      Campagne : {lead.campaigns?.title}
                    </p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="font-bold">
                      Statut : {lead.status}
                    </p>
                    <p className="font-bold">
                      Récompense :{" "}
                      {lead.campaigns?.reward_amount ?? 0} €
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