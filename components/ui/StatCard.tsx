type Props = {
  label: string;
  value: string | number;
  tone?: "default" | "yellow" | "green" | "red" | "indigo";
};

export default function StatCard({ label, value, tone = "default" }: Props) {
  const styles = {
    default: "bg-white text-slate-950 ring-slate-100",
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    green: "bg-green-50 text-green-700 ring-green-100",
    red: "bg-red-50 text-red-700 ring-red-100",
    indigo: "bg-indigo-600 text-white ring-indigo-600 shadow-md shadow-indigo-200",
  }[tone];

  const labelColor = tone === "indigo" ? "text-indigo-100" : "text-current opacity-80";

  return (
    <div className={`rounded-2xl p-6 shadow-sm ring-1 ${styles}`}>
      <p className="text-3xl font-extrabold">{value}</p>
      <p className={`mt-2 font-medium ${labelColor}`}>{label}</p>
    </div>
  );
}
