"use client";

import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (loading) return;

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("L’email est obligatoire.");
      return;
    }

    if (!password) {
      toast.error("Le mot de passe est obligatoire.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Connexion réussie.");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 700);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
        }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100"
      >
        <h1 className="text-3xl font-extrabold">
          Connexion
        </h1>

        <p className="mt-2 text-slate-500">
          Connecte-toi à UNION.
        </p>

        <div className="mt-8 grid gap-4">
          <input
            className="rounded-xl border p-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="rounded-xl border p-3"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>

          <a
            href="/signup"
            className="text-center font-bold text-indigo-600"
          >
            Créer un compte
          </a>
        </div>
      </form>
    </main>
  );
}