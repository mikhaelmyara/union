"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

const inputClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";

export default function SignupPage() {
  const t = useTranslations("auth");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (loading) return;
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim();
    const cleanReferralCode = referralCode.trim().toUpperCase();
    if (!cleanFirstName) { toast.error(t("firstName") + " obligatoire."); return; }
    if (!cleanLastName) { toast.error(t("lastName") + " obligatoire."); return; }
    if (!birthDate) { toast.error(t("birthDate") + " obligatoire."); return; }
    if (password.length < 6) { toast.error(t("password") + " " + t("passwordMin")); return; }

    if (cleanReferralCode !== "") {
      const { data: existing, error: refErr } = await supabase.from("profiles").select("id").eq("referral_code", cleanReferralCode).maybeSingle();
      if (refErr) { toast.error(refErr.message); return; }
      if (!existing) { toast.error(t("invalidReferral")); return; }
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: cleanEmail, password,
      options: { data: { first_name: cleanFirstName, last_name: cleanLastName, birth_date: birthDate, referral_code_used: cleanReferralCode } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("signupSuccess"));
    setTimeout(() => { window.location.href = "/login"; }, 700);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800"
      >
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">{t("signup")}</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">{t("signupSubtitle")}</p>

        <div className="mt-8 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label htmlFor="firstName" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("firstName")}</label>
              <input id="firstName" className={inputClass} placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="grid gap-1">
              <label htmlFor="lastName" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("lastName")}</label>
              <input id="lastName" className={inputClass} placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>
          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("email")}</label>
            <input id="email" className={inputClass} placeholder="ton@email.com" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("password")} <span className="font-normal text-slate-400 dark:text-slate-500">{t("passwordMin")}</span>
            </label>
            <input id="password" className={inputClass} placeholder="••••••••" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <label htmlFor="birthDate" className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("birthDate")}</label>
            <input id="birthDate" className={`w-full ${inputClass}`} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <label htmlFor="referralCode" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              {t("referralCode")} <span className="font-normal text-slate-400 dark:text-slate-500">{t("referralCodeOptional")}</span>
            </label>
            <input id="referralCode" className={inputClass} placeholder="ABC123" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} />
          </div>
          <button type="submit" disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t("signingUp") : t("signup")}
          </button>
          <a href="/login" className="text-center font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            {t("alreadyAccount")}
          </a>
        </div>
      </form>
    </main>
  );
}
