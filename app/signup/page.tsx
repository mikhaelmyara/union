"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [birthDate, setBirthDate] = useState("");

  const [referralCode, setReferralCode] =
    useState("");

  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (loading) return;

    const cleanReferralCode =
      referralCode.trim().toUpperCase();

    if (cleanReferralCode !== "") {
      const { data: existingProfile } =
        await supabase
          .from("profiles")
          .select("id")
          .eq(
            "referral_code",
            cleanReferralCode
          )
          .single();

      if (!existingProfile) {
        alert("Code parrain invalide.");
        return;
      }
    }

    if (!firstName.trim()) {
      alert("Le prénom est obligatoire.");
      return;
    }

    if (!lastName.trim()) {
      alert("Le nom est obligatoire.");
      return;
    }

    setLoading(true);

    const { error } =
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),

            birth_date: birthDate,

            referral_code_used:
              cleanReferralCode,
          },
        },
      });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Compte créé ✅");

    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignup();
        }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100"
      >
        <h1 className="text-3xl font-extrabold">
          Créer un compte
        </h1>

        <p className="mt-2 text-slate-500">
          Rejoins UNION en quelques secondes.
        </p>

        <div className="mt-8 grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="rounded-xl border p-3"
              placeholder="Prénom"
              value={firstName}
              onChange={(e) =>
                setFirstName(e.target.value)
              }
              required
            />

            <input
              className="rounded-xl border p-3"
              placeholder="Nom"
              value={lastName}
              onChange={(e) =>
                setLastName(e.target.value)
              }
              required
            />
          </div>

          <input
            className="rounded-xl border p-3"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            className="rounded-xl border p-3"
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            required
          />

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-500">
              Date de naissance
            </label>

            <input
              className="w-full rounded-xl border p-3"
              type="date"
              value={birthDate}
              onChange={(e) =>
                setBirthDate(e.target.value)
              }
              required
            />
          </div>

          <input
            className="rounded-xl border p-3"
            placeholder="Code parrain optionnel"
            value={referralCode}
            onChange={(e) =>
              setReferralCode(
                e.target.value.toUpperCase()
              )
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? "Création..."
              : "S’inscrire"}
          </button>

          <a
            href="/login"
            className="text-center font-bold text-indigo-600"
          >
            Déjà un compte ? Connexion
          </a>
        </div>
      </form>
    </main>
  );
}