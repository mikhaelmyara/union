"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const inputClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset() {
    if (loading) return;
    if (password.length < 6) { toast.error("Minimum 6 caractères."); return; }
    if (password !== confirm) { toast.error("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    toast.success("Mot de passe mis à jour !");
    setTimeout(() => { window.location.href = "/login"; }, 2000);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        {done ? (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 dark:bg-green-900/40 text-2xl">✓</div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Mot de passe mis à jour !</h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Redirection vers la connexion...</p>
          </>
        ) : !ready ? (
          <>
            <div className="mb-4 text-2xl">⚠️</div>
            <h1 className="text-2xl font-extrabold text-slate-950 dark:text-white">Lien invalide</h1>
            <p className="mt-3 text-slate-500 dark:text-slate-400">Ce lien est expiré. Demande un nouveau lien.</p>
            <a href="/forgot-password" className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700">
              Nouveau lien
            </a>
          </>
        ) : (
          <>
            <h1 className="mb-2 text-2xl font-extrabold text-slate-950 dark:text-white">Nouveau mot de passe</h1>
            <p className="text-slate-500 dark:text-slate-400">Choisis un nouveau mot de passe.</p>
            <form onSubmit={(e) => { e.preventDefault(); handleReset(); }} className="mt-6 grid gap-4">
              <div className="grid gap-1">
                <label htmlFor="password" className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nouveau mot de passe <span className="font-normal text-slate-400">(min. 6 caractères)</span>
                </label>
                <input id="password" type="password" autoComplete="new-password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
              </div>
              <div className="grid gap-1">
                <label htmlFor="confirm" className="text-sm font-bold text-slate-700 dark:text-slate-300">Confirmer</label>
                <input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
              </div>
              <button type="submit" disabled={loading}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? "Mise à jour..." : "Mettre à jour"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
