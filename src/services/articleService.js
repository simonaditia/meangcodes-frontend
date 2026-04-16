import { API_BASE_URL, apiDelete, apiGet, apiPatch, apiPost, apiPostFormData } from "./api";

function joinUrl(base, path) {
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function fetchArticles(options = {}) {
  const params = new URLSearchParams();
  if (options.page) {
    params.set("page", String(options.page));
  }
  if (options.limit) {
    params.set("limit", String(options.limit));
  }
  if (options.search) {
    params.set("search", String(options.search));
  }
  if (options.category) {
    params.set("category", String(options.category));
  }

  const query = params.toString();
  const result = await apiGet(`/api/articles${query ? `?${query}` : ""}`);
  return {
    data: result.data || [],
    pagination: result.pagination || {
      page: 1,
      limit: options.limit || 12,
      totalItems: (result.data || []).length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export async function fetchLatestArticles() {
  const result = await fetchArticles();
  return result.data;
}

export async function fetchArticleBySlug(slug) {
  const result = await apiGet(`/api/articles/${slug}`);
  return result.data;
}

export async function fetchRelatedArticles(slug, limit = 4) {
  const result = await apiGet(`/api/articles/${slug}/related?limit=${limit}`);
  return result.data || [];
}

export async function fetchCategories() {
  const result = await apiGet("/api/categories");
  return result.data || [];
}

export async function fetchAuthors() {
  const result = await apiGet("/api/authors");
  return result.data || [];
}

export async function createArticle(payload) {
  const result = await apiPost("/api/articles", payload);
  return result.data;
}

export async function updateArticle(slug, payload) {
  const result = await apiPatch(`/api/articles/${slug}`, payload);
  return result.data;
}

export async function deleteArticle(slug) {
  const result = await apiDelete(`/api/articles/${slug}`);
  return result;
}

export async function uploadImage(file) {
  const attempts = ["/api/uploads", "/uploads"];
  let lastError = null;

  for (const endpoint of attempts) {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const result = await apiPostFormData(endpoint, formData);
      const data = result.data || {};
      if (data.url) {
        return data.url;
      }
      if (data.path) {
        return joinUrl(API_BASE_URL, data.path);
      }

      throw new Error("Upload berhasil tetapi URL gambar tidak tersedia.");
    } catch (error) {
      lastError = error;

      if (!String(error?.message || "").includes("404") || endpoint === "/uploads") {
        throw error;
      }
    }
  }

  throw lastError || new Error("Gagal upload image.");
}

export async function deleteUploadedImage(urlOrPath) {
  const result = await apiDelete("/api/uploads", {
    url: urlOrPath,
    path: urlOrPath,
  });

  return result;
}
