"use client";

import { useTranslations } from "next-intl";

type Active = "dashboard" | "campaigns" | "engagements" | "referrals" | "settings" | "notifications";

export default function MobileBottomNav({ active }: { active: Active }) {
  const t = useTranslations("nav");

  const items = [
    { label: t("home"),        href: "/client",    key: "dashboard" },
    { label: t("campaigns"),   href: "/campaigns", key: "campaigns" },
    { label: t("engagements"), href: "/leads",     key: "engagements" },
    { label: t("referrals"),   href: "/referrals", key: "referrals" },
    { label: t("settings"),    href: "/settings",  key: "settings" },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-2 py-2 shadow-2xl backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => (
          <a key={item.key} href={item.href}
            className={`rounded-xl px-2 py-2 text-center text-xs font-extrabold transition truncate ${
              active === item.key
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
