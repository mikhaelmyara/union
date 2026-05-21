"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MobileHeader from "@/components/mobile/MobileHeader";
import FounderMobileBottomNav from "@/components/mobile/FounderMobileBottomNav";
import NotificationBell from "@/components/ui/NotificationBell";

type Active = "dashboard" | "campaigns" | "engagements" | "users" | "partner" | "home";

type Props = {
  active: Active;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const navItems = [
  { href: "/founder",             label: "Dashboard",      key: "dashboard" },
  { href: "/founder/campaigns",   label: "Campagnes",      key: "campaigns" },
  { href: "/founder/engagements", label: "Engagements",    key: "engagements" },
  { href: "/founder/users",       label: "Utilisateurs",   key: "users" },
  { href: "/partner",             label: "Vue partenaire", key: "partner" },
] as const;

export default function FounderPageLayout({ active, title, description, children, actions }: Props) {
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setEmail(user?.email ?? ""));
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <>
      <MobileHeader title={title} subtitle="UNION Fondateur" />

      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-0 pb-28 lg:p-3 lg:pb-3">
        <div className="mx-auto flex min-h-screen max-w-7xl overflow-hidden bg-slate-50 dark:bg-slate-950 lg:min-h-[calc(100vh-24px)] lg:rounded-2xl lg:border lg:border-slate-200 dark:lg:border-slate-800">

          <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 lg:flex">
            <div>
              <a href="/" className="mb-10 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-sm">U</div>
                <div>
                  <p className="text-lg font-bold leading-5 text-slate-900 dark:text-white">UNION</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500">Portail fondateur</p>
                </div>
              </a>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <a key={item.key} href={item.href}
                    className={`block rounded-xl px-4 py-3 font-semibold transition ${
                      active === item.key
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900 font-bold text-indigo-600 dark:text-indigo-400">F</div>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{email}</p>
                </div>
                <NotificationBell />
              </div>
              <button onClick={handleLogout} className="text-sm font-semibold text-slate-500 dark:text-slate-400 transition hover:text-slate-900 dark:hover:text-white">
                Déconnexion
              </button>
            </div>
          </aside>

          <section className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 md:px-8 lg:px-12 lg:py-8">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-bold text-indigo-600 dark:text-indigo-400">Fondateur</p>
                <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 dark:text-white md:text-4xl">{title}</h1>
                {description && <p className="mt-2 text-slate-500 dark:text-slate-400">{description}</p>}
              </div>
              {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
            </div>
            {children}
          </section>
        </div>
      </main>

      <FounderMobileBottomNav active={active} />
    </>
  );
}