const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

import { getAccessToken } from "./authStorage";

function buildApiUrl(path) {
  const base = API_BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    return `${base}${normalizedPath.slice(4)}`;
  }

  return `${base}${normalizedPath}`;
}

function withAuthHeaders(headers = {}) {
  const token = getAccessToken();
  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
}

export async function apiGet(path) {
  const response = await fetch(buildApiUrl(path), {
    headers: withAuthHeaders(),
  });
  if (!response.ok) {
    const payload = await safeReadJson(response);
    const message = payload?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function apiPost(path, body) {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: withAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await safeReadJson(response);
    const message = payload?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function apiPostFormData(path, formData) {
  const response = await fetch(buildApiUrl(path), {
    method: "POST",
    headers: withAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const payload = await safeReadJson(response);
    const message = payload?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function apiDelete(path, body) {
  const response = await fetch(buildApiUrl(path), {
    method: "DELETE",
    headers: withAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const payload = await safeReadJson(response);
    const message = payload?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function apiPatch(path, body) {
  const response = await fetch(buildApiUrl(path), {
    method: "PATCH",
    headers: withAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await safeReadJson(response);
    const message = payload?.error || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

async function safeReadJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export { API_BASE_URL };
