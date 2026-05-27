import { useEffect, useState } from "react";
import {
  fetchArticleBySlug,
  fetchRelatedArticles,
  getCachedArticleDetail,
} from "../services/articleService";

export function useArticleDetail(slug) {
  const cachedArticle = slug ? getCachedArticleDetail(slug) : null;
  const [article, setArticle] = useState(cachedArticle || null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(!cachedArticle);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    let mounted = true;
    const cached = getCachedArticleDetail(slug);

    if (cached) {
      setArticle(cached);
      setLoading(false);
    }

    async function loadArticle() {
      if (!cached) {
        setLoading(true);
        setError("");
      }

      try {
        const [data, related] = await Promise.all([fetchArticleBySlug(slug), fetchRelatedArticles(slug)]);
        if (mounted) {
          setArticle(data);
          setRelatedArticles(related || []);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load article");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadArticle();

    return () => {
      mounted = false;
    };
  }, [slug]);

  return { article, relatedArticles, loading, error };
}
