import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ActionToast from "../components/common/ActionToast";
import MarkdownContent from "../components/common/MarkdownContent";
import { useAuthRole } from "../hooks/useAuthRole";
import { useSeoMetadata } from "../hooks/useSeoMetadata";
import { deleteArticle } from "../services/articleService";
import { useArticleDetail } from "../hooks/useArticleDetail";

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthRole();
  const { article, relatedArticles, loading, error } = useArticleDetail(slug);
  const [deleting, setDeleting] = React.useState(false);
  const [actionError, setActionError] = React.useState("");
  const [toast, setToast] = React.useState(null);

  const tags = React.useMemo(() => {
    if (!article) {
      return [];
    }

    const base = `${article.title} ${article.category?.name || ""}`.toLowerCase();
    const cleaned = base.replace(/[^a-z0-9\s]/g, " ");
    const tokens = cleaned
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 6);

    return Array.from(new Set([article.category?.name, ...tokens])).filter(Boolean);
  }, [article]);

  const pageUrl = React.useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.href;
  }, [slug]);

  useSeoMetadata(
    article
      ? {
          title: `${article.title} | EduTech Portal`,
          description: article.content?.replace(/[#*_`>\[\]()!-]/g, " ").slice(0, 160),
          keywords: tags.join(", "),
          ogTitle: article.title,
          ogDescription: article.content?.replace(/[#*_`>\[\]()!-]/g, " ").slice(0, 200),
          url: pageUrl,
          image: article.thumbnail,
          structuredData: {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            image: article.thumbnail ? [article.thumbnail] : [],
            datePublished: article.createdAt,
            dateModified: article.updatedAt || article.createdAt,
            author: {
              "@type": "Person",
              name: article.author?.name || "Unknown Author",
            },
            keywords: tags,
          },
        }
      : null
  );

  async function handleDelete() {
    if (!slug || deleting) {
      return;
    }

    const confirmed = window.confirm("Hapus artikel ini? Artikel tidak akan dihapus permanen dan hanya ditandai deleted_at.");
    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setActionError("");

    try {
      await deleteArticle(slug);
      setToast({ type: "success", message: "Artikel ditandai deleted_at dan dipindahkan dari daftar aktif." });
      setTimeout(() => {
        navigate("/");
      }, 850);
    } catch (err) {
      const message = err.message || "Gagal menghapus artikel.";
      setActionError(message);
      setToast({ type: "error", message });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        Memuat artikel...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
        <p>{error}</p>
        <Link to="/" className="inline-flex rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-800">
          Kembali ke Homepage
        </Link>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <img
          src={article.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
          alt={article.title}
          className="h-64 w-full rounded-t-2xl object-cover"
        />

        <div className="space-y-6 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            {article.category?.name || "Technology"}
          </p>

          <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-slate-100">{article.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>By {article.author?.name || "Unknown Author"}</span>
            <span>{article.readTime} min read</span>
            <span>{article.views} views</span>
          </div>

          {isAdmin ? (
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to={`/articles/${article.slug}/edit`}
                className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/40"
              >
                Edit Article
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-rose-700 dark:text-rose-300 dark:hover:bg-rose-950/40"
              >
                {deleting ? "Menghapus..." : "Delete Article"}
              </button>
              <span className="text-xs text-slate-500 dark:text-slate-400">Delete menggunakan soft delete (deleted_at).</span>
            </div>
          ) : null}

          {actionError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{actionError}</p> : null}

          <div className="text-base leading-8 text-slate-700 dark:text-slate-200">
            <MarkdownContent content={article.content} className="markdown-content" />
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-300">Share</h3>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <a
                href={`https://twitter.com/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Facebook
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Tentang Penulis</h2>
            <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-200">{article.author?.name || "Unknown Author"}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{article.author?.bio || "Bio penulis belum tersedia."}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Kategori</h2>
            <p className="mt-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
              {article.category?.name || "Technology"}
            </p>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              {article.category?.description || "Kategori ini memuat insight dan praktik terbaik dunia teknologi."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Related Articles</h2>
            {relatedArticles.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Belum ada artikel terkait.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {relatedArticles.map((item) => (
                  <li key={item.id}>
                    <Link to={`/articles/${item.slug}`} className="text-sm font-medium text-slate-800 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-300">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.readTime} min read • {item.views} views</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <ActionToast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
