"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    loadUnread();

    const channel = supabase
      .channel(`notif-bell-${Math.random()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => loadUnread()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function loadUnread() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setUnread(count ?? 0);
  }

  return (
    <a
      href="/notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-50"
      aria-label="Notifications"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
      </svg>
      {unread > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-extrabold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </a>
  );
}
