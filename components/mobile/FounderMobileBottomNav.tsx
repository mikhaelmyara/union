"use client";

type Active = "dashboard" | "campaigns" | "engagements" | "partner" | "home";

export default function FounderMobileBottomNav({ active }: { active: Active }) {
  const items = [
    { label: "Dashboard",   href: "/founder",             key: "dashboard" },
    { label: "Engag.",      href: "/founder/engagements", key: "engagements" },
    { label: "Partenaire",  href: "/partner",             key: "partner" },
    { label: "Accueil",     href: "/",                    key: "home" },
    { label: "Campagnes", href: "/founder/campaigns", key: "campaigns" },  
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
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
