import { useEffect, useState } from "react";
import InputSection from "../components/InputSection";
import ResultSection from "../components/ResultSection";
import HistorySection from "../components/HistorySection";
import {
  clearAuth,
  deleteHistory,
  deleteHistoryItem,
  getHistory,
  getHistoryById,
  isAuthError,
  isLoggedIn,
} from "../api";
import { transformResult } from "../utils/transform";

const HISTORY_PAGE_SIZE = 5;
const LOADING_MESSAGES = [
  "문구를 분석하고 있습니다.",
  "광고 표현의 위험도를 계산하고 있습니다.",
  "어디까지나 위험도 분석일 뿐, 구매를 막으려는 판단은 아닙니다.",
  "의심되는 표현과 근거를 정리하고 있습니다.",
];

function parseJsonArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeInputType(value) {
  return String(value || "text").toLowerCase();
}

function getDisplayInputValue(item, inputType, originalText) {
  const inputContent = item.inputContent || item.input_content || "";
  const extractedText = item.extractedText || item.extracted_text || "";

  if (inputType === "image") {
    return extractedText || originalText || inputContent || "추출된 문구 없음";
  }

  return inputContent || originalText || "입력값 없음";
}

function getResultOriginalText(item, inputType, fallbackText) {
  if (inputType !== "image") return fallbackText;
  return item.extractedText || item.extracted_text || fallbackText;
}

function transformHistoryItem(item) {
  const sentenceResults = parseJsonArray(
    item.sentenceResultsJson || item.sentence_results_json || item.sentenceResults
  );
  const inputType = normalizeInputType(item.inputType || item.input_type);
  const originalText = item.originalText || item.original_text || "";
  const resultOriginalText = getResultOriginalText(item, inputType, originalText);

  const apiData = {
    original_text: resultOriginalText,
    overall_suspicion_level:
      item.overallSuspicionLevel || item.overall_suspicion_level || "정상",
    overall_score: item.overallScore ?? item.overall_score ?? 0,
    summary: item.summary || "",
    sentence_results: sentenceResults,
  };

  return {
    id: item.id,
    inputType,
    inputValue: getDisplayInputValue(item, inputType, originalText),
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    result: transformResult(apiData),
  };
}

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(0);
  const [historyTotalElements, setHistoryTotalElements] = useState(0);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);
  const [resultSource, setResultSource] = useState("analysis");
  const [historyError, setHistoryError] = useState("");
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [analysisModalDismissed, setAnalysisModalDismissed] = useState(false);

  const handleAuthExpired = () => {
    clearAuth();
    setHistory([]);
    setHistoryPage(0);
    setHistoryTotalPages(0);
    setHistoryTotalElements(0);
    setSelectedHistoryId(null);
    setHistoryError("로그인이 만료되었습니다. 다시 로그인하면 분석 기록이 저장됩니다.");
  };

  const refreshHistory = (page = historyPage) => {
    if (!isLoggedIn()) {
      setHistory([]);
      setHistoryPage(0);
      setHistoryTotalPages(0);
      setHistoryTotalElements(0);
      setSelectedHistoryId(null);
      setHistoryError("");
      return Promise.resolve([]);
    }

    setHistoryError("");
    return getHistory({ page, size: HISTORY_PAGE_SIZE })
      .then((data) => {
        const items = data.content || data.items || [];
        const transformed = items.map(transformHistoryItem);
        const nextPage = data.number ?? page;
        const nextTotalPages = data.totalPages ?? (transformed.length > 0 ? 1 : 0);
        const nextTotalElements = data.totalElements ?? transformed.length;

        setHistory(transformed);
        setHistoryPage(nextPage);
        setHistoryTotalPages(nextTotalPages);
        setHistoryTotalElements(nextTotalElements);
        return { ok: true, items: transformed };
      })
      .catch((error) => {
        if (isAuthError(error)) {
          handleAuthExpired();
          return { ok: false, items: [] };
        }

        setHistory([]);
        setHistoryPage(0);
        setHistoryTotalPages(0);
        setHistoryTotalElements(0);
        setHistoryError("분석 기록을 불러오지 못했습니다.");
        return { ok: false, items: [] };
      });
  };

  useEffect(() => {
    if (!isLoggedIn()) return;

    getHistory({ page: 0, size: HISTORY_PAGE_SIZE })
      .then((data) => {
        const items = data.content || data.items || [];
        const transformed = items.map(transformHistoryItem);
        setHistory(transformed);
        setHistoryPage(data.number ?? 0);
        setHistoryTotalPages(data.totalPages ?? (transformed.length > 0 ? 1 : 0));
        setHistoryTotalElements(data.totalElements ?? transformed.length);
      })
      .catch((error) => {
        if (isAuthError(error)) {
          handleAuthExpired();
          return;
        }

        setHistory([]);
        setHistoryPage(0);
        setHistoryTotalPages(0);
        setHistoryTotalElements(0);
        setHistoryError("분석 기록을 불러오지 못했습니다.");
      });
  }, []);

  useEffect(() => {
    const stateTimer = window.setTimeout(() => {
      if (!loading) {
        setLoadingMessageIndex(0);
        return;
      }

      setAnalysisModalDismissed(false);
    }, 0);

    if (!loading) {
      return () => window.clearTimeout(stateTimer);
    }

    const messageTimer = window.setInterval(() => {
      setLoadingMessageIndex((current) => (current + 1) % LOADING_MESSAGES.length);
    }, 2200);

    return () => {
      window.clearTimeout(stateTimer);
      window.clearInterval(messageTimer);
    };
  }, [loading]);

  const handleAnalysisComplete = (entry) => {
    setResultSource("analysis");
    setAnalysisModalDismissed(false);

    if (!isLoggedIn()) return;

    refreshHistory(0).then((response) => {
      const transformed = Array.isArray(response) ? response : response.items;
      if (!Array.isArray(transformed) || response?.ok === false) return;

      const matched = transformed.find(
        (item) =>
          item.inputType === entry.inputType &&
          item.inputValue === entry.inputValue
      );

      if (matched || transformed.length > 0) {
        setSelectedHistoryId((matched || transformed[0]).id);
        return;
      }

      const fallbackEntry = {
        id: `local-${Date.now()}`,
        inputType: entry.inputType,
        inputValue: entry.inputValue,
        createdAt: new Date().toISOString(),
        result: entry.result,
      };

      setHistory([fallbackEntry]);
      setHistoryPage(0);
      setHistoryTotalPages(1);
      setHistoryTotalElements(1);
      setSelectedHistoryId(fallbackEntry.id);
    });
  };

  const handleSelectHistory = async (item) => {
    setSelectedHistoryId(item.id);
    setResultSource("history");
    setResult(item.result);
    setAnalysisModalDismissed(false);

    if (!isLoggedIn() || String(item.id).startsWith("local-")) return;

    try {
      const detail = await getHistoryById(item.id);
      const transformed = transformHistoryItem(detail);
      setResult(transformed.result);
      setHistory((current) =>
        current.map((historyItem) =>
          historyItem.id === item.id ? transformed : historyItem
        )
      );
    } catch {
      // 목록 데이터로도 결과 확인은 가능하므로 상세 조회 실패는 조용히 무시한다.
    }
  };

  const handleClearHistory = async () => {
    if (isLoggedIn()) {
      try {
        setHistoryError("");
        await deleteHistory();
      } catch (error) {
        if (isAuthError(error)) {
          handleAuthExpired();
          return;
        }

        setHistoryError(error.message || "전체 삭제에 실패했습니다.");
        return;
      }
    }

    setHistory([]);
    setHistoryPage(0);
    setHistoryTotalPages(0);
    setHistoryTotalElements(0);
    setSelectedHistoryId(null);
    if (resultSource === "history") {
      setResult(null);
      setResultSource("analysis");
    }
  };

  const handleDeleteHistoryItem = async (item) => {
    if (!isLoggedIn() || String(item.id).startsWith("local-")) {
      setHistory((current) => current.filter((historyItem) => historyItem.id !== item.id));
      return;
    }

    try {
      setHistoryError("");
      await deleteHistoryItem(item.id);

      if (selectedHistoryId === item.id) {
        setSelectedHistoryId(null);
        if (resultSource === "history") {
          setResult(null);
          setResultSource("analysis");
        }
      }

      const nextTotalElements = Math.max(0, historyTotalElements - 1);
      const nextTotalPages = Math.ceil(nextTotalElements / HISTORY_PAGE_SIZE);
      const nextPage =
        historyPage > 0 && history.length === 1
          ? Math.max(0, historyPage - 1)
          : historyPage;

      if (nextTotalElements === 0) {
        setHistory([]);
        setHistoryPage(0);
        setHistoryTotalPages(0);
        setHistoryTotalElements(0);
        return;
      }

      await refreshHistory(Math.min(nextPage, nextTotalPages - 1));
    } catch (error) {
      if (isAuthError(error)) {
        handleAuthExpired();
        return;
      }

      setHistoryError(error.message || "기록 삭제에 실패했습니다.");
    }
  };

  const handleInputResult = (nextResult) => {
    setResultSource("analysis");
    setResult(nextResult);
    setAnalysisModalDismissed(false);
  };

  const handleHistoryPageChange = (page) => {
    if (page < 0 || page >= historyTotalPages || page === historyPage) return;
    refreshHistory(page);
  };

  const loggedIn = isLoggedIn();
  const showAnalysisModal = (loading || result) && !analysisModalDismissed;
  const closeAnalysisModal = () => {
    setAnalysisModalDismissed(true);
    if (!loading) {
      setResult(null);
      setSelectedHistoryId(null);
      setResultSource("analysis");
    }
  };

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-copy">
          <div className="hero-badge">AI가 광고의 진실을 밝혀드립니다</div>

          <h1 className="hero-title">
            허위·과장 광고 의심도를<br />
            더 <span>정확하게 분석</span>하세요
          </h1>

          <p className="hero-description">
            광고 문구, URL, 이미지 입력을 통해 허위·과장 가능성이 있는 <span className="text-nowrap">표현을 탐지하고,</span>
            그 의심스러운 근거를 함께 확인할 수 있습니다.
          </p>

          <div className="feature-row">
            <div className="feature-item">
              <strong>AI 기반 분석</strong>
              <small>자연어 · 이미지 분석</small>
            </div>
            <div className="feature-item">
              <strong>의심 근거 제시</strong>
              <small>과장 · 허위 근거 제공</small>
            </div>
            <div className="feature-item">
              <strong>직관적 위험도</strong>
              <small>한눈에 보는 위험 점수</small>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="robot" aria-hidden="true">
            <div className="robot-shadow"></div>
            <div className="robot-head">
              <div className="robot-antenna"></div>
              <div className="robot-face">
                <span className="robot-eye left"></span>
                <span className="robot-eye right"></span>
                <span className="robot-mouth"></span>
              </div>
            </div>
            <div className="robot-body">
              <div className="robot-badge-light"></div>
              <div className="robot-scan-line"></div>
            </div>
            <div className="robot-glow"></div>
            <div className="robot-magnifier"></div>
          </div>

          <div className="risk-card main-risk">
            <p>광고 위험도</p>
            <div className="gauge"></div>
            <strong>72%</strong>
            <span>위험도 높음</span>
          </div>

          <div className="risk-card result-card">
            <p>주요 탐지 결과</p>
            <ul>
              <li><span className="dot red"></span>과장 표현 <b>근거 보기 ›</b></li>
              <li><span className="dot orange"></span>근거 부족 <b>근거 보기 ›</b></li>
              <li><span className="dot purple"></span>사실 확인 필요 <b>근거 보기 ›</b></li>
            </ul>
          </div>

          <div className="risk-card compare-card">
            <p>유사 광고 비교</p>
            <div className="chart-line"></div>
            <strong>68%</strong>
          </div>
        </div>
      </section>

      <section className="analysis-panel glass-card">
        <InputSection
          setResult={handleInputResult}
          setLoading={setLoading}
          onAnalysisComplete={handleAnalysisComplete}
          loggedIn={loggedIn}
        />
      </section>

      {showAnalysisModal && (
        <div className="analysis-modal-backdrop">
          <section
            className={`analysis-modal ${loading ? "is-loading" : "has-result"}`}
            role="dialog"
            aria-modal="true"
            aria-label={loading ? "분석 진행 중" : "분석 결과"}
          >
            <button
              type="button"
              className="analysis-modal-close"
              onClick={closeAnalysisModal}
              aria-label="닫기"
            >
              ×
            </button>

            {loading ? (
              <div className="modal-loading-panel">
                <div className="loading-orbit" aria-hidden="true"></div>
                <p className="modal-loading-eyebrow">ANALYZING</p>
                <h3 className="modal-loading-title">광고 내용을 분석하고 있습니다...</h3>
                <p className="modal-loading-copy">
                  입력한 광고 내용을 검토하고 결과를 정리하는 중입니다.
                </p>

                <div className="modal-loading-meta">
                  <span>{LOADING_MESSAGES[loadingMessageIndex]}</span>
                </div>
              </div>
            ) : (
              result && (
                <div className="modal-result-panel">
                  <ResultSection
                    result={result}
                    source={resultSource}
                    onNewAnalysis={() => {
                      setResult(null);
                      setSelectedHistoryId(null);
                      setResultSource("analysis");
                      setAnalysisModalDismissed(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  />
                </div>
              )
            )}
          </section>
        </div>
      )}

      {loggedIn && (
        <HistorySection
          history={history}
          selectedHistoryId={selectedHistoryId}
          onSelectHistory={handleSelectHistory}
          onClearHistory={handleClearHistory}
          onDeleteHistory={handleDeleteHistoryItem}
          currentPage={historyPage}
          totalPages={historyTotalPages}
          totalElements={historyTotalElements}
          pageSize={HISTORY_PAGE_SIZE}
          onPageChange={handleHistoryPageChange}
          error={historyError}
        />
      )}
    </main>
  );
}

export default Home;
