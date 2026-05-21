"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Locale = "fr" | "en" | "es" | "ar";

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("fr");

  useEffect(() => {
    const cookie = document.cookie.split(";").find((c) => c.trim().startsWith("locale="));
    if (cookie) {
      const val = cookie.split("=")[1].trim() as Locale;
      setLocaleState(val);
    }
  }, []);

  async function setLocale(newLocale: Locale) {
    // Save in cookie (30 days)
    document.cookie = `locale=${newLocale}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    setLocaleState(newLocale);

    // Save in Supabase profile
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").update({ language: newLocale }).eq("id", user.id);
    }

    // Reload to apply new locale
    window.location.reload();
  }

  return { locale, setLocale };
}
