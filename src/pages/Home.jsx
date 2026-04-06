import { useCallback, useEffect, useState } from "react";
import InputSection from "../components/InputSection";
import ResultSection from "../components/ResultSection";
import HistorySection from "../components/HistorySection";
import { getCurrentAccountKey, getHistory, isLoggedIn } from "../api";
import { transformResult } from "../utils/transform";
import {
  appendLocalHistory,
  clearLocalHistory,
  getLocalHistory,
  mergeHistory,
  saveLocalHistory,
} from "../utils/history";

// 백엔드 이력 항목 → 프론트 형식으로 변환
function transformHistoryItem(item) {
  let sentenceResults = [];

  try {
    sentenceResults = item.sentenceResultsJson
      ? JSON.parse(item.sentenceResultsJson)
      : [];
  } catch (error) {
    console.error("sentenceResultsJson 파싱 실패:", error);
    sentenceResults = [];
  }

  const apiData = {
    original_text: item.originalText || "",
    overall_suspicion_level: item.overallSuspicionLevel || "정상",
    overall_score: item.overallScore || 0,
    summary: item.summary || "",
    sentence_results: sentenceResults,
  };

  return {
    id: item.id ?? `server-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inputType: (item.inputType || "TEXT").toLowerCase(),
    inputValue: item.inputContent || "",
    createdAt: item.createdAt || new Date().toISOString(),
    result: transformResult(apiData),
  };
}

function createHistoryItemFromAnalysis({
  result,
  inputType = "text",
  inputValue = "",
}) {
  return {
    id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    inputType,
    inputValue,
    createdAt: new Date().toISOString(),
    result,
  };
}

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  const loggedIn = isLoggedIn();
  const accountKey = getCurrentAccountKey();

  const fetchHistory = useCallback(async () => {
    // 로그아웃 상태면 완전 초기화
    if (!loggedIn || !accountKey) {
      setHistory([]);
      setSelectedHistoryId(null);
      return;
    }

    const localItems = getLocalHistory(accountKey);

    try {
      const data = await getHistory({ page: 0, size: 20 });

      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];

      const remoteItems = rawItems.map(transformHistoryItem);
      const merged = mergeHistory(localItems, remoteItems);

      setHistory(merged);
      saveLocalHistory(accountKey, merged);
      setSelectedHistoryId((prev) => prev ?? merged[0]?.id ?? null);
    } catch (error) {
      console.error("이력 불러오기 실패:", error);

      // 백엔드 에러가 나도 같은 계정의 로컬 캐시는 보여줌
      setHistory(localItems);
      setSelectedHistoryId((prev) => prev ?? localItems[0]?.id ?? null);
    }
  }, [loggedIn, accountKey]);

  useEffect(() => {
    if (!loggedIn || !accountKey) {
      setHistory([]);
      setSelectedHistoryId(null);
      return;
    }

    fetchHistory();
  }, [loggedIn, accountKey, fetchHistory]);

  const handleAnalysisComplete = async (analysisPayload) => {
    if (!analysisPayload?.result) return;

    // 로그인 안 했으면 기록 저장 안 함
    if (!loggedIn || !accountKey) {
      return;
    }

    const newItem = createHistoryItemFromAnalysis({
      result: analysisPayload.result,
      inputType: analysisPayload.inputType,
      inputValue: analysisPayload.inputValue,
    });

    const nextLocalHistory = appendLocalHistory(accountKey, newItem);
    setHistory(nextLocalHistory);
    setSelectedHistoryId(newItem.id);

    await fetchHistory();
  };

  const handleSelectHistory = (item) => {
    setSelectedHistoryId(item.id);
    setResult(item.result);
  };

  const handleClearHistory = () => {
    if (loggedIn && accountKey) {
      clearLocalHistory(accountKey);
    }

    setHistory([]);
    setSelectedHistoryId(null);
  };

  return (
    <div className="app-shell">
      <div className="background-glow bg-glow-1"></div>
      <div className="background-glow bg-glow-2"></div>

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
          setResult={setResult}
          setLoading={setLoading}
          onAnalysisComplete={handleAnalysisComplete}
          loggedIn={loggedIn}
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

        {result && !loading && <ResultSection result={result} />}

        {loggedIn && (
          <HistorySection
            history={history}
            selectedHistoryId={selectedHistoryId}
            onSelectHistory={handleSelectHistory}
            onClearHistory={handleClearHistory}
          />
        )}
      </main>
    </div>
  );
}

export default Home;