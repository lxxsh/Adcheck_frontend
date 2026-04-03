const BASE_URL = "http://localhost:8080";

// ── 공통 헬퍼 ────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem("token") || null;
}

function authHeaders(extra = {}) {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function handleResponse(res) {
  const contentType = res.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await res.json().catch(() => ({}))
    : {};

  if (!res.ok) {
    throw new Error(data.error || `요청 실패 (${res.status})`);
  }

  return data;
}

// ── 인증 API ────────────────────────────────────────────────

export async function register({ email, password, nickname }) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, nickname }),
  });
  return handleResponse(res);
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await handleResponse(res);
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("nickname", data.nickname);
    localStorage.setItem("isLoggedIn", "true");
  }
  return data;
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("nickname");
  localStorage.removeItem("isLoggedIn");
}

export function getCurrentNickname() {
  return localStorage.getItem("nickname") || null;
}

export function isLoggedIn() {
  return localStorage.getItem("isLoggedIn") === "true";
}

// ── 분석 API ────────────────────────────────────────────────

export async function analyzeText(content) {
  const res = await fetch(`${BASE_URL}/analyze/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
}

export async function analyzeUrl(content) {
  const res = await fetch(`${BASE_URL}/analyze/url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
}

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${BASE_URL}/analyze/image`, {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

// ── 이력 API ────────────────────────────────────────────────

export async function getHistory({ page = 0, size = 10 } = {}) {
  const res = await fetch(`${BASE_URL}/history?page=${page}&size=${size}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getHistoryById(id) {
  const res = await fetch(`${BASE_URL}/history/${id}`, {
    headers: authHeaders(),
  });
  return handleResponse(res);
}
