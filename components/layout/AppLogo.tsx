type Props = {
  subtitle?: string;
};

export default function AppLogo({ subtitle = "UNION" }: Props) {
  return (
    <a href="/" className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm">
        U
      </div>

      <div>
        <p className="font-extrabold leading-5 text-slate-950">UNION</p>
        <p className="text-sm text-slate-400">{subtitle}</p>
      </div>
    </a>
  );
}
