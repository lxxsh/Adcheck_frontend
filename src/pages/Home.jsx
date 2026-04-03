import { useEffect, useState } from "react";
import InputSection from "../components/InputSection";
import ResultSection from "../components/ResultSection";
import HistorySection from "../components/HistorySection";
import { getHistory } from "../api";
import { transformResult } from "../utils/transform";

// 백엔드 이력 항목 → 프론트 형식으로 변환
function transformHistoryItem(item) {
  let sentenceResults = [];
  try {
    sentenceResults = item.sentenceResultsJson
      ? JSON.parse(item.sentenceResultsJson)
      : [];
  } catch (_) {
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
    id: item.id,
    inputType: (item.inputType || "TEXT").toLowerCase(),
    inputValue: item.inputContent || "",
    createdAt: item.createdAt || new Date().toISOString(),
    result: transformResult(apiData),
  };
}

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState(null);

  // 마운트 시 백엔드에서 이력 불러오기
  useEffect(() => {
    getHistory({ page: 0, size: 20 })
      .then((data) => {
        const items = data.content || [];
        setHistory(items.map(transformHistoryItem));
      })
      .catch(() => {
        // 비로그인이거나 서버 오류 시 빈 이력
        setHistory([]);
      });
  }, []);

  const handleAnalysisComplete = (entry) => {
    // 분석 완료 후 이력 새로고침
    getHistory({ page: 0, size: 20 })
      .then((data) => {
        const items = data.content || [];
        const transformed = items.map(transformHistoryItem);
        setHistory(transformed);
        setSelectedHistoryId(transformed[0]?.id || null);
      })
      .catch(() => {});
  };

  const handleSelectHistory = (item) => {
    setSelectedHistoryId(item.id);
    setResult(item.result);
  };

  const handleClearHistory = () => {
    // 이력 삭제는 백엔드 미구현이므로 화면만 초기화
    setHistory([]);
    setSelectedHistoryId(null);
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
          setResult={setResult}
          setLoading={setLoading}
          onAnalysisComplete={handleAnalysisComplete}
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

        <HistorySection
          history={history}
          selectedHistoryId={selectedHistoryId}
          onSelectHistory={handleSelectHistory}
          onClearHistory={handleClearHistory}
        />
      </main>
    </div>
  );
}

export default Home;
