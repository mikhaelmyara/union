"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import FounderPageLayout from "@/components/layout/FounderPageLayout";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useTranslations } from "next-intl";

type Profile = {
  id: string;
  full_name: string | null;
  role: "client" | "partner" | "founder";
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
};

const roleStyle: Record<string, string> = {
  founder: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400",
  partner: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400",
  client:  "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
};

export default function FounderUsersPage() {
  const t = useTranslations("founder");
  const tc = useTranslations("common");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editUser, setEditUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<"client" | "partner" | "founder">("client");
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "founder") { window.location.href = "/client"; return; }
    const { data, error } = await supabase.from("profiles").select("id, full_name, role, referral_code, referred_by, created_at").order("created_at", { ascending: false });
    if (error) { toast.error(error.message); return; }
    setUsers((data as Profile[]) ?? []);
    setLoading(false);
  }

  async function updateRole() {
    if (!editUser || saving) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", editUser.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Rôle mis à jour.");
    setUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, role: newRole } : u));
    setEditUser(null);
    setConfirmOpen(false);
  }

  const filtered = users.filter((u) => {
    const matchSearch = `${u.full_name ?? ""} ${u.referral_code ?? ""}`.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    all: users.length,
    client: users.filter((u) => u.role === "client").length,
    partner: users.filter((u) => u.role === "partner").length,
    founder: users.filter((u) => u.role === "founder").length,
  };

  return (
    <FounderPageLayout active="users" title={t("usersTitle")} description={t("usersSub")}>
      <div className="mb-6 rounded-2xl bg-white dark:bg-slate-900 p-4 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800">
        <input
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-950 dark:text-white placeholder:text-slate-400 outline-none focus:border-indigo-500"
          placeholder={tc("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { label: `${tc("all")} (${counts.all})`, value: "all" },
            { label: `Clients (${counts.client})`, value: "client" },
            { label: `Partenaires (${counts.partner})`, value: "partner" },
            { label: `Fondateurs (${counts.founder})`, value: "founder" },
          ].map((f) => (
            <button key={f.value} onClick={() => setRoleFilter(f.value)}
              className={`rounded-xl px-4 py-2 text-sm font-bold transition ${roleFilter === f.value ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
            >
              {f.label}
            </button>
          ))}
          <span className="ml-auto self-center text-sm text-slate-400 dark:text-slate-500">{filtered.length} utilisateurs</span>
        </div>
      </div>

      {loading ? <ListSkeleton rows={6} /> : filtered.length === 0 ? (
        <EmptyState message="Aucun utilisateur trouvé." />
      ) : (
        <div className="space-y-3">
          {filtered.map((u) => (
            <div key={u.id} className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 transition hover:shadow-md">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-950 dark:text-white">{u.full_name ?? "Sans nom"}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${roleStyle[u.role]}`}>{u.role}</span>
                  </div>
                  {u.referral_code && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      Code : <span className="font-bold text-indigo-600 dark:text-indigo-400">{u.referral_code}</span>
                    </p>
                  )}
                  <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    {new Date(u.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button onClick={() => { setEditUser(u); setNewRole(u.role); setConfirmOpen(true); }}
                  className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  Modifier le rôle
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editUser && confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800">
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white">Modifier le rôle</h2>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              {editUser.full_name ?? "Cet utilisateur"} — rôle actuel : <span className="font-bold">{editUser.role}</span>
            </p>
            <div className="mt-5 grid gap-2">
              {(["client", "partner", "founder"] as const).map((r) => (
                <button key={r} onClick={() => setNewRole(r)}
                  className={`rounded-xl px-4 py-3 text-left font-bold transition ${newRole === r ? "bg-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"}`}
                >
                  {r === "client" ? "Client" : r === "partner" ? "Partenaire" : "Fondateur"}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={updateRole} disabled={saving || newRole === editUser.role}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? tc("saving") : tc("confirm")}
              </button>
              <button onClick={() => { setEditUser(null); setConfirmOpen(false); }}
                className="rounded-xl bg-slate-100 dark:bg-slate-800 px-5 py-2.5 font-bold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                {tc("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </FounderPageLayout>
  );
}
