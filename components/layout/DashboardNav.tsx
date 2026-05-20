import AppLogo from "@/components/layout/AppLogo";

type NavItem = {
  href: string;
  label: string;
};

type Props = {
  active: "dashboard" | "campaigns" | "engagements" | "referrals" | "settings" | "founder" | "partner";
  variant?: "client" | "founder" | "partner";
};

const clientItems: NavItem[] = [
  { href: "/client", label: "Dashboard" },
  { href: "/campaigns", label: "Campagnes" },
  { href: "/leads", label: "Engagements" },
  { href: "/referrals", label: "Parrainages" },
  { href: "/settings", label: "Paramètres" },
];

const founderItems: NavItem[] = [
  { href: "/founder", label: "Dashboard" },
  { href: "/founder/engagements", label: "Engagements" },
  { href: "/partner", label: "Vue partenaire" },
];

function activeKeyFromHref(href: string): Props["active"] {
  if (href === "/campaigns") return "campaigns";
  if (href === "/leads" || href === "/founder/engagements") return "engagements";
  if (href === "/referrals") return "referrals";
  if (href === "/settings") return "settings";
  if (href === "/founder") return "founder";
  if (href === "/partner") return "partner";
  return "dashboard";
}

export default function DashboardNav({ active, variant = "client" }: Props) {
  const items = variant === "founder" ? founderItems : clientItems;
  const subtitle =
    variant === "founder"
      ? "Portail fondateur"
      : variant === "partner"
      ? "Portail partenaire"
      : "Portail client";

  return (
    <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <AppLogo subtitle={subtitle} />

        <nav className="flex flex-wrap gap-2">
          {items.map((item) => {
            const isActive = activeKeyFromHref(item.href) === active;

            return (
              <a
                key={item.href}
                href={item.href}
                className={`rounded-xl px-4 py-2 font-bold transition ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
