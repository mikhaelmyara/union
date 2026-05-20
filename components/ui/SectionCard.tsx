type Props = {
  title?: string;
  description?: string;
  children: React.ReactNode;
};

export default function SectionCard({ title, description, children }: Props) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      {(title || description) && (
        <div className="mb-6">
          {title && <h2 className="text-2xl font-extrabold text-slate-950">{title}</h2>}
          {description && <p className="mt-2 text-slate-500">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
