type Props = {
  status: "pending" | "approved" | "rejected" | string;
};

export default function StatusBadge({ status }: Props) {
  const label =
    status === "pending"
      ? "En attente"
      : status === "approved"
      ? "Approuvé"
      : status === "rejected"
      ? "Refusé"
      : status;

  const className =
    status === "approved"
      ? "bg-green-100 text-green-700"
      : status === "rejected"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <span className={`w-fit rounded-full px-3 py-1 text-sm font-bold ${className}`}>
      {label}
    </span>
  );
}
