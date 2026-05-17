"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Connexion réussie ✅");
      window.location.href = "/dashboard";
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Connexion</h1>

      <input
        className="w-80 rounded border p-3"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="w-80 rounded border p-3"
        placeholder="Mot de passe"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        className="w-80 rounded bg-black p-3 text-white"
        onClick={handleLogin}
      >
        Se connecter
      </button>
    </main>
  );
}