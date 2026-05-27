import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoMeangCodes from "../../assets/logomeangcodes.png";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  const navigate = useNavigate();

  function handleLogoClick(e) {
    e.preventDefault();
    try {
      if (window?.history && window.history.length > 1) {
        navigate(-1);
        return;
      }
    } catch {}

    navigate("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/90 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-950/90">
      <nav className="mx-auto flex w-full max-w-[1320px] items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="/" onClick={handleLogoClick} className="flex items-center gap-3" aria-label="MeangCodes home">
          <img
            src={logoMeangCodes}
            alt="MeangCodes logo"
            className="h-10 w-10 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
          />
          <span className="font-serif-display text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            MeangCodes
          </span>
        </a>

        <ul className="hidden items-center gap-6 md:flex">
          <li>
            <NavLink className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" to="/">
              Home
            </NavLink>
          </li>
          <li>
            <a className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" href="/#trending">
              Trending
            </a>
          </li>
          <li>
            <NavLink className="text-xs font-semibold uppercase tracking-[0.13em] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white" to="/categories/programming">
              Categories
            </NavLink>
          </li>
          {isAdmin ? (
            <li>
              <NavLink className="text-xs font-semibold uppercase tracking-[0.13em] text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200" to="/articles/new">
                Write Article
              </NavLink>
            </li>
          ) : null}
          {isAdmin ? (
            <li>
              <NavLink className="text-xs font-semibold uppercase tracking-[0.13em] text-amber-700 hover:text-amber-800 dark:text-amber-300 dark:hover:text-amber-200" to="/automation">
                Automation
              </NavLink>
            </li>
          ) : null}
        </ul>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <span className="hidden text-xs font-medium text-slate-500 dark:text-slate-300 sm:inline">{user?.email || "admin"}</span>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-rose-700 transition hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>
        </div>
      </nav>
    </header>
  );
}
