"use client";

import { toast } from "sonner";
import PageActions from "@/components/PageActions";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  title: string;
  is_active: boolean;
};

function LeadPageContent() {
  const searchParams = useSearchParams();
  const campaignFromUrl = searchParams.get("campaign");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [countryCode, setCountryCode] = useState("+33");
  const [phone, setPhone] = useState("");

  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCampaigns() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error(error.message);
        return;
      }

      setCampaigns(data ?? []);

      const campaignExistsInList =
        campaignFromUrl &&
        data?.some((campaign) => campaign.id === campaignFromUrl);

      if (campaignExistsInList) {
        setCampaignId(campaignFromUrl);
      } else {
        setCampaignId("");
      }
    }

    loadCampaigns();
  }, [campaignFromUrl]);

  function isValidEmail(value: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isValidCountryCode(value: string) {
    return /^\+\d{1,4}$/.test(value);
  }

  function isValidPhone(value: string) {
    return /^\d{6,14}$/.test(value);
  }

  async function handleSubmit() {
    if (submitting) return;

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanCountryCode = countryCode.trim();
    const cleanPhone = phone.replace(/\s/g, "");
    const cleanReferralCode = referralCode.trim().toUpperCase();

    const fullPhone = `${cleanCountryCode}${cleanPhone}`;

    if (!campaignId) {
      toast.error("Veuillez sélectionner une campagne.");
      return;
    }

    if (!cleanFullName) {
      toast.error("Le nom complet est obligatoire.");
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      toast.error("Adresse email invalide.");
      return;
    }

    if (!isValidCountryCode(cleanCountryCode)) {
      toast.error("Indicatif invalide. Exemple : +33, +34, +212.");
      return;
    }

    if (!isValidPhone(cleanPhone)) {
      toast.error("Numéro invalide. Mets uniquement les chiffres.");
      return;
    }

    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSubmitting(false);
      toast.error("Veuillez vous connecter.");
      window.location.href = "/login";
      return;
    }

    let partnerId = null;

    if (cleanReferralCode !== "") {
      const { data: partnerProfile, error: referralError } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", cleanReferralCode)
        .maybeSingle();

      if (referralError) {
        setSubmitting(false);
        toast.error(referralError.message);
        return;
      }

      if (partnerProfile) {
        partnerId = partnerProfile.id;
      }
    }

    const { error } = await supabase.from("leads").insert({
      campaign_id: campaignId,
      client_id: user.id,
      partner_id: partnerId,
      referral_code: cleanReferralCode,
      full_name: cleanFullName,
      email: cleanEmail,
      phone: fullPhone,
    });

    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Engagement envoyé.");

    setTimeout(() => {
      window.location.href = "/client";
    }, 700);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] p-4">
      <div className="w-full max-w-xl">
        <div className="mb-6 flex justify-end">
          <PageActions backHref="/client" />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100"
        >
          <p className="font-bold text-indigo-600">Nouvel engagement</p>

          <h1 className="mt-2 text-3xl font-extrabold">
            Ajouter un engagement
          </h1>

          <p className="mt-2 text-slate-500">
            Ajoute les informations du contact à qualifier.
          </p>

          <div className="mt-8 grid gap-4">
            <select
              className="rounded-xl border p-3"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              required
            >
              <option value="">Sélectionner une campagne</option>

              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.title}
                </option>
              ))}
            </select>

            <input
              className="rounded-xl border p-3"
              placeholder="Nom complet"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <input
              className="rounded-xl border p-3"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-3 gap-3">
              <input
                className="rounded-xl border p-3"
                placeholder="+33"
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                required
              />

              <input
                className="col-span-2 rounded-xl border p-3"
                placeholder="612345678"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <input
              className="rounded-xl border p-3"
              placeholder="Code de parrainage optionnel"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            />

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Envoi..." : "Envoyer l’engagement"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function LeadPage() {
  return (
    <Suspense>
      <LeadPageContent />
    </Suspense>
  );
}