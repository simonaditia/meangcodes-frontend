import React from "react";
import { Link } from "react-router-dom";

export default function ArticleCard({ article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <img
        src={article.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
        alt={article.title}
        className="h-44 w-full object-cover"
        loading="lazy"
      />
      <div className="space-y-3 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
          {article.category?.name || "Technology"}
        </p>
        <h3 className="line-clamp-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
          <Link to={`/articles/${article.slug}`} className="hover:text-emerald-600 dark:hover:text-emerald-400">
            {article.title}
          </Link>
        </h3>
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{article.author?.name || "Unknown Author"}</span>
          <span>{article.readTime} min read</span>
        </div>
      </div>
    </article>
  );
}
