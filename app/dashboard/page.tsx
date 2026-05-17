"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  useEffect(() => {
    async function redirectByRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (data?.role === "founder") {
        window.location.href = "/founder";
      } else if (data?.role === "partner") {
        window.location.href = "/partner";
      } else {
        window.location.href = "/client";
      }
    }

    redirectByRole();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <p>Chargement...</p>
    </main>
  );
}