"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  async function handleLogin() {
    if (loading) return;
    const cleanEmail = email.trim();
    if (!cleanEmail) { toast.error("L'email est obligatoire."); return; }
    if (!password) { toast.error("Le mot de passe est obligatoire."); return; }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    setLoading(false);

    if (error) { toast.error(error.message); return; }

    toast.success("Connexion réussie.");
    const redirect = searchParams.get("redirect") ?? "/dashboard";
    setTimeout(() => { window.location.href = redirect; }, 700);
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
      className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100"
    >
      <h1 className="text-3xl font-extrabold">Connexion</h1>
      <p className="mt-2 text-slate-500">Connecte-toi à UNION.</p>

      <div className="mt-8 grid gap-4">
        <div className="grid gap-1">
          <label htmlFor="email" className="text-sm font-bold text-slate-700">Email</label>
          <input
            id="email"
            className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="ton@email.com"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-1">
          <label htmlFor="password" className="text-sm font-bold text-slate-700">Mot de passe</label>
          <input
            id="password"
            className="rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <a href="/forgot-password" className="text-right text-sm font-bold text-indigo-600 hover:underline">
        Mot de passe oublié ?
        </a>

        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Connexion..." : "Se connecter"}
        </button>

        <a href="/signup" className="text-center font-bold text-indigo-600 hover:underline">
          Pas encore de compte ? Créer un compte
        </a>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] p-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
