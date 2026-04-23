import { useEffect, useRef, useState } from "react";
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

// 백엔드 이력 항목을 프론트에서 쓰는 결과 형식으로 변환한다.
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
  const resultRef = useRef(null);

  const scrollToResult = () => {
    window.setTimeout(() => {
      resultRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  };

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

  const handleAnalysisComplete = (entry) => {
    setResultSource("analysis");

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
    scrollToResult();

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
  };

  const handleHistoryPageChange = (page) => {
    if (page < 0 || page >= historyTotalPages || page === historyPage) return;
    refreshHistory(page);
  };

  return (
    <div className="app-shell">
      <main className="page-container">
        <section className="hero-section">
          <div className="hero-badge">AI 광고 위험도 분석 서비스</div>
          <h1 className="hero-title">
            허위·과장 광고 의심도를
            <br />
            더 명확하게 분석하세요
          </h1>
          <p className="hero-description">
            광고 문구, URL, 이미지 입력을 통해 허위·과장 가능성이 있는 표현을
            탐지하고, 그 의심스러운 근거를 함께 확인할 수 있습니다.
          </p>
        </section>

        <InputSection
          setResult={handleInputResult}
          setLoading={setLoading}
          onAnalysisComplete={handleAnalysisComplete}
          loggedIn={isLoggedIn()}
        />

        {loading && (
          <section className="glass-card loading-card">
            <div className="loading-spinner"></div>
            <div>
              <h3 className="loading-title">광고 내용을 분석하고 있습니다</h3>
              <p className="loading-description">
                AI가 광고 문구를 분석 중입니다. 잠시만 기다려주세요.
              </p>
            </div>
          </section>
        )}

        {result && !loading && (
          <div ref={resultRef} className="result-scroll-anchor">
            <ResultSection
              result={result}
              source={resultSource}
              onNewAnalysis={() => {
                setResult(null);
                setSelectedHistoryId(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        )}

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
      </main>
    </div>
  );
}

export default Home;
