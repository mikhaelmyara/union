type Props = {
  backHref?: string;
};

export default function PageActions({
  backHref = "/",
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href="/"
        className="rounded-xl bg-white px-5 py-3 font-bold text-slate-700 ring-1 ring-slate-200"
      >
        Accueil
      </a>

      <a
        href={backHref}
        className="rounded-xl bg-black px-5 py-3 font-bold text-white"
      >
        Retour
      </a>
    </div>
  );
}