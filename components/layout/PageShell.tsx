import PageActions from "@/components/PageActions";

type Props = {
  eyebrow: string;
  title: string;
  description?: string;
  backHref?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export default function PageShell({
  eyebrow,
  title,
  description,
  backHref = "/client",
  children,
  actions,
}: Props) {
  return (
    <main className="min-h-screen bg-[#F7F8FC] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold text-indigo-600">{eyebrow}</p>
            <h1 className="mt-2 text-4xl font-extrabold text-slate-950">
              {title}
            </h1>
            {description && <p className="mt-2 text-slate-500">{description}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            {actions}
            <PageActions backHref={backHref} />
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}
