// Utilitaire export Excel — utilise la fonction Supabase get_leads_export()
// Remplace la fonction exportLeadsToExcel() dans app/founder/page.tsx

import * as XLSX from "xlsx";
import { supabase } from "@/lib/supabase";

export async function exportLeadsToExcel() {
  const { data, error } = await supabase.rpc("get_leads_export");

  if (error || !data) {
    throw new Error(error?.message ?? "Erreur export");
  }

  const formatted = data.map((row: {
    lead_full_name: string;
    lead_email: string;
    lead_phone: string;
    lead_status: string;
    campaign_title: string;
    reward_amount: number;
    referral_reward: number;
    client_name: string;
    client_email: string;
    created_at: string;
  }) => ({
    "Nom du contact":       row.lead_full_name,
    "Email contact":        row.lead_email,
    "Téléphone":            row.lead_phone,
    "Statut":               row.lead_status,
    "Campagne":             row.campaign_title,
    "Récompense (€)":       row.reward_amount,
    "Commission parrain (€)": row.referral_reward,
    "Client responsable":   row.client_name,
    "Email client":         row.client_email,
    "Date":                 new Date(row.created_at).toLocaleDateString("fr-FR"),
  }));

  const ws = XLSX.utils.json_to_sheet(formatted);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Engagements");
  XLSX.writeFile(wb, `union-engagements-${new Date().toISOString().split("T")[0]}.xlsx`);
}
