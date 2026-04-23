const BASE_URL = "/api";

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
    const error = new Error(data.error || data.detail || `요청 실패 (${res.status})`);
    error.status = res.status;
    throw error;
  }

  return data;
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("nickname");
  localStorage.removeItem("email");
  localStorage.removeItem("isLoggedIn");
}

export function isAuthError(error) {
  return error?.status === 401 || error?.status === 403;
}

export async function register({ email, password, nickname }) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, nickname }),
  });
  return handleResponse(res);
}

export async function login({ email, password }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await handleResponse(res);

  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("nickname", data.nickname || "");
    localStorage.setItem("email", email || "");
    localStorage.setItem("isLoggedIn", "true");
  }

  return data;
}

export async function sendEmailCode(email) {
  const res = await fetch(`${BASE_URL}/email/send-code`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(res);
}

export async function verifyEmailCode({ email, code }) {
  const res = await fetch(`${BASE_URL}/email/verify-code`, {
    method: "POST",
    credentials: "omit",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return handleResponse(res);
}

export async function changePassword({ currentPassword = "", newPassword }) {
  const res = await fetch(`${BASE_URL}/password/change`, {
    method: "POST",
    credentials: "omit",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
}

export function logout() {
  clearAuth();
  window.location.href = "/";
}

export function getCurrentNickname() {
  const nickname = localStorage.getItem("nickname");
  return nickname && nickname.trim() ? nickname : null;
}

export function getCurrentEmail() {
  const email = localStorage.getItem("email");
  return email && email.trim() ? email : null;
}

export function getCurrentAccountKey() {
  return getCurrentEmail() || getCurrentNickname() || null;
}

export function isLoggedIn() {
  return !!localStorage.getItem("token");
}

export async function analyzeText(content) {
  const res = await fetch(`${BASE_URL}/analyze/text`, {
    method: "POST",
    credentials: "omit",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      inputType: "text",
      content,
    }),
  });
  return handleResponse(res);
}

export async function analyzeUrl(content) {
  const res = await fetch(`${BASE_URL}/analyze/url`, {
    method: "POST",
    credentials: "omit",
    headers: authHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      inputType: "url",
      content,
    }),
  });
  return handleResponse(res);
}

export async function analyzeImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("inputType", "image");

  const res = await fetch(`${BASE_URL}/analyze/image`, {
    method: "POST",
    credentials: "omit",
    headers: authHeaders(),
    body: formData,
  });
  return handleResponse(res);
}

export async function getHistory({ page = 0, size = 10 } = {}) {
  const res = await fetch(`${BASE_URL}/history?page=${page}&size=${size}`, {
    method: "GET",
    credentials: "omit",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function getHistoryById(id) {
  const res = await fetch(`${BASE_URL}/history/${id}`, {
    method: "GET",
    credentials: "omit",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function deleteHistory() {
  const res = await fetch(`${BASE_URL}/history`, {
    method: "DELETE",
    credentials: "omit",
    headers: authHeaders(),
  });
  return handleResponse(res);
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${BASE_URL}/history/${id}`, {
    method: "DELETE",
    credentials: "omit",
    headers: authHeaders(),
  });
  return handleResponse(res);
}
