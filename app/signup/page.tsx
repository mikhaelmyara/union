"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const inputClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";

export default function SignupPage() {
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
    if (!cleanFirstName) { toast.error("Le prénom est obligatoire."); return; }
    if (!cleanLastName) { toast.error("Le nom est obligatoire."); return; }
    if (!birthDate) { toast.error("La date de naissance est obligatoire."); return; }
    if (password.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères."); return; }

    if (cleanReferralCode !== "") {
      const { data: existing, error: refErr } = await supabase.from("profiles").select("id").eq("referral_code", cleanReferralCode).maybeSingle();
      if (refErr) { toast.error(refErr.message); return; }
      if (!existing) { toast.error("Code parrain invalide."); return; }
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: cleanEmail, password,
      options: { data: { first_name: cleanFirstName, last_name: cleanLastName, birth_date: birthDate, referral_code_used: cleanReferralCode } },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Compte créé ! Connecte-toi maintenant.");
    setTimeout(() => { window.location.href = "/login"; }, 700);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <form onSubmit={(e) => { e.preventDefault(); handleSignup(); }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800"
      >
        <h1 className="text-3xl font-extrabold text-slate-950 dark:text-white">Créer un compte</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Rejoins UNION en quelques secondes.</p>

        <div className="mt-8 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label htmlFor="firstName" className="text-sm font-bold text-slate-700 dark:text-slate-300">Prénom</label>
              <input id="firstName" className={inputClass} placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="grid gap-1">
              <label htmlFor="lastName" className="text-sm font-bold text-slate-700 dark:text-slate-300">Nom</label>
              <input id="lastName" className={inputClass} placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className="grid gap-1">
            <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
            <input id="email" className={inputClass} placeholder="ton@email.com" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="grid gap-1">
            <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Mot de passe <span className="font-normal text-slate-400 dark:text-slate-500">(min. 6 caractères)</span>
            </label>
            <input id="password" className={inputClass} placeholder="••••••••" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="grid gap-1">
            <label htmlFor="birthDate" className="text-sm font-bold text-slate-700 dark:text-slate-300">Date de naissance</label>
            <input id="birthDate" className={`w-full ${inputClass}`} type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required />
          </div>

          <div className="grid gap-1">
            <label htmlFor="referralCode" className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Code parrain <span className="font-normal text-slate-400 dark:text-slate-500">(optionnel)</span>
            </label>
            <input id="referralCode" className={inputClass} placeholder="ABC123" value={referralCode} onChange={(e) => setReferralCode(e.target.value.toUpperCase())} />
          </div>

          <button type="submit" disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Création..." : "S'inscrire"}
          </button>

          <a href="/login" className="text-center font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Déjà un compte ? Se connecter
          </a>
        </div>
      </form>
    </main>
  );
}
