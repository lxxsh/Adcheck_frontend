const BASE_URL = "http://localhost:8080";

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "요청 실패");
  }

  return data;
}

export async function analyzeText(content) {
  const res = await fetch(`${BASE_URL}/analyze/text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content }),
  });

  return handleResponse(res);
}