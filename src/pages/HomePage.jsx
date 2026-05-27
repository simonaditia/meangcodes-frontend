import React from "react";
import { Link } from "react-router-dom";
import ArticleGrid from "../components/article/ArticleGrid";
import { fetchHomepageBundle, getCachedHomepageBundle } from "../services/articleService";

export default function HomePage() {
  const [searchInput, setSearchInput] = React.useState("");
  const [searchKeyword, setSearchKeyword] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const homepageOptions = React.useMemo(
    () => ({
      page: currentPage,
      limit: 9,
      search: searchKeyword,
      category: selectedCategory,
      trendingLimit: 7,
      trendingDays: 45,
      sectionCategoryLimit: 3,
      sectionArticleLimit: 4,
    }),
    [currentPage, searchKeyword, selectedCategory]
  );
  const cachedBundle = getCachedHomepageBundle(homepageOptions);
  const [articles, setArticles] = React.useState(cachedBundle?.latest || []);
  const [pagination, setPagination] = React.useState(
    cachedBundle?.pagination || {
      page: 1,
      limit: 9,
      totalItems: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    }
  );
  const [categories, setCategories] = React.useState(cachedBundle?.categories || []);
  const [trendingGlobal, setTrendingGlobal] = React.useState(cachedBundle?.trending || []);
  const [categorySections, setCategorySections] = React.useState(cachedBundle?.sections || []);
  const [featuredArticle, setFeaturedArticle] = React.useState(cachedBundle?.featured || null);
  const [loading, setLoading] = React.useState(!cachedBundle);
  const [error, setError] = React.useState("");
  const [portalError, setPortalError] = React.useState("");
  const [portalLoading, setPortalLoading] = React.useState(!cachedBundle);

  React.useEffect(() => {
    let mounted = true;
    const cached = getCachedHomepageBundle(homepageOptions);

    if (cached) {
      setArticles(cached.latest || []);
      setPagination(cached.pagination || {
        page: 1,
        limit: 9,
        totalItems: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      setCategories(cached.categories || []);
      setTrendingGlobal(cached.trending || []);
      setCategorySections(cached.sections || []);
      setFeaturedArticle(cached.featured || null);
      setLoading(false);
      setPortalLoading(false);
    }

    async function loadPortalData() {
      if (!cached) {
        setLoading(true);
        setError("");
        setPortalLoading(true);
        setPortalError("");
      }

      try {
        const bundle = await fetchHomepageBundle(homepageOptions);

        if (mounted) {
          setArticles(bundle.latest || []);
          setPagination(bundle.pagination || {
            page: 1,
            limit: 9,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          });
          setCategories(bundle.categories || []);
          setTrendingGlobal(bundle.trending || []);
          setCategorySections(bundle.sections || []);
          setFeaturedArticle(bundle.featured || bundle.trending?.[0] || bundle.latest?.[0] || null);
        }
      } catch {
        if (mounted) {
          setError("Gagal memuat artikel homepage.");
          setPortalError("Gagal memuat data portal.");
          setArticles([]);
          setPagination({
            page: 1,
            limit: 9,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          });
          setCategories([]);
          setTrendingGlobal([]);
          setCategorySections([]);
          setFeaturedArticle(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setPortalLoading(false);
        }
      }
    }

    loadPortalData();
    return () => {
      mounted = false;
    };
  }, [homepageOptions]);

  const compactTrending = React.useMemo(() => {
    return (trendingGlobal || []).slice(1, 7);
  }, [trendingGlobal]);

  function articleExcerpt(content) {
    if (!content) {
      return "Baca insight terbaru seputar engineering, software architecture, dan praktik terbaik pengembangan modern.";
    }

    return content.replace(/[#*_`>\[\]()!-]/g, " ").replace(/\s+/g, " ").trim().slice(0, 190);
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
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="pointer-events-none absolute -top-36 right-[-80px] h-72 w-72 rounded-full bg-amber-200/40 blur-3xl dark:bg-amber-500/15" />
        <div className="pointer-events-none absolute -bottom-36 left-[-60px] h-72 w-72 rounded-full bg-sky-200/35 blur-3xl dark:bg-sky-500/15" />

        <div className="relative grid gap-8 lg:grid-cols-[1.5fr,1fr]">
          <div className="space-y-4">
            <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              Tech Bulletin
            </p>
            <h1 className="font-serif-display text-4xl leading-tight text-slate-900 dark:text-slate-100 sm:text-5xl">
              Portal edukasi coding dengan ritme baca seperti majalah teknologi
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
              Kurasi artikel terbaru, konten paling ramai dibaca, dan kategori yang terus diperbarui untuk menjaga flow eksplorasi pembaca tetap nyaman.
            </p>

            {featuredArticle ? (
              <Link
                to={`/articles/${featuredArticle.slug}`}
                className="group mt-6 block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-950/40"
              >
                <img
                  src={featuredArticle.thumbnail || "https://images.unsplash.com/photo-1498050108023-c5249f4df085"}
                  alt={featuredArticle.title}
                  className="h-64 w-full object-cover sm:h-72"
                />
                <div className="space-y-3 p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700 dark:text-emerald-300">
                    Sorotan Utama
                  </p>
                  <h2 className="font-serif-display text-2xl leading-snug text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-300">
                    {featuredArticle.title}
                  </h2>
                  <p className="line-clamp-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{articleExcerpt(featuredArticle.content)}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <span>{featuredArticle.category?.name || "Technology"}</span>
                    <span>{featuredArticle.readTime} min read</span>
                    <span>{featuredArticle.views} views</span>
                    <span>{formatDate(featuredArticle.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ) : null}
          </div>

          <div className="space-y-5">
            <form
              onSubmit={applyFilters}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/40"
            >
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">Article Search</h3>
              <div className="mt-3 space-y-2">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Cari judul atau topik..."
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-900"
                />
                <select
                  value={selectedCategory}
                  onChange={(event) => {
                    setSelectedCategory(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring dark:border-slate-600 dark:bg-slate-900"
                >
                  <option value="">Semua kategori</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.slug}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <button type="submit" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white">
                    Apply
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>

            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">Trending Dispatch</h3>
              {compactTrending.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Belum ada artikel trending.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {compactTrending.map((article, index) => (
                    <li key={article.id} className="flex items-start gap-3">
                      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white dark:bg-slate-100 dark:text-slate-900">
                        {index + 1}
                      </span>
                      <div className="space-y-1">
                        <Link
                          to={`/articles/${article.slug}`}
                          className="line-clamp-2 text-sm font-semibold leading-6 text-slate-800 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-300"
                        >
                          {article.title}
                        </Link>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                          {article.views} views • {formatDate(article.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-display text-2xl text-slate-900 dark:text-slate-100">Trending Categories</h2>
            <Link to="/categories/programming" className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200">
              Explore
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                to={`/categories/${category.slug}`}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300"
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
        <section className="grid gap-8 lg:grid-cols-[1.65fr,0.85fr]">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-display text-3xl text-slate-900 dark:text-slate-100">Latest Articles</h2>
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {pagination.totalItems || articles.length} artikel
              </span>
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
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h2 className="font-serif-display text-2xl text-slate-900 dark:text-slate-100">Portal Widgets</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                Lanjutkan eksplorasi melalui artikel terkurasi, kategori populer, dan daftar bacaan cepat.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">Latest By Category</h3>
              {portalLoading ? (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Memuat section kategori...</p>
              ) : null}
              {portalError ? <p className="mt-3 text-sm text-rose-600 dark:text-rose-300">{portalError}</p> : null}
              <div className="mt-3 space-y-4">
                {categorySections.map((section) => (
                  <div key={section.category.id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                    <div className="mb-2 flex items-center justify-between">
                      <Link
                        to={`/categories/${section.category.slug}`}
                        className="text-sm font-semibold uppercase tracking-wide text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
                      >
                        {section.category.name}
                      </Link>
                    </div>
                    <ul className="space-y-2">
                      {section.articles.slice(0, 3).map((article) => (
                        <li key={article.id}>
                          <Link
                            to={`/articles/${article.slug}`}
                            className="line-clamp-2 text-sm font-medium leading-6 text-slate-800 hover:text-emerald-700 dark:text-slate-200 dark:hover:text-emerald-300"
                          >
                            {article.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-700 dark:text-slate-300">Follow Topics</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {categories.slice(0, 8).map((category) => (
                  <Link
                    key={category.id}
                    to={`/categories/${category.slug}`}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-900/40 dark:hover:text-emerald-200"
                  >
                    #{category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
