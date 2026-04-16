import { useEffect, useMemo, useState } from "react";
import { fetchArticles } from "../services/articleService";

export function useArticles(options = {}) {
  const [articles, setArticles] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    totalItems: 0,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadArticles() {
      setLoading(true);
      setError("");

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
