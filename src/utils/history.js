const LOCAL_HISTORY_PREFIX = "analysis_history";

function getHistoryStorageKey(accountKey) {
  if (!accountKey) return null;
  return `${LOCAL_HISTORY_PREFIX}:${accountKey}`;
}

export function formatHistoryDate(value) {
  if (!value) return "날짜 없음";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "날짜 없음";
    }

    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("날짜 포맷 실패:", error);
    return "날짜 없음";
  }
}

export function getLocalHistory(accountKey) {
  try {
    const storageKey = getHistoryStorageKey(accountKey);
    if (!storageKey) return [];

    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("로컬 분석 기록 불러오기 실패:", error);
    return [];
  }
}

export function saveLocalHistory(accountKey, history) {
  try {
    const storageKey = getHistoryStorageKey(accountKey);
    if (!storageKey) return;

    localStorage.setItem(storageKey, JSON.stringify(history));
  } catch (error) {
    console.error("로컬 분석 기록 저장 실패:", error);
  }
}

export function appendLocalHistory(accountKey, item) {
  try {
    const current = getLocalHistory(accountKey);
    const next = [item, ...current];
    saveLocalHistory(accountKey, next);
    return next;
  } catch (error) {
    console.error("로컬 분석 기록 추가 실패:", error);
    return getLocalHistory(accountKey);
  }
}

export function clearLocalHistory(accountKey) {
  try {
    const storageKey = getHistoryStorageKey(accountKey);
    if (!storageKey) return;

    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("로컬 분석 기록 삭제 실패:", error);
  }
}

function normalizeText(value) {
  return String(value || "").trim();
}

function isSameHistoryItem(a, b) {
  if (!a || !b) return false;

  return (
    normalizeText(a.inputType) === normalizeText(b.inputType) &&
    normalizeText(a.inputValue) === normalizeText(b.inputValue) &&
    normalizeText(a?.result?.overallResult) ===
      normalizeText(b?.result?.overallResult) &&
    normalizeText(a?.result?.summary) === normalizeText(b?.result?.summary) &&
    normalizeText(a?.result?.originalText) ===
      normalizeText(b?.result?.originalText)
  );
}

export function mergeHistory(localItems, remoteItems) {
  const merged = [];

  [...remoteItems, ...localItems].forEach((item) => {
    const exists = merged.some((saved) => isSameHistoryItem(saved, item));
    if (!exists) {
      merged.push(item);
    }
  });

  merged.sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });

  return merged;
}