"use client";

type Active = "dashboard" | "campaigns" | "engagements" | "referrals" | "settings" | "notifications";

export default function MobileBottomNav({ active }: { active: Active }) {
  const items = [
    { label: "Accueil",  href: "/client",        key: "dashboard" },
    { label: "Campagnes",href: "/campaigns",      key: "campaigns" },
    { label: "Engag.",   href: "/leads",          key: "engagements" },
    { label: "Parrain.", href: "/referrals",      key: "referrals" },
    { label: "Compte",   href: "/settings",       key: "settings" },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {items.map((item) => (
          <a
            key={item.key}
            href={item.href}
            className={`rounded-xl px-2 py-2 text-center text-xs font-extrabold transition ${
              active === item.key ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
