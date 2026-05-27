import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ActionToast from "../components/common/ActionToast";
import MarkdownContent from "../components/common/MarkdownContent";
import { useAuthRole } from "../hooks/useAuthRole";
import { useSeoMetadata } from "../hooks/useSeoMetadata";
import { deleteArticle } from "../services/articleService";
import { useArticleDetail } from "../hooks/useArticleDetail";

const FALLBACK_THUMBNAIL = "https://picsum.photos/seed/meangcodes-detail/1200/630";

function slugifyHeading(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatDate(value) {
  if (!value) {
    return "Baru saja";
  }

  try {
    return new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
    }).format(new Date(value));
  } catch {
    return "Baru saja";
  }
}

export default function ArticleDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuthRole();
  const { article, relatedArticles, loading, error } = useArticleDetail(slug);
  const [deleting, setDeleting] = React.useState(false);
  const [actionError, setActionError] = React.useState("");
  const [toast, setToast] = React.useState(null);
  const [tocItems, setTocItems] = React.useState([]);
  const contentRef = React.useRef(null);

  const tags = React.useMemo(() => {
    if (!article) {
      return [];
    }

    const source = `${article.title} ${article.category?.name || ""}`.toLowerCase();
    const words = source
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 8);

    return Array.from(new Set([article.category?.name, ...words])).filter(Boolean);
  }, [article]);

  const pageUrl = React.useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return window.location.href;
  }, [slug]);

  React.useEffect(() => {
    const container = contentRef.current;
    if (!container) {
      setTocItems([]);
      return;
    }

    const headings = Array.from(container.querySelectorAll("h2, h3")).map((heading) => ({
      depth: Number(heading.tagName.slice(1)),
      text: heading.textContent?.trim() || "",
      id: heading.id,
    }));

    setTocItems(headings.filter((item) => item.text && item.id));
  }, [article?.content]);

  const sameAuthorArticles = React.useMemo(() => {
    return (relatedArticles || []).filter((entry) => entry.authorId === article?.authorId).slice(0, 3);
  }, [relatedArticles, article?.authorId]);

  useSeoMetadata(
    article
      ? {
          title: `${article.title} | MeangCodes`,
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
      }, 800);
    } catch (err) {
      const message = err.message || "Gagal menghapus artikel.";
      setActionError(message);
      setToast({ type: "error", message });
    } finally {
      setDeleting(false);
    }
  }

  function jumpToToc(id) {
    const target = contentRef.current?.querySelector(`#${CSS.escape(id)}`) || document.getElementById(id);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setToast({ type: "success", message: "Link artikel disalin." });
    } catch {
      setToast({ type: "error", message: "Gagal menyalin link artikel." });
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
      <div className="grid gap-6 xl:grid-cols-[72px,minmax(0,1fr),350px]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Share</p>
            <div className="mt-3 space-y-2">
              <a
                href={`https://twitter.com/share?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-100 dark:hover:text-white"
              >
                X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-100 dark:hover:text-white"
              >
                FB
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-slate-300 px-2 py-2 text-center text-xs font-semibold text-slate-700 hover:border-slate-900 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-100 dark:hover:text-white"
              >
                IN
              </a>
              <button
                type="button"
                onClick={copyLink}
                className="w-full rounded-xl border border-emerald-300 bg-emerald-50 px-2 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900/35"
              >
                Copy
              </button>
            </div>
          </div>
        </aside>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <img
            src={article.thumbnail || FALLBACK_THUMBNAIL}
            alt={article.title}
            className="h-64 w-full object-cover sm:h-80"
            onError={(event) => {
              event.currentTarget.src = FALLBACK_THUMBNAIL;
            }}
          />

          <div className="space-y-6 p-6 sm:p-8">
            <div className="space-y-3">
              <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {article.category?.name || "Technology"}
              </p>
              <h1 className="font-serif-display text-3xl leading-tight text-slate-900 dark:text-slate-100 sm:text-4xl">{article.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <span>By {article.author?.name || "Unknown Author"}</span>
                <span>{article.readTime} min read</span>
                <span>{article.views} views</span>
                <span>{formatDate(article.createdAt)}</span>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/40">
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
              </div>
            ) : null}

            {actionError ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{actionError}</p> : null}

            <div ref={contentRef} className="text-base leading-8 text-slate-700 dark:text-slate-200">
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
          </div>
        </article>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Table of Contents</h2>
            {tocItems.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Struktur heading belum tersedia untuk artikel ini.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {tocItems.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        jumpToToc(item.id);
                      }}
                      className={`block w-full text-left text-sm leading-6 text-slate-700 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-300 ${
                        item.depth === 3 ? "pl-4 text-slate-500 dark:text-slate-400" : ""
                      }`}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">About The Author</h2>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700 dark:bg-emerald-900/35 dark:text-emerald-300">
                {(article.author?.name || "A").slice(0, 1).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{article.author?.name || "Unknown Author"}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active contributor</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{article.author?.bio || "Bio penulis belum tersedia."}</p>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70">
                <dt className="text-slate-500 dark:text-slate-400">Published</dt>
                <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{formatDate(article.createdAt)}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/70">
                <dt className="text-slate-500 dark:text-slate-400">Reading Time</dt>
                <dd className="mt-1 font-semibold text-slate-800 dark:text-slate-100">{article.readTime} min</dd>
              </div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(0, 4).map((tag) => (
                <span key={tag} className="rounded-full border border-slate-300 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {tag}
                </span>
              ))}
            </div>

            {sameAuthorArticles.length > 0 ? (
              <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">More by this author</p>
                <ul className="mt-2 space-y-2">
                  {sameAuthorArticles.map((item) => (
                    <li key={item.id}>
                      <Link to={`/articles/${item.slug}`} className="text-sm font-medium text-slate-800 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-300">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-300">Related Articles</h2>
            {relatedArticles.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Belum ada artikel terkait.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {relatedArticles.map((item) => (
                  <li key={item.id}>
                    <Link to={`/articles/${item.slug}`} className="text-sm font-medium text-slate-800 hover:text-emerald-600 dark:text-slate-200 dark:hover:text-emerald-300">
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.readTime} min read | {item.views} views</p>
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
