import React from "react";
import { Link } from "react-router-dom";

export default function TrendingList({ articles }) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Trending</h2>
      <ul className="mt-4 space-y-4">
        {articles.map((article, index) => (
          <li key={article.id} className="flex items-start gap-3">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {index + 1}
            </span>
            <div>
              <Link
                to={`/articles/${article.slug}`}
                className="line-clamp-2 text-sm font-medium text-slate-800 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-400"
              >
                {article.title}
              </Link>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{article.views} views</p>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
