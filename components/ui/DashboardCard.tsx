type DashboardCardProps = {
  title: string;
  value: string | number;
  tone?: "default" | "green" | "red" | "yellow" | "indigo";
};

export default function DashboardCard({
  title,
  value,
  tone = "default",
}: DashboardCardProps) {
  const styles = {
    default: "bg-white text-slate-950 ring-slate-100",
    green: "bg-green-50 text-green-700 ring-green-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    indigo: "bg-indigo-600 text-white ring-indigo-200",
  };

  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ring-1 ${styles[tone]}`}
    >
      <p className="text-2xl font-extrabold md:text-3xl">
        {value}
      </p>

      <p
        className={`mt-2 text-sm font-medium md:text-base ${
          tone === "indigo"
            ? "text-indigo-100"
            : ""
        }`}
      >
        {title}
      </p>
    </div>
  );
}