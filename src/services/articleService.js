import { API_BASE_URL, apiDelete, apiGet, apiPatch, apiPost, apiPostFormData } from "./api";

const CACHE_TTL_MS = 2 * 60 * 1000;
const CACHE_STORAGE_PREFIX = "meangcodes:article-cache:";

const homepageBundleCache = new Map();
const articleDetailCache = new Map();
const articleListCache = new Map();

function getSessionStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.sessionStorage || null;
  } catch {
    return null;
  }
}

function createCacheKey(prefix, payload = {}) {
  return `${prefix}:${JSON.stringify(payload)}`;
}

function createStorageKey(cacheKey) {
  return `${CACHE_STORAGE_PREFIX}${cacheKey}`;
}

function readCacheEntry(cache, key) {
  const entry = cache.get(key);
  if (!entry) {
    const storage = getSessionStorage();
    if (!storage) {
      return null;
    }

    try {
      const raw = storage.getItem(createStorageKey(key));
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || typeof parsed.expiresAt !== "number") {
        storage.removeItem(createStorageKey(key));
        return null;
      }

      if (Date.now() > parsed.expiresAt) {
        storage.removeItem(createStorageKey(key));
        return null;
      }

      cache.set(key, parsed);
      return parsed.value;
    } catch {
      return null;
    }
  }

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    const storage = getSessionStorage();
    try {
      storage?.removeItem(createStorageKey(key));
    } catch {
      // Ignore storage cleanup failures.
    }
    return null;
  }

  return entry.value;
}

function writeCacheEntry(cache, key, value, ttl = CACHE_TTL_MS) {
  const entry = {
    value,
    expiresAt: Date.now() + ttl,
  };

  cache.set(key, entry);

  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(createStorageKey(key), JSON.stringify(entry));
  } catch {
    // Ignore quota and private mode failures.
  }
}

function clearArticleCaches() {
  homepageBundleCache.clear();
  articleDetailCache.clear();
  articleListCache.clear();

  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  try {
    const keysToRemove = [];
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith(CACHE_STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => storage.removeItem(key));
  } catch {
    // Ignore storage cleanup failures.
  }
}

export function getCachedHomepageBundle(options = {}) {
  return readCacheEntry(homepageBundleCache, createCacheKey("homepage-bundle", options));
}

export function setCachedHomepageBundle(options = {}, value) {
  writeCacheEntry(homepageBundleCache, createCacheKey("homepage-bundle", options), value);
}

export function getCachedArticleDetail(slug) {
  return readCacheEntry(articleDetailCache, createCacheKey("article-detail", { slug }));
}

export function setCachedArticleDetail(slug, value) {
  writeCacheEntry(articleDetailCache, createCacheKey("article-detail", { slug }), value);
}

export function getCachedArticleList(options = {}) {
  return readCacheEntry(articleListCache, createCacheKey("article-list", options));
}

export function setCachedArticleList(options = {}, value) {
  writeCacheEntry(articleListCache, createCacheKey("article-list", options), value);
}

function joinUrl(base, path) {
  return `${base.replace(/\/$/, "")}${path}`;
}

export async function fetchArticles(options = {}) {
  const cached = getCachedArticleList(options);
  if (cached) {
    return cached;
  }

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
  const value = {
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

  setCachedArticleList(options, value);
  return value;
}

export async function fetchLatestArticles() {
  const result = await fetchArticles();
  return result.data;
}

export async function fetchHomepageBundle(options = {}) {
  const cached = getCachedHomepageBundle(options);
  if (cached) {
    return cached;
  }

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
  if (options.trendingLimit) {
    params.set("trendingLimit", String(options.trendingLimit));
  }
  if (options.trendingDays) {
    params.set("trendingDays", String(options.trendingDays));
  }
  if (options.sectionCategoryLimit) {
    params.set("sectionCategoryLimit", String(options.sectionCategoryLimit));
  }
  if (options.sectionArticleLimit) {
    params.set("sectionArticleLimit", String(options.sectionArticleLimit));
  }

  const query = params.toString();
  const result = await apiGet(`/api/homepage/bundle${query ? `?${query}` : ""}`);
  const data = result.data || {};

  const value = {
    featured: data.featured || null,
    latest: data.latest || [],
    trending: data.trending || [],
    categories: data.categories || [],
    sections: data.sections || [],
    pagination: data.pagination || {
      page: options.page || 1,
      limit: options.limit || 9,
      totalItems: (data.latest || []).length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
    meta: result.meta || {
      trendingWindowDays: options.trendingDays || 45,
      trendingLimit: options.trendingLimit || 7,
      sectionCategoryLimit: options.sectionCategoryLimit || 3,
      sectionArticleLimit: options.sectionArticleLimit || 3,
    },
  };

  setCachedHomepageBundle(options, value);
  return value;
}

export async function fetchTrendingArticles(options = {}) {
  const params = new URLSearchParams();
  if (options.limit) {
    params.set("limit", String(options.limit));
  }
  if (options.days) {
    params.set("days", String(options.days));
  }

  const query = params.toString();
  const result = await apiGet(`/api/articles/trending${query ? `?${query}` : ""}`);
  return result.data || [];
}

export async function fetchLatestArticlesByCategory(slug, options = {}) {
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

  const query = params.toString();
  const result = await apiGet(`/api/categories/${slug}/articles${query ? `?${query}` : ""}`);
  return {
    data: result.data || [],
    category: result.category || null,
    pagination: result.pagination || {
      page: 1,
      limit: options.limit || 9,
      totalItems: (result.data || []).length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  };
}

export async function fetchArticleBySlug(slug) {
  const cached = getCachedArticleDetail(slug);
  if (cached) {
    return cached;
  }

  const result = await apiGet(`/api/articles/${slug}`);
  const value = result.data;
  setCachedArticleDetail(slug, value);
  return value;
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
  clearArticleCaches();
  return result.data;
}

export async function updateArticle(slug, payload) {
  const result = await apiPatch(`/api/articles/${slug}`, payload);
  clearArticleCaches();
  return result.data;
}

export async function deleteArticle(slug) {
  clearArticleCaches();
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

export async function fetchBuffers(status = "") {
  const params = new URLSearchParams();
  if (status) {
    params.set("status", status);
  }

  const query = params.toString();
  const result = await apiGet(`/api/buffers${query ? `?${query}` : ""}`);
  return result.data || [];
}

export async function createBuffer(payload) {
  const result = await apiPost("/api/buffers", payload);
  return result.data;
}

export async function updateBuffer(id, payload) {
  const result = await apiPatch(`/api/buffers/${id}`, payload);
  return result.data;
}

export async function deleteBuffer(id) {
  return apiDelete(`/api/buffers/${id}`);
}

export async function runAutomation(payload = {}) {
  const result = await apiPost("/api/automation/run", payload);
  return result.data;
}
