import React from "react";
import { Link } from "react-router-dom";
import ArticleGrid from "../components/article/ArticleGrid";
import TrendingList from "../components/article/TrendingList";
import { fetchCategories } from "../services/articleService";
import { useArticles } from "../hooks/useArticles";

export default function HomePage() {
  const [searchInput, setSearchInput] = React.useState("");
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [categories, setCategories] = React.useState([]);

  const { articles, trendingArticles, pagination, loading, error } = useArticles({
    page: currentPage,
    limit: 9,
    search: searchKeyword,
    category: selectedCategory,
  });

  React.useEffect(() => {
    let mounted = true;

    async function loadCategories() {
      try {
        const data = await fetchCategories();
        if (mounted) {
          setCategories(data || []);
        }
      } catch {
        if (mounted) {
          setCategories([]);
        }
      }
    }

    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  function applyFilters(event) {
    event.preventDefault();
    setCurrentPage(1);
    setSearchKeyword(searchInput.trim());
  }

  function resetFilters() {
    setSearchInput("");
    setSearchKeyword("");
    setSelectedCategory("");
    setCurrentPage(1);
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-8 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">EduTech Digest</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Insight terbaru teknologi, coding, dan security untuk developer modern
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
          Portal edukasi dan blog teknologi dengan konten terbaru yang nyaman dibaca dan mudah dijelajahi.
        </p>

        <form onSubmit={applyFilters} className="mt-6 grid gap-3 rounded-xl border border-emerald-200 bg-white/80 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 md:grid-cols-[1.3fr,0.8fr,auto,auto]">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari artikel..."
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
          />
          <select
            value={selectedCategory}
            onChange={(event) => {
              setSelectedCategory(event.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-800"
          >
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">
            Search
          </button>
          <button type="button" onClick={resetFilters} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800">
            Reset
          </button>
        </form>
      </section>

      {categories.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Kategori Populer</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-600 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Memuat artikel...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-6 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <section className="grid gap-8 lg:grid-cols-[1.6fr,0.8fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Artikel Terbaru</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400">{pagination.totalItems || articles.length} artikel</span>
            </div>
            <ArticleGrid articles={articles} />

            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900">
              <span className="text-slate-600 dark:text-slate-300">
                Halaman {pagination.page} dari {pagination.totalPages}
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
          </div>

          <div id="trending" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Paling Populer</h2>
            <TrendingList articles={trendingArticles} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
