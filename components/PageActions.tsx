"use client";

type Props = {
  backHref?: string;
};

export default function PageActions({ backHref = "/" }: Props) {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = backHref;
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <a
        href="/"
        aria-label="Accueil UNION"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-lg font-extrabold text-white shadow-sm transition hover:opacity-90"
      >
        U
      </a>

      <button
        type="button"
        onClick={goBack}
        aria-label="Retour"
        className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-extrabold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
      >
        ←
      </button>
    </div>
  );
}
