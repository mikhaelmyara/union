"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Props = {
  pending: number;
  approved: number;
  rejected: number;
};

export default function AnalyticsSection({ pending, approved, rejected }: Props) {
  const chartData = [
    { name: "En attente", value: pending, color: "#EAB308" },
    { name: "Approuvés", value: approved, color: "#16A34A" },
    { name: "Refusés", value: rejected, color: "#DC2626" },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h2 className="mb-6 text-2xl font-extrabold text-slate-950">
        Analytics des engagements
      </h2>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" radius={[10, 10, 0, 0]}>
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
