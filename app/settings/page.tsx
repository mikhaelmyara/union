"use client";

import ClientPageLayout from "@/components/layout/ClientPageLayout";
import { PageSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useLocale, type Locale } from "@/lib/useLocale";

type Profile = {
  full_name: string | null;
  referral_code: string | null;
  role: string | null;
  language: string | null;
};

const LANGUAGES: { value: Locale; label: string; flag: string }[] = [
  { value: "fr", label: "Français", flag: "🇫🇷" },
  { value: "en", label: "English", flag: "🇬🇧" },
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "ar", label: "العربية", flag: "🇸🇦" },
];

export default function SettingsPage() {
  const t = useTranslations("settings");
  const { locale, setLocale } = useLocale();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("full_name, referral_code, role, language").eq("id", user.id).single();
      setProfile(data ?? null);
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function copyCode() {
    if (!profile?.referral_code) return;
    navigator.clipboard.writeText(profile.referral_code);
    setCopied(true);
    toast.success(t("languageSaved"));
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleLanguageChange(newLocale: Locale) {
    await setLocale(newLocale);
    toast.success(t("languageSaved"));
  }

  if (loading) return <PageSkeleton />;

  return (
    <ClientPageLayout active="settings" eyebrow={t("title")} title={t("title")} description={t("subtitle")}>
      <div className="space-y-6">

        {/* Infos */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <h2 className="mb-5 text-xl font-extrabold text-slate-950 dark:text-white">{t("information")}</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{t("fullName")}</p>
              <p className="mt-1 font-semibold text-slate-950 dark:text-white">{profile?.full_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{t("email")}</p>
              <p className="mt-1 font-semibold text-slate-950 dark:text-white">{email}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{t("role")}</p>
              <p className="mt-1 font-semibold capitalize text-slate-950 dark:text-white">{profile?.role ?? "client"}</p>
            </div>
          </div>
        </div>

        {/* Langue */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <h2 className="mb-5 text-xl font-extrabold text-slate-950 dark:text-white">{t("language")}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.value}
                onClick={() => handleLanguageChange(lang.value)}
                className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 font-bold transition ${
                  locale === lang.value
                    ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-sm">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Code parrain */}
        {profile?.referral_code && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
            <h2 className="mb-4 text-xl font-extrabold text-slate-950 dark:text-white">{t("referralCode")}</h2>
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-xl bg-indigo-600 px-5 py-3 text-2xl font-extrabold text-white">
                {profile.referral_code}
              </div>
              <button onClick={copyCode} className="rounded-xl bg-indigo-50 dark:bg-indigo-900/40 px-4 py-3 font-bold text-indigo-600 dark:text-indigo-400 transition hover:bg-indigo-100">
              {copied ? "Copié ✓" : "Copier"}              </button>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t("referralShare")}</p>
          </div>
        )}

        {/* Session */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <h2 className="mb-4 text-xl font-extrabold text-slate-950 dark:text-white">{t("session")}</h2>
          <button onClick={handleLogout} className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white transition hover:bg-red-700">
            {t("logout")}
          </button>
        </div>
      </div>
    </ClientPageLayout>
  );
}
