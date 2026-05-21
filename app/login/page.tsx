"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

const inputClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";

function LoginForm() {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  

  async function handleLogin() {
    if (loading) return;
    const cleanEmail = email.trim();
    if (!cleanEmail) { toast.error(t("email") + " obligatoire."); return; }
    if (!password) { toast.error(t("password") + " obligatoire."); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("loginSuccess"));
    const redirect = searchParams.get("redirect") ?? "/dashboard";
    const safeRedirect = redirect.startsWith("/") ? redirect : "/dashboard";
    setTimeout(() => { window.location.href = safeRedirect; }, 700);
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
      className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800"
    >
      <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">{t("login")}</h1>
      <p className="mt-2 text-slate-500 dark:text-slate-400">{t("loginSubtitle")}</p>

      <div className="mt-8 grid gap-4">
        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("email")}</label>
          <input id="email" className={inputClass} placeholder="ton@email.com" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="grid gap-1">
          <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("password")}</label>
          <input id="password" className={inputClass} placeholder="••••••••" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <a href="/forgot-password" className="text-right text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          {t("forgotPassword")}
        </a>
        <button type="submit" disabled={loading}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t("loggingIn") : t("login")}
        </button>
        <a href="/signup" className="text-center font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
          {t("noAccount")}
        </a>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Suspense fallback={null}><LoginForm /></Suspense>
    </main>
  );
}
