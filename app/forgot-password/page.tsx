"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const inputClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit() {
    if (loading) return;
    const cleanEmail = email.trim();
    if (!cleanEmail) { toast.error("L'email est obligatoire."); return; }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md">
        <a href="/login" className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition">
          ← Retour à la connexion
        </a>
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
              <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
          {sent ? (
            <>
              <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Email envoyé !</h1>
              <p className="mt-3 text-slate-500 dark:text-slate-400">
                Un lien a été envoyé à <span className="font-bold text-slate-950 dark:text-white">{email}</span>. Vérifie ta boîte mail.
              </p>
              <button onClick={() => setSent(false)} className="mt-3 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Réessayer
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Mot de passe oublié</h1>
              <p className="mt-2 text-slate-500 dark:text-slate-400">Saisis ton email pour recevoir un lien de réinitialisation.</p>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="mt-6 grid gap-4">
                <div className="grid gap-1">
                  <label htmlFor="email" className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                  <input id="email" type="email" autoComplete="email" placeholder="ton@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
                </div>
                <button type="submit" disabled={loading}
                  className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Envoi..." : "Envoyer le lien"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
