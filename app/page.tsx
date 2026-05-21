"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setIsLoggedIn(true);
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (profile?.role === "founder") setDashboardHref("/founder");
      else if (profile?.role === "partner") setDashboardHref("/partner");
      else setDashboardHref("/client");
    }
    loadUser();
  }, []);

  const steps = [
    { step: "1", titleKey: "step1Title", descKey: "step1Desc" },
    { step: "2", titleKey: "step2Title", descKey: "step2Desc" },
    { step: "3", titleKey: "step3Title", descKey: "step3Desc" },
    { step: "4", titleKey: "step4Title", descKey: "step4Desc" },
  ] as const;

  return (
    <main className="min-h-screen bg-[#F7F8FC] dark:bg-slate-950">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-extrabold text-white shadow-sm">U</div>
            <span className="text-xl font-extrabold text-slate-950 dark:text-white">{tc("appName")}</span>
          </a>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <a href={dashboardHref} className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white transition hover:bg-indigo-700">
                {t("ctaLoggedIn")}
              </a>
            ) : (
              <>
                <a href="/login" className="font-bold text-slate-600 dark:text-slate-400 transition hover:text-slate-950 dark:hover:text-white">
                  {t("ctaLogin")}
                </a>
                <a href="/signup" className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white transition hover:bg-indigo-700">
                  {t("cta")}
                </a>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="mx-auto flex max-w-4xl flex-col items-center px-6 py-24 text-center">
        <span className="mb-6 rounded-full bg-indigo-50 dark:bg-indigo-900/40 px-4 py-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 ring-1 ring-indigo-100 dark:ring-indigo-800">
          Plateforme engagements &amp; partenaires
        </span>
        <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-slate-950 dark:text-white md:text-6xl">
          {t("hero").replace("<highlight>", "").replace("</highlight>", "").split("gagne")[0]}
          <span className="text-indigo-600 dark:text-indigo-400">
            {t("hero").includes("wins") ? "wins" : t("hero").includes("ganan") ? "ganan" : t("hero").includes("يربح") ? "يربح" : "gagne"}
          </span>
          {t("hero").replace("<highlight>", "").replace("</highlight>", "").split(/gagne|wins|ganan|يربح/)[1]}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-500 dark:text-slate-400">{t("heroSub")}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <a href={isLoggedIn ? dashboardHref : "/signup"}
            className="rounded-xl bg-indigo-600 px-7 py-3.5 font-bold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700"
          >
            {isLoggedIn ? t("ctaLoggedIn") : t("cta")}
          </a>
          {!isLoggedIn && (
            <a href="/login" className="rounded-xl bg-white dark:bg-slate-900 px-7 py-3.5 font-bold text-slate-700 dark:text-slate-300 ring-1 ring-slate-200 dark:ring-slate-700 transition hover:bg-slate-50 dark:hover:bg-slate-800">
              {t("ctaLogin")}
            </a>
          )}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: "🎯", titleKey: "feature1Title", descKey: "feature1Desc", bg: "bg-indigo-50 dark:bg-indigo-900/40" },
            { icon: "🤝", titleKey: "feature2Title", descKey: "feature2Desc", bg: "bg-violet-50 dark:bg-violet-900/40" },
            { icon: "💰", titleKey: "feature3Title", descKey: "feature3Desc", bg: "bg-emerald-50 dark:bg-emerald-900/40" },
          ].map((f) => (
            <div key={f.titleKey} className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
              <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.bg} text-2xl`}>{f.icon}</div>
              <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">{t(f.titleKey)}</h2>
              <p className="mt-2 text-slate-500 dark:text-slate-400">{t(f.descKey)}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-extrabold text-slate-950 dark:text-white md:text-4xl">{t("howTitle")}</h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400">{t("howSub")}</p>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {steps.map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-extrabold text-white shadow-md shadow-indigo-200">
                  {item.step}
                </div>
                <h3 className="mt-4 font-extrabold text-slate-950 dark:text-white">{t(item.titleKey)}</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl bg-indigo-600 p-12 text-center shadow-2xl shadow-indigo-200">
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">{t("ctaTitle")}</h2>
          <p className="mt-4 text-indigo-100">{t("ctaSub")}</p>
          <a href="/signup" className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-extrabold text-indigo-600 transition hover:bg-indigo-50">
            {t("ctaStart")}
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 dark:border-slate-800 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white">U</div>
            <span className="font-bold text-slate-950 dark:text-white">{tc("appName")}</span>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-500">
            {t("footer").replace("{year}", String(new Date().getFullYear()))}
          </p>
        </div>
      </footer>
    </main>
  );
}
