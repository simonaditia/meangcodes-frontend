import { apiGet, apiPost } from "./api";

export async function login(payload) {
  const result = await apiPost("/api/auth/login", payload);
  return result.data;
}

export async function fetchMe() {
  const result = await apiGet("/api/auth/me");
  return result.data?.user || null;
}
