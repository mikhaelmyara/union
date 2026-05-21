import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F8FC] p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 text-4xl font-extrabold text-white shadow-lg shadow-indigo-200">
        U
      </div>

      <h1 className="mt-8 text-6xl font-extrabold text-slate-950">404</h1>
      <p className="mt-3 text-xl font-bold text-slate-600">Page introuvable</p>
      <p className="mt-2 max-w-sm text-slate-400">
        Cette page n'existe pas ou a été déplacée.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white transition hover:bg-indigo-700"
        >
          Retour à l'accueil
        </Link>
        <Link
          href="/dashboard"
          className="rounded-xl bg-white px-6 py-3 font-bold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Mon dashboard
        </Link>
      </div>
    </main>
  );
}
