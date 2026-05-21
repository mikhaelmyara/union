"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "founder") setDashboardHref("/founder");
      else if (profile?.role === "partner") setDashboardHref("/partner");
      else setDashboardHref("/client");
    }
    loadUser();
  }, []);

  return (
    <main className="min-h-screen bg-[#F7F8FC]">

      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-extrabold text-white shadow-sm">
              U
            </div>
            <span className="text-xl font-extrabold text-slate-950">UNION</span>
          </a>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <a
                href={dashboardHref}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white transition hover:bg-indigo-700"
              >
                Mon dashboard
              </a>
            ) : (
              <>
                <a href="/login" className="font-bold text-slate-600 transition hover:text-slate-950">
                  Connexion
                </a>
                <a
                  href="/signup"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white transition hover:bg-indigo-700"
                >
                  Commencer
                </a>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <span className="mb-6 rounded-full bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-600 ring-1 ring-indigo-100">
          Plateforme engagements & partenaires
        </span>

        <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-6xl">
          Tout le monde <span className="text-indigo-600">gagne</span> avec UNION.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-500">
          UNION relie les clients, les partenaires et les campagnes dans une seule plateforme simple. Chaque engagement validé génère des récompenses pour tout le monde.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a
            href={isLoggedIn ? dashboardHref : "/signup"}
            className="rounded-xl bg-indigo-600 px-7 py-3.5 font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
          >
            {isLoggedIn ? "Accéder à mon dashboard" : "Créer un compte"}
          </a>
          {!isLoggedIn && (
            <a
              href="/login"
              className="rounded-xl bg-white px-7 py-3.5 font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
            >
              Se connecter
            </a>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
              🎯
            </div>
            <h2 className="text-xl font-extrabold text-slate-950">Campagnes</h2>
            <p className="mt-2 text-slate-500">
              Les fondateurs créent des campagnes ciblées. Les clients les rejoignent et soumettent des engagements qualifiés.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50 text-2xl">
              🤝
            </div>
            <h2 className="text-xl font-extrabold text-slate-950">Partenaires</h2>
            <p className="mt-2 text-slate-500">
              Les partenaires parrainent de nouveaux utilisateurs et touchent une commission sur chaque engagement validé de leur réseau.
            </p>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
              💰
            </div>
            <h2 className="text-xl font-extrabold text-slate-950">Récompenses</h2>
            <p className="mt-2 text-slate-500">
              Chaque engagement approuvé génère automatiquement des gains — directs pour le client, en commission pour le parrain.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-slate-100 bg-white px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-slate-950 md:text-4xl">
            Comment ça marche ?
          </h2>
          <p className="mt-4 text-slate-500">Simple, transparent, et rentable pour tout le monde.</p>

          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {[
              { step: "1", title: "Inscription", desc: "Crée ton compte en 30 secondes, avec ou sans code parrain." },
              { step: "2", title: "Rejoins une campagne", desc: "Parcours les campagnes actives et choisis celles qui correspondent à ton réseau." },
              { step: "3", title: "Soumets un engagement", desc: "Ajoute les contacts qualifiés que tu veux proposer au fondateur." },
              { step: "4", title: "Touche ta récompense", desc: "Dès qu'un engagement est validé, ton gain est calculé automatiquement." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-extrabold text-white shadow-md shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="mt-4 font-extrabold text-slate-950">{item.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl bg-indigo-600 p-12 text-center shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">
            Prêt à rejoindre UNION ?
          </h2>
          <p className="mt-4 text-indigo-100">
            Crée ton compte gratuitement et commence à soumettre des engagements dès aujourd'hui.
          </p>
          <a
            href="/signup"
            className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-extrabold text-indigo-600 transition hover:bg-indigo-50"
          >
            Commencer maintenant →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white">
              U
            </div>
            <span className="font-bold text-slate-950">UNION</span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} UNION. Tous droits réservés.</p>
        </div>
      </footer>

    </main>
  );
}
