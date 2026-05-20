"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [dashboardHref, setDashboardHref] = useState("/login");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setIsLoggedIn(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "founder") {
        setDashboardHref("/founder");
      } else if (profile?.role === "partner") {
        setDashboardHref("/partner");
      } else {
        setDashboardHref("/client");
      }
    }

    loadUser();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F8FC]">
      <header className="border-b bg-white px-6 py-4">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/" className="text-2xl font-extrabold text-slate-950">
            UNION
          </a>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <a
                href={dashboardHref}
                className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
              >
                Mon dashboard
              </a>
            ) : (
              <>
                <a href="/login" className="font-bold text-slate-600">
                  Connexion
                </a>

                <a
                  href="/signup"
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
                >
                  Créer un compte
                </a>
              </>
            )}
          </div>
        </nav>
      </header>

      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="mb-4 rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm">
          Plateforme engagements & partenaires
        </p>

        <h1 className="max-w-3xl text-5xl font-extrabold tracking-tight text-slate-950">
          UNION connecte les campagnes, les clients et les partenaires.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-500">
          Gérez vos campagnes, vos engagements, vos codes de parrainage et vos récompenses depuis une seule plateforme simple et sécurisée.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a
            href={isLoggedIn ? dashboardHref : "/signup"}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-md shadow-indigo-200"
          >
            {isLoggedIn ? "Accéder à mon dashboard" : "Commencer"}
          </a>

          {!isLoggedIn && (
            <a
              href="/login"
              className="rounded-xl bg-white px-6 py-3 font-bold text-slate-700 shadow-sm ring-1 ring-slate-200"
            >
              Se connecter
            </a>
          )}
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-2 text-xl font-extrabold">Campagnes</h2>
          <p className="text-slate-500">
            Créez et gérez vos campagnes depuis un dashboard fondateur.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-2 text-xl font-extrabold">Engagements</h2>
          <p className="text-slate-500">
            Collectez les informations de potentiels clients et suivez leur statut.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <h2 className="mb-2 text-xl font-extrabold">Récompenses</h2>
          <p className="text-slate-500">
            Les gains sont calculés automatiquement après validation des engagements.
          </p>
        </div>
      </section>
    </main>
  );
}