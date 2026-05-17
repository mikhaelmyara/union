"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignup() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert("Compte créé ✅ Vérifie ton email.");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Créer un compte</h1>

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
        onClick={handleSignup}
      >
        S’inscrire
      </button>
    </main>
  );
}