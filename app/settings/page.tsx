"use client";

import ClientPageLayout from "@/components/layout/ClientPageLayout";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Profile = {
  full_name: string | null;
  referral_code: string | null;
  role: string | null;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, referral_code, role")
        .eq("id", user.id)
        .single();

      setProfile(data ?? null);
      setLoading(false);
    }
    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function copyCode() {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    toast.success("Code copié !");
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <PageSkeleton />;

  return (
    <ClientPageLayout
      active="settings"
      eyebrow="Paramètres"
      title="Mon compte"
      description="Gère tes informations et ta session."
    >
      <div className="space-y-6">
        {/* Infos */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-5 text-xl font-extrabold text-slate-950">Informations</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Nom complet</p>
              <p className="mt-1 font-semibold text-slate-950">{profile?.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Email</p>
              <p className="mt-1 font-semibold text-slate-950">{email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Rôle</p>
              <p className="mt-1 font-semibold capitalize text-slate-950">{profile?.role ?? "client"}</p>
            </div>
          </div>
        </div>

        {/* Code parrainage */}
        {profile?.referral_code && (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-4 text-xl font-extrabold text-slate-950">Mon code parrain</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-xl bg-indigo-600 px-5 py-3 text-2xl font-extrabold text-white">
                {profile.referral_code}
              </div>
              <button
                onClick={copyCode}
                className="rounded-xl bg-indigo-50 px-4 py-3 font-bold text-indigo-600 transition hover:bg-indigo-100"
              >
                {copied ? "Copié ✓" : "Copier"}
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500">
              Partage ce code pour parrainer de nouveaux utilisateurs et gagner des commissions.
            </p>
          </div>
        )}

        {/* Danger zone */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-4 text-xl font-extrabold text-slate-950">Session</h2>
          <button
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700"
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </ClientPageLayout>
  );
}
