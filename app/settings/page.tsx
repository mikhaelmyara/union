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
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-[#F7F8FC] p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="font-bold text-indigo-600">
                Paramètres
                </p>

                <h1 className="mt-2 text-4xl font-extrabold">
                Mon compte
                </h1>
            </div>

            <PageActions backHref="/client" />
            </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-extrabold">Informations</h2>

          <div className="mt-6 grid gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500">Email</p>
              <p className="mt-1 font-semibold">{email}</p>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-500">Langue</p>
              <select
                className="mt-2 w-full rounded-xl border p-3"
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
              className="mt-4 rounded-xl bg-red-600 px-5 py-3 font-bold text-white"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}