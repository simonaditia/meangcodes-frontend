import React from "react";
import { Link } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";

const animationSrc = "https://assets2.lottiefiles.com/packages/lf20_3vbOcw.json";

export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col items-center justify-center gap-6 text-center">
      <Player autoplay loop src={animationSrc} className="h-72 w-72 sm:h-80 sm:w-80" />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Error 404</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Halaman tidak ditemukan</h1>
        <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
          URL yang kamu buka tidak tersedia atau sudah dipindahkan. Kembali ke beranda untuk melanjutkan membaca artikel.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
      >
        Kembali ke Home
      </Link>
    </section>
  );
}
