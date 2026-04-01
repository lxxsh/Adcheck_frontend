function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
  } catch (error) {
    return null;
  }
}

function getHistoryKey() {
  const currentUser = getCurrentUser();
  const userId = currentUser?.id || "guest";
  return `analysis_history_${userId}`;
}

export function getAnalysisHistory() {
  try {
    const raw = localStorage.getItem(getHistoryKey());
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

export function saveAnalysisHistory(entry) {
  const currentHistory = getAnalysisHistory();

  const newItem = {
    id: Date.now(),
    createdAt: new Date().toISOString(),
    ...entry,
  };

  const updatedHistory = [newItem, ...currentHistory];
  localStorage.setItem(getHistoryKey(), JSON.stringify(updatedHistory));

  return updatedHistory;
}

export function clearAnalysisHistory() {
  localStorage.removeItem(getHistoryKey());
}

export function formatHistoryDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "날짜 정보 없음";
  }

  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}