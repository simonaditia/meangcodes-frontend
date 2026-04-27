import React from "react";
import { Link } from "react-router-dom";
import {
  createBuffer,
  deleteBuffer,
  fetchBuffers,
  runAutomation,
  updateBuffer,
} from "../services/articleService";

function splitReferences(raw) {
  return String(raw || "")
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function AutomationPage() {
  const [filter, setFilter] = React.useState("");
  const [buffers, setBuffers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [running, setRunning] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [error, setError] = React.useState("");
  const [form, setForm] = React.useState({
    titleHint: "",
    topic: "",
    references: "",
    priority: 100,
    notes: "",
  });

  const loadBuffers = React.useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await fetchBuffers(filter);
      setBuffers(data || []);
    } catch (err) {
      setError(err.message || "Gagal memuat menu bahan.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    loadBuffers();
  }, [loadBuffers]);

  async function handleCreate(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await createBuffer({
        titleHint: form.titleHint.trim(),
        topic: form.topic.trim(),
        references: splitReferences(form.references),
        priority: Number(form.priority) || 100,
        notes: form.notes.trim(),
      });

      setForm({
        titleHint: "",
        topic: "",
        references: "",
        priority: 100,
        notes: "",
      });
      setMessage("Bahan artikel berhasil ditambahkan.");
      await loadBuffers();
    } catch (err) {
      setError(err.message || "Gagal menambah bahan artikel.");
    }
  }

  async function handleRunAutomation() {
    setRunning(true);
    setMessage("");
    setError("");

    try {
      const result = await runAutomation();
      const slug = result?.article?.slug || "";
      const url = slug ? `/articles/${slug}` : "";
      setMessage(
        url
          ? `Automasi sukses (${result?.mode || "auto"}). Artikel baru: ${url}`
          : `Automasi sukses (${result?.mode || "auto"}).`
      );
      await loadBuffers();
    } catch (err) {
      setError(err.message || "Gagal menjalankan automasi.");
    } finally {
      setRunning(false);
    }
  }

  async function handleStatusChange(item, status) {
    setError("");

    try {
      await updateBuffer(item.id, { status });
      await loadBuffers();
    } catch (err) {
      setError(err.message || "Gagal mengubah status bahan.");
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus bahan \"${item.topic}\"?`)) {
      return;
    }

    setError("");

    try {
      await deleteBuffer(item.id);
      await loadBuffers();
    } catch (err) {
      setError(err.message || "Gagal menghapus bahan.");
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-serif-display text-3xl text-slate-900 dark:text-slate-100">Automation Studio</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Menu tampungan untuk bahan manual dan trigger agent otomatis (OpenRouter).
            </p>
          </div>

          <button
            type="button"
            onClick={handleRunAutomation}
            disabled={running}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {running ? "Menjalankan..." : "Jalankan Automasi"}
          </button>
        </div>

        {message ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr,1.4fr]">
        <form
          onSubmit={handleCreate}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
        >
          <h2 className="font-serif-display text-2xl text-slate-900 dark:text-slate-100">Tambah Bahan Manual</h2>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Judul Hint (opsional)</label>
            <input
              value={form.titleHint}
              onChange={(event) => setForm((prev) => ({ ...prev, titleHint: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-900"
              placeholder="Contoh: Memahami API Gateway"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Topik</label>
            <input
              required
              value={form.topic}
              onChange={(event) => setForm((prev) => ({ ...prev, topic: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-900"
              placeholder="Contoh: Perbedaan API Gateway vs Reverse Proxy"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Referensi URL (pisahkan newline atau koma)</label>
            <textarea
              required
              rows={5}
              value={form.references}
              onChange={(event) => setForm((prev) => ({ ...prev, references: event.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-900"
              placeholder="https://example.com/a\nhttps://example.com/b"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Priority</label>
              <input
                type="number"
                min={1}
                value={form.priority}
                onChange={(event) => setForm((prev) => ({ ...prev, priority: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-900"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">Catatan</label>
              <input
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-900"
                placeholder="Opsional"
              />
            </div>
          </div>

          <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white">
            Simpan ke Tampungan
          </button>
        </form>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-serif-display text-2xl text-slate-900 dark:text-slate-100">List Tampungan/Bahan</h2>
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-900"
            >
              <option value="">Semua status</option>
              <option value="queued">Queued</option>
              <option value="processed">Processed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {loading ? <p className="text-sm text-slate-500 dark:text-slate-400">Memuat data...</p> : null}

          {!loading && buffers.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Belum ada bahan. Saat kosong, automasi akan mencari topik trending otomatis.</p>
          ) : null}

          <div className="space-y-3">
            {buffers.map((item) => (
              <article key={item.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.titleHint || item.topic}</h3>
                  <span
                    className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                      item.status === "queued"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        : item.status === "processed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Topic: {item.topic}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Priority: {item.priority}</p>

                {Array.isArray(item.references) && item.references.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    {item.references.slice(0, 3).map((ref) => (
                      <li key={ref} className="truncate">
                        <a href={ref} target="_blank" rel="noreferrer" className="hover:text-emerald-700 dark:hover:text-emerald-300">
                          {ref}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item, "queued")}
                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Set Queued
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item, "processed")}
                    className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
                  >
                    Set Processed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleStatusChange(item, "failed")}
                    className="rounded-lg border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/30"
                  >
                    Set Failed
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-900/30"
                  >
                    Hapus
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-sm leading-7 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
        <p>
          Output artikel otomatis akan masuk ke daftar artikel aktif dan bisa dibuka di homepage. Untuk edit lanjutan, gunakan halaman
          {" "}
          <Link to="/articles/new" className="font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200">
            Write Article
          </Link>
          {" "}
          atau edit per slug.
        </p>
      </section>
    </div>
  );
}
