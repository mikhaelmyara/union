"use client";

import PageActions from "@/components/PageActions";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Engagement = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  campaign_title_snapshot: string | null;
  client_id: string | null;
  campaigns: {
    title: string;
    reward_amount: number;
    referral_reward_amount: number;
  } | null;
  profiles: {
    full_name: string | null;
    email: string | null;
  } | null;
};

export default function FounderEngagementsPage() {
  const [loading, setLoading] = useState(true);
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    loadEngagements();
  }, []);

  async function loadEngagements() {
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

    const { data, error } = await supabase
  .from("leads")
  .select(`
    id,
    full_name,
    email,
    phone,
    status,
    created_at,
    campaign_title_snapshot,
    client_id,
    campaigns (
      title,
      reward_amount,
      referral_reward_amount
    )
  `)
  .order("created_at", { ascending: false });
    
    if (error) {
      toast.error(error.message);
      return;
    }

    const clientIds =
  data
    ?.map((engagement) => engagement.client_id)
    .filter(Boolean) ?? [];

const { data: profilesData } = await supabase
  .from("profiles")
  .select("id, full_name")
  .in("id", clientIds);

const engagementsWithProfiles =
  data?.map((engagement) => ({
    ...engagement,
    profiles:
      profilesData?.find(
        (profile) => profile.id === engagement.client_id
      ) ?? null,
  })) ?? [];

setEngagements(
  engagementsWithProfiles as unknown as Engagement[]
);    
setLoading(false);
  }

  

  async function updateStatus(
    engagementId: string,
    status: "approved" | "rejected" | "pending"
  ) {
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", engagementId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Statut mis à jour.");
    loadEngagements();
  }

  const filteredEngagements = engagements.filter((engagement) => {
    const campaignName =
      engagement.campaigns?.title ||
      engagement.campaign_title_snapshot ||
      "Campagne supprimée";

    const clientName = engagement.profiles?.full_name ?? "";
    const clientEmail = engagement.profiles?.email ?? "";

    const matchesSearch =
      `${engagement.full_name} ${engagement.email} ${engagement.phone ?? ""} ${campaignName} ${clientName} ${clientEmail}`
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
    <main className="min-h-screen bg-[#F7F8FC] p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                U
              </div>

              <div>
                <p className="font-extrabold text-slate-950">UNION</p>
                <p className="text-sm text-slate-400">Portail fondateur</p>
              </div>
            </a>

            <nav className="flex flex-wrap gap-2">
              <a
                href="/founder"
                className="rounded-xl px-4 py-2 font-bold text-slate-500 hover:bg-slate-50"
              >
                Dashboard
              </a>

              <a
                href="/founder/engagements"
                className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white"
              >
                Engagements
              </a>

              <a
                href="/partner"
                className="rounded-xl px-4 py-2 font-bold text-slate-500 hover:bg-slate-50"
              >
                Vue partenaire
              </a>
            </nav>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-indigo-600">Fondateur</p>

            <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
              Tous les engagements
            </h1>

            <p className="mt-2 text-slate-500">
              Vue complète de tous les engagements avec client responsable,
              campagne et statut.
            </p>
          </div>

          <PageActions backHref="/founder" />
        </div>

        <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <input
            className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-600"
            placeholder="Rechercher nom, email, téléphone, campagne, client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="mt-4 flex flex-wrap gap-3">
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
        </div>

        <div className="space-y-4">
          {filteredEngagements.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-100">
              Aucun engagement trouvé.
            </div>
          ) : (
            filteredEngagements.map((engagement) => (
              <div
                key={engagement.id}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
              >
                <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr_1fr_auto] xl:items-center">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                      Contact
                    </p>

                    <h2 className="mt-1 text-xl font-extrabold text-slate-950">
                      {engagement.full_name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {engagement.email}
                    </p>

                    <p className="text-sm text-slate-500">
                      {engagement.phone ?? "Téléphone non renseigné"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                      Client responsable
                    </p>

                    <p className="mt-1 font-extrabold text-slate-950">
                      {engagement.profiles?.full_name ?? "Client inconnu"}
                    </p>

                    <p className="text-sm text-slate-500">
                    ID client : {engagement.client_id ?? "Non disponible"}                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
                      Campagne
                    </p>

                    <p className="mt-1 font-extrabold text-indigo-600">
                      {engagement.campaigns?.title ||
                        engagement.campaign_title_snapshot ||
                        "Campagne supprimée"}
                    </p>

                    <p className="text-sm text-slate-500">
                      Récompense : {engagement.campaigns?.reward_amount ?? 0} €
                    </p>

                    <p className="text-sm text-slate-500">
                      Parrain :{" "}
                      {engagement.campaigns?.referral_reward_amount ?? 0} €
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 xl:items-end">
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${
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

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateStatus(engagement.id, "approved")}
                        className="rounded-xl bg-green-600 px-3 py-2 text-sm font-bold text-white"
                      >
                        Approuver
                      </button>

                      <button
                        onClick={() => updateStatus(engagement.id, "pending")}
                        className="rounded-xl bg-yellow-500 px-3 py-2 text-sm font-bold text-white"
                      >
                        Pending
                      </button>

                      <button
                        onClick={() => updateStatus(engagement.id, "rejected")}
                        className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white"
                      >
                        Refuser
                      </button>
                    </div>
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