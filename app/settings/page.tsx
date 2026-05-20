"use client";

import MobileHeader from "@/components/mobile/MobileHeader";
import MobileBottomNav from "@/components/mobile/MobileBottomNav";
import DashboardNav from "@/components/layout/DashboardNav";
import PageShell from "@/components/layout/PageShell";
import SectionCard from "@/components/ui/SectionCard";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("fr");

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setEmail(user.email ?? "");
    }

    loadUser();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
  <>
    <MobileHeader
      title="Mes parrainages"
      subtitle="UNION"
    />
    <PageShell eyebrow="Paramètres" title="Mon compte" backHref="/client">
      <DashboardNav active="settings" />

      <SectionCard title="Informations">
        <div className="grid gap-5">
          <div>
            <p className="text-sm font-bold text-slate-500">Email</p>
            <p className="mt-1 font-semibold text-slate-950">{email}</p>
          </div>

          <div>
            <p className="text-sm font-bold text-slate-500">Langue</p>

            <select
              className="mt-2 w-full rounded-xl border p-3 outline-none focus:border-indigo-600"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
            </select>

            <p className="mt-2 text-sm text-slate-500">
              Pour l’instant, ce réglage est visuel. On connectera la vraie traduction ensuite.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="mt-4 rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:opacity-90"
          >
            Se déconnecter
          </button>
        </div>
      </SectionCard>
        </PageShell>

<MobileBottomNav active="referrals" />
  </>
);
}