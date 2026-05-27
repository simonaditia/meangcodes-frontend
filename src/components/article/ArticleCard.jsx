import React from "react";
import { Link } from "react-router-dom";
import { fetchArticleBySlug } from "../../services/articleService";

const _prefetched = new Set();

export function prefetchArticle(slug, thumbnail) {
  if (!slug || _prefetched.has(slug)) return;
  _prefetched.add(slug);

  try {
    fetchArticleBySlug(slug).catch(() => {});
  } catch {}

  if (thumbnail) {
    try {
      const img = new Image();
      img.src = thumbnail;
    } catch {}
  }
}

const FALLBACK_THUMBNAIL = "https://picsum.photos/seed/meangcodes-thumb/1200/630";

export default function ArticleCard({ article }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <img
        src={article.thumbnail || FALLBACK_THUMBNAIL}
        alt={article.title}
        className="h-48 w-full object-cover"
        loading="lazy"
        onError={(event) => {
          event.currentTarget.src = FALLBACK_THUMBNAIL;
        }}
      />
      <div className="space-y-3 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">
          {article.category?.name || "Technology"}
        </p>
        <h3 className="font-serif-display line-clamp-2 text-2xl leading-snug text-slate-900 dark:text-slate-100">
          <Link
            to={`/articles/${article.slug}`}
            className="hover:text-emerald-600 dark:hover:text-emerald-400"
            onMouseEnter={() => prefetchArticle(article.slug, article.thumbnail)}
            onFocus={() => prefetchArticle(article.slug, article.thumbnail)}
            onTouchStart={() => prefetchArticle(article.slug, article.thumbnail)}
          >
            {article.title}
          </Link>
        </h3>
        <div className="flex items-center justify-between text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <span>{article.author?.name || "Unknown Author"}</span>
          <span>{article.readTime} min read</span>
        </div>
      </div>
    </article>
  );
}
