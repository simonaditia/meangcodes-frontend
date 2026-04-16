import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { Link, NavLink } from "react-router-dom";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-700/80 dark:bg-slate-900/90">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100" to="/">
          EduTech Portal
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          <li>
            <NavLink className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white" to="/">
              Home
            </NavLink>
          </li>
          <li>
            <a className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white" href="/#trending">
              Trending
            </a>
          </li>
          <li>
            <NavLink className="text-sm font-medium text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white" to="/categories/programming">
              Categories
            </NavLink>
          </li>
          {isAdmin ? (
            <li>
              <NavLink className="text-sm font-medium text-emerald-700 hover:text-emerald-800 dark:text-emerald-300 dark:hover:text-emerald-200" to="/articles/new">
                Write Article
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
                className="rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 dark:border-rose-700 dark:bg-slate-900 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              Login
            </Link>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
          </button>
        </div>
      </nav>
    </header>
  );
}
