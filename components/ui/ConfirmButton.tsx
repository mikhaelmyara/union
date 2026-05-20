"use client";

import { useState } from "react";

type Props = {
  children: React.ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  className?: string;
  onConfirm: () => void | Promise<void>;
};

export default function ConfirmButton({
  children,
  title,
  description,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  className,
  onConfirm,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setOpen(false);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-2xl font-extrabold text-slate-950">{title}</h3>
            <p className="mt-2 text-slate-500">{description}</p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-white px-5 py-3 font-bold text-slate-600 ring-1 ring-slate-200"
              >
                {cancelLabel}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className="rounded-xl bg-red-600 px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? "Suppression..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
