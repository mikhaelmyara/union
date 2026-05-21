type SectionTitleProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function SectionTitle({
  title,
  description,
  action,
}: SectionTitleProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-950">
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-slate-500">
            {description}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  );
}