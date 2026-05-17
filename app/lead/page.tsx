"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  title: string;
};

function LeadPageContent() {
  const searchParams = useSearchParams();
  const campaignFromUrl = searchParams.get("campaign");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [referralCode, setReferralCode] = useState("");

  useEffect(() => {
    async function loadCampaigns() {
      const { data } = await supabase
        .from("campaigns")
        .select("id, title")
        .eq("is_active", true);

      setCampaigns(data ?? []);

      if (campaignFromUrl) setCampaignId(campaignFromUrl);
      else if (data && data.length > 0) setCampaignId(data[0].id);
    }

    loadCampaigns();
  }, [campaignFromUrl]);

  async function handleSubmit() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    let partnerId = null;

    if (referralCode.trim() !== "") {
      const { data: partnerProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode.toUpperCase())
        .single();

      if (partnerProfile) partnerId = partnerProfile.id;
    }

    const { error } = await supabase.from("leads").insert({
      campaign_id: campaignId,
      client_id: user.id,
      partner_id: partnerId,
      referral_code: referralCode.toUpperCase(),
      full_name: fullName,
      email,
      phone,
    });

    if (error) alert(error.message);
    else window.location.href = "/client";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F8FC] p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <p className="font-bold text-indigo-600">Nouveau lead</p>
        <h1 className="mt-2 text-3xl font-extrabold">Ajouter un lead</h1>
        <p className="mt-2 text-slate-500">Ajoute les informations du contact à parrainer.</p>

        <div className="mt-8 grid gap-4">
          <select className="rounded-xl border p-3" value={campaignId} onChange={(e) => setCampaignId(e.target.value)}>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>

          <input className="rounded-xl border p-3" placeholder="Nom complet" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <input className="rounded-xl border p-3" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="rounded-xl border p-3" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="rounded-xl border p-3" placeholder="Code de parrainage" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} />

          <button onClick={handleSubmit} className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white">
            Envoyer le lead
          </button>
        </div>
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