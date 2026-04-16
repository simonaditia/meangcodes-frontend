import React from "react";
import { Link, useParams } from "react-router-dom";
import ArticleGrid from "../components/article/ArticleGrid";
import { useArticles } from "../hooks/useArticles";
import { fetchCategories } from "../services/articleService";

export default function CategoryPage() {
  const { slug } = useParams();
  const [currentPage, setCurrentPage] = React.useState(1);
  const [searchInput, setSearchInput] = React.useState("");
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [categoryName, setCategoryName] = React.useState(slug || "Kategori");

  const { articles, pagination, loading, error } = useArticles({
    page: currentPage,
    limit: 9,
    search: searchKeyword,
    category: slug,
  });

  React.useEffect(() => {
    let mounted = true;

    async function loadCategoryName() {
      try {
        const categories = await fetchCategories();
        if (!mounted) {
          return;
        }

        const found = (categories || []).find((category) => category.slug === slug);
        setCategoryName(found?.name || slug || "Kategori");
      } catch {
        if (mounted) {
          setCategoryName(slug || "Kategori");
        }
      }
    }

    loadCategoryName();
    return () => {
      mounted = false;
    };
  }, [slug]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [slug]);

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Kategori</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{categoryName}</h1>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            setCurrentPage(1);
            setSearchKeyword(searchInput.trim());
          }}
          className="mt-4 flex flex-wrap items-center gap-2"
        >
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={`Cari artikel di ${categoryName}...`}
            className="min-w-[240px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
          />
          <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchInput("");
              setSearchKeyword("");
              setCurrentPage(1);
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Reset
          </button>
        </form>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Memuat artikel kategori...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <>
          <ArticleGrid articles={articles} />

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
            <span className="text-slate-600 dark:text-slate-300">
              Halaman {pagination.page} dari {pagination.totalPages} • {pagination.totalItems || articles.length} artikel
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={!pagination.hasPrev}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!pagination.hasNext}
                className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:text-slate-200"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : null}

      <div>
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200">
          ← Kembali ke Home
        </Link>
      </div>
    </section>
  );
}
