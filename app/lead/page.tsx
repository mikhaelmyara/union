"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Campaign = {
  id: string;
  title: string;
};

export default function LeadPage() {
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

      if (campaignFromUrl) {
        setCampaignId(campaignFromUrl);
      } else if (data && data.length > 0) {
        setCampaignId(data[0].id);
      }
    }

    loadCampaigns();
  }, [campaignFromUrl]);

  async function handleSubmit() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Tu dois être connecté.");
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

      if (partnerProfile) {
        partnerId = partnerProfile.id;
      }
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

    if (error) {
      alert(error.message);
    } else {
      alert("Lead ajouté ✅");
      window.location.href = "/client";
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-xl rounded bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Nouveau lead</p>

        <h1 className="mb-6 text-3xl font-bold">
          Ajouter un lead
        </h1>

        <div className="flex flex-col gap-4">
          <select
            className="rounded border p-3"
            value={campaignId}
            onChange={(e) => setCampaignId(e.target.value)}
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>

          <input
            className="rounded border p-3"
            placeholder="Nom complet"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            className="rounded border p-3"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="rounded border p-3"
            placeholder="Téléphone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <input
            className="rounded border p-3"
            placeholder="Code partenaire"
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            className="rounded bg-black px-6 py-3 text-white"
          >
            Envoyer le lead
          </button>
        </div>
      </div>
    </main>
  );
}