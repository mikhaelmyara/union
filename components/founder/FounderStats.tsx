type Props = {
  totalEngagements: number;
  pending: number;
  approved: number;
  rejected: number;
  totalRewards: number;
  referralRewards: number;
};

export default function FounderStats({
  totalEngagements,
  pending,
  approved,
  rejected,
  totalRewards,
  referralRewards,
}: Props) {
  return (
    <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <p className="text-3xl font-extrabold text-slate-950">{totalEngagements}</p>
        <p className="mt-2 font-medium text-slate-500">Total engagements</p>
      </div>

      <div className="rounded-2xl bg-yellow-50 p-6 shadow-sm ring-1 ring-yellow-100">
        <p className="text-3xl font-extrabold text-yellow-700">{pending}</p>
        <p className="mt-2 font-medium text-yellow-700">En attente</p>
      </div>

      <div className="rounded-2xl bg-green-50 p-6 shadow-sm ring-1 ring-green-100">
        <p className="text-3xl font-extrabold text-green-700">{approved}</p>
        <p className="mt-2 font-medium text-green-700">Approuvés</p>
      </div>

      <div className="rounded-2xl bg-red-50 p-6 shadow-sm ring-1 ring-red-100">
        <p className="text-3xl font-extrabold text-red-700">{rejected}</p>
        <p className="mt-2 font-medium text-red-700">Refusés</p>
      </div>

      <div className="rounded-2xl bg-indigo-600 p-6 text-white shadow-md shadow-indigo-200">
        <p className="text-3xl font-extrabold">{totalRewards} €</p>
        <p className="mt-2 font-medium text-indigo-100">Gains totaux</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <p className="text-3xl font-extrabold text-slate-950">{referralRewards} €</p>
        <p className="mt-2 font-medium text-slate-500">Commissions parrainage</p>
      </div>
    </div>
  );
}
