"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase parse le token depuis l'URL automatiquement
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleReset() {
    if (loading) return;
    if (password.length < 6) { toast.error("Le mot de passe doit contenir au moins 6 caractères."); return; }
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
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">

        {done ? (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50 text-2xl">✓</div>
            <h1 className="text-2xl font-extrabold text-slate-950">Mot de passe mis à jour !</h1>
            <p className="mt-3 text-slate-500">Tu vas être redirigé vers la connexion dans quelques secondes...</p>
          </>
        ) : !ready ? (
          <>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-50 text-2xl">⚠️</div>
            <h1 className="text-2xl font-extrabold text-slate-950">Lien invalide</h1>
            <p className="mt-3 text-slate-500">Ce lien est expiré ou invalide. Demande un nouveau lien de réinitialisation.</p>
            <a
              href="/forgot-password"
              className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
            >
              Nouveau lien
            </a>
          </>
        ) : (
          <>
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-950">Nouveau mot de passe</h1>
            <p className="mt-2 text-slate-500">Choisis un nouveau mot de passe pour ton compte.</p>

            <form
              onSubmit={(e) => { e.preventDefault(); handleReset(); }}
              className="mt-6 grid gap-4"
            >
              <div className="grid gap-1">
                <label htmlFor="password" className="text-sm font-bold text-slate-700">
                  Nouveau mot de passe <span className="font-normal text-slate-400">(min. 6 caractères)</span>
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="grid gap-1">
                <label htmlFor="confirm" className="text-sm font-bold text-slate-700">Confirmer le mot de passe</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
