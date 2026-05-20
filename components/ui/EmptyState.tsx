type Props = {
  message: string;
};

export default function EmptyState({ message }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500">
      {message}
    </div>
  );
}
