import React, { useEffect, useRef } from "react";
import ArticleCard from "./ArticleCard";
import { prefetchArticle as prefetchArticleUtil } from "./ArticleCard";

export default function ArticleGrid({ articles }) {
  if (!articles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Belum ada artikel tersedia.
      </div>
    );
  }

  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const slug = el.getAttribute("data-article-slug");
            const thumb = el.getAttribute("data-article-thumb");
            if (slug) prefetchArticleUtil(slug, thumb);
            observer.unobserve(el);
          }
        });
      },
      { rootMargin: "200px" }
    );

    const cards = containerRef.current.querySelectorAll("[data-article-slug]");
    cards.forEach((c) => observer.observe(c));

    return () => observer.disconnect();
  }, [articles]);

  return (
    <div ref={containerRef} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {articles.map((article) => (
        <div key={article.id} data-article-slug={article.slug} data-article-thumb={article.thumbnail}>
          <ArticleCard article={article} />
        </div>
      ))}
    </div>
  );
}
