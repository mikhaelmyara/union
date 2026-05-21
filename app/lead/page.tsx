"use client";

import { toast } from "sonner";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useTranslations } from "next-intl";

type Campaign = { id: string; title: string; is_active: boolean };

const inputClass = "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-900";

function LeadPageContent() {
  const t = useTranslations("lead");
  const searchParams = useSearchParams();
  const campaignFromUrl = searchParams.get("campaign");

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignId, setCampaignId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("+33");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCampaigns() {
      const { data, error } = await supabase
        .from("campaigns")
        .select("id, title, is_active")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) { toast.error(error.message); return; }
      setCampaigns(data ?? []);
      const exists = campaignFromUrl && data?.some((c) => c.id === campaignFromUrl);
      setCampaignId(exists ? campaignFromUrl : "");
    }
    loadCampaigns();
  }, [campaignFromUrl]);

  function isValidEmail(v: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
  function isValidCountryCode(v: string) { return /^\+\d{1,4}$/.test(v); }
  function isValidPhone(v: string) { return /^\d{6,14}$/.test(v); }

  async function handleSubmit() {
    if (submitting) return;
    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanCountryCode = countryCode.trim();
    const cleanPhone = phone.replace(/\s/g, "");
    const fullPhone = `${cleanCountryCode}${cleanPhone}`;

    if (!campaignId) { toast.error(t("invalidCampaign")); return; }
    if (!cleanFullName) { toast.error(t("invalidName")); return; }
    if (!isValidEmail(cleanEmail)) { toast.error(t("invalidEmail")); return; }
    if (!isValidCountryCode(cleanCountryCode)) { toast.error(t("invalidCountryCode")); return; }
    if (!isValidPhone(cleanPhone)) { toast.error(t("invalidPhone")); return; }

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSubmitting(false); toast.error("Non connecté."); window.location.href = "/login"; return; }

    const { error } = await supabase.from("leads").insert({
      campaign_id: campaignId,
      client_id: user.id,
      full_name: cleanFullName,
      email: cleanEmail,
      phone: fullPhone,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("success"));
    setTimeout(() => { window.location.href = "/client"; }, 700);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-xl">
        <a href="/client" className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 transition hover:text-slate-950 dark:hover:text-white">
          {t("backToDashboard")}
        </a>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
          className="rounded-2xl bg-white dark:bg-slate-900 p-8 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800"
        >
          <p className="font-bold text-indigo-600 dark:text-indigo-400">{t("eyebrow")}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white">{t("title")}</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t("subtitle")}</p>

          <div className="mt-8 grid gap-4">
            <div className="grid gap-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("selectCampaign")}</label>
              <select className={inputClass} value={campaignId} onChange={(e) => setCampaignId(e.target.value)} required>
                <option value="">{t("selectCampaign")}</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("fullName")}</label>
              <input className={inputClass} placeholder="Jean Dupont" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("email")}</label>
              <input className={inputClass} placeholder="contact@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t("phone")}</label>
              <div className="grid grid-cols-3 gap-3">
                <input className={inputClass} placeholder="+33" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} required />
                <input className={`col-span-2 ${inputClass}`} placeholder="612345678" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
            </div>
            <button type="submit" disabled={submitting}
              className="mt-2 rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t("submitting") : t("submit")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function LeadPage() {
  return <Suspense><LeadPageContent /></Suspense>;
}
