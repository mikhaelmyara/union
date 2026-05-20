"use client";

type MobileHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function MobileHeader({
  title,
  subtitle = "UNION",
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-[#F7F8FC]/90 px-4 py-3 backdrop-blur lg:hidden">
      <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-extrabold text-white">
            U
          </div>

          <div>
            <p className="font-extrabold text-slate-950">{title}</p>
            <p className="text-xs font-medium text-slate-400">{subtitle}</p>
          </div>
        </a>

        <a
          href="/settings"
          className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"
        >
          Paramètres
        </a>
      </div>
    </header>
  );
}