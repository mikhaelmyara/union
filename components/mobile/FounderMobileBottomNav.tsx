"use client";

type FounderMobileBottomNavProps = {
  active: "dashboard" | "engagements" | "partner" | "home";
};

export default function FounderMobileBottomNav({
  active,
}: FounderMobileBottomNavProps) {
  const items = [
    { label: "Dashboard", href: "/founder", key: "dashboard" },
    { label: "Engag.", href: "/founder/engagements", key: "engagements" },
    { label: "Partner", href: "/partner", key: "partner" },
    { label: "Home", href: "/", key: "home" },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {items.map((item) => {
          const isActive = active === item.key;

          return (
            <a
              key={item.href}
              href={item.href}
              className={`rounded-xl px-2 py-2 text-center text-xs font-extrabold transition ${
                isActive
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}