import { useEffect, useState } from "react";
import { fetchArticleBySlug, fetchRelatedArticles } from "../services/articleService";

export function useArticleDetail(slug) {
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) {
      return;
    }

    let mounted = true;

    async function loadArticle() {
      setLoading(true);
      setError("");

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
