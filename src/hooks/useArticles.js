import { useEffect, useMemo, useState } from "react";
import { fetchArticles, getCachedArticleList } from "../services/articleService";

export function useArticles(options = {}) {
  const cachedResult = getCachedArticleList(options);
  const [articles, setArticles] = useState(cachedResult?.data || []);
  const [pagination, setPagination] = useState(
    cachedResult?.pagination || {
      page: 1,
      limit: 12,
      totalItems: 0,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    }
  );
  const [loading, setLoading] = useState(!cachedResult);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const cached = getCachedArticleList(options);

    if (cached) {
      setArticles(cached.data || []);
      setPagination(cached.pagination || {
        page: 1,
        limit: 12,
        totalItems: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
      setLoading(false);
    }

    async function loadArticles() {
      if (!cached) {
        setLoading(true);
        setError("");
      }

      try {
        const result = await fetchArticles(options);
        if (mounted) {
          setArticles(result.data || []);
          setPagination(result.pagination || {
            page: 1,
            limit: 12,
            totalItems: 0,
            totalPages: 1,
            hasNext: false,
            hasPrev: false,
          });
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load articles");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadArticles();

    return () => {
      mounted = false;
    };
  }, [options.category, options.limit, options.page, options.search]);

  const trendingArticles = useMemo(() => {
    return [...articles].sort((a, b) => b.views - a.views).slice(0, 4);
  }, [articles]);

  return { articles, trendingArticles, pagination, loading, error };
}
