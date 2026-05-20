"use client";

import PageActions from "@/components/PageActions";
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
    <main className="min-h-screen bg-[#F7F8FC] p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <a href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
                U
              </div>

              <div>
                <p className="font-extrabold text-slate-950">UNION</p>
                <p className="text-sm text-slate-400">Paramètres</p>
              </div>
            </a>

            <nav className="flex flex-wrap gap-2">
              <a
                href="/client"
                className="rounded-xl px-4 py-2 font-bold text-slate-500 hover:bg-slate-50"
              >
                Dashboard
              </a>

              <a
                href="/campaigns"
                className="rounded-xl px-4 py-2 font-bold text-slate-500 hover:bg-slate-50"
              >
                Campagnes
              </a>

              <a
                href="/leads"
                className="rounded-xl px-4 py-2 font-bold text-slate-500 hover:bg-slate-50"
              >
                Engagements
              </a>

              <a
                href="/settings"
                className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white"
              >
                Paramètres
              </a>
            </nav>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-indigo-600">Paramètres</p>

            <h1 className="mt-2 text-4xl font-extrabold">
              Mon compte
            </h1>
          </div>

          <PageActions backHref="/client" />
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="text-2xl font-extrabold">Informations</h2>

          <div className="mt-6 grid gap-5">
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
        </div>
      </div>
    </main>
  );
}