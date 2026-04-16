import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ActionToast from "../components/common/ActionToast";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      setToast({ type: "success", message: "Login berhasil. Selamat menulis!" });
      const redirectTo = location.state?.from || "/";
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 700);
    } catch (err) {
      const message = err.message || "Login gagal.";
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-md space-y-6">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Secure Access</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Login Admin</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Gunakan akun admin dari backend environment untuk mengelola artikel.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
            placeholder="admin@example.com"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
            placeholder="••••••••"
            required
          />
        </label>

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error}</p> : null}

        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100">
            Kembali ke Home
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Memproses..." : "Login"}
          </button>
        </div>
      </form>

      <ActionToast toast={toast} onClose={() => setToast(null)} />
    </section>
  );
}
