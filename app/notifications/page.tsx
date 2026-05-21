"use client";

import ClientPageLayout from "@/components/layout/ClientPageLayout";
import EmptyState from "@/components/ui/EmptyState";
import { ListSkeleton } from "@/components/ui/Skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type Notification = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  is_read: boolean;
  created_at: string;
};

const typeStyle: Record<string, string> = {
  success: "text-green-600",
  warning: "text-yellow-600",
  error:   "text-red-600",
  info:    "text-indigo-600",
};

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
    const channel = supabase
      .channel("notifications-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => loadNotifications())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadNotifications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = "/login"; return; }

    const { data, error } = await supabase
      .from("notifications")
      .select("id, title, description, type, is_read, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) { toast.error(error.message); setLoading(false); return; }
    setNotifications((data as Notification[]) ?? []);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
  }

  async function markAllAsRead() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("Toutes les notifications marquées comme lues.");
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <ClientPageLayout
      active="notifications"
      eyebrow="Notifications"
      title="Notifications"
      description="Retrouve ici les événements importants de ton activité."
      actions={
        unreadCount > 0 ? (
          <button
            onClick={markAllAsRead}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            Tout marquer comme lu ({unreadCount})
          </button>
        ) : undefined
      }
    >
      {loading ? (
        <ListSkeleton rows={5} />
      ) : notifications.length === 0 ? (
        <EmptyState message="Aucune notification pour le moment." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`w-full rounded-2xl p-5 text-left shadow-sm ring-1 transition hover:shadow-md ${
                n.is_read ? "bg-white ring-slate-100" : "bg-indigo-50 ring-indigo-200"
              }`}
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                    )}
                    <p className={`text-xs font-bold uppercase tracking-wide ${typeStyle[n.type] ?? "text-indigo-600"}`}>
                      {n.type}
                    </p>
                  </div>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">{n.title}</h2>
                  {n.description && <p className="mt-1 text-sm text-slate-500">{n.description}</p>}
                </div>
                <p className="shrink-0 text-xs text-slate-400">
                  {new Date(n.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </ClientPageLayout>
  );
}
