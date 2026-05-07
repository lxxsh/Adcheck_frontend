import { useMemo, useState } from "react";
import SentenceAccordion from "./SentenceAccordion";

function getStatusClass(label) {
  if (label === "주의") return "warning";
  if (label === "의심") return "danger";
  if (label === "정상") return "safe";
  return "";
}

function getSentencePriority(label) {
  if (label === "의심") return 0;
  if (label === "주의") return 1;
  if (label === "정상") return 2;
  return 3;
}

function ResultSection({ result, source = "analysis", onNewAnalysis }) {
  const [showSafeSentences, setShowSafeSentences] = useState(false);
  const statusClass = getStatusClass(result.overallResult);
  const isHistoryResult = source === "history";
  const progressWidth = `${Math.max(0, Math.min(result.overallScore, 100))}%`;
  const sortedSentences = useMemo(
    () =>
      [...result.sentences].sort(
        (a, b) => getSentencePriority(a.label) - getSentencePriority(b.label)
      ),
    [result.sentences]
  );
  const riskySentences = sortedSentences.filter((item) => item.label !== "정상");
  const safeSentences = sortedSentences.filter((item) => item.label === "정상");
  const visibleSentences = showSafeSentences
    ? [...riskySentences, ...safeSentences]
    : riskySentences;

  return (
    <section className="result-wrapper">
      <div className="result-context-row">
        <div>
          <p className="section-eyebrow">
            {isHistoryResult ? "HISTORY RESULT" : "CURRENT RESULT"}
          </p>
          <h2 className="section-title">
            {isHistoryResult ? "선택한 기록의 분석 결과" : "분석 결과"}
          </h2>
        </div>

        {onNewAnalysis && (
          <button
            type="button"
            className="result-reset-button"
            onClick={onNewAnalysis}
          >
            새로 분석하기
          </button>
        )}
      </div>

      <div className="glass-card result-panel">
        <div className="result-panel-header">
          <div>
            <p className="section-eyebrow">RESULT</p>
            <h2 className="section-title">분석 결과</h2>
          </div>
          <div className="result-panel-meta">
            <span>{result.sentenceCount || result.sentences.length}개 문장 분석</span>
            <span>{result.riskySentenceCount || 0}개 위험 문장 감지</span>
          </div>
        </div>

        <div className="result-overview-grid">
          <div className={`result-score-card ${statusClass}`}>
            <div className="score-label">의심도 점수</div>
            <div className="score-value">{result.overallScore}</div>
            <div className={`status-pill large ${statusClass}`}>
              {result.overallResult}
            </div>
          </div>

          <div className="result-summary-card">
            <div className="result-summary-copy">{result.summary}</div>

            <div className="result-progress-block">
              <div className="result-progress-label-row">
                <span>전체 의심도</span>
                <strong>{result.overallScore} / 100</strong>
              </div>
              <div className="result-progress-track" aria-hidden="true">
                <div
                  className={`result-progress-fill ${statusClass}`}
                  style={{ width: progressWidth }}
                />
              </div>
            </div>

            {result.isMock && (
              <div className="mock-badge">
                백엔드 서버가 꺼져 있어 데모 결과를 표시 중입니다.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card sentence-card">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">DETAIL</p>
            <h3 className="subsection-title">문장별 상세 분석</h3>
          </div>
          <div className="sentence-section-meta">
            <div className="sentence-section-hint">
              항목을 눌러 판단 이유를 확인할 수 있습니다.
            </div>
            {safeSentences.length > 0 && (
              <button
                type="button"
                className="sentence-toggle-button"
                onClick={() => setShowSafeSentences((current) => !current)}
              >
                {showSafeSentences
                  ? `정상 문장 숨기기 (${safeSentences.length})`
                  : `정상 문장 보기 (${safeSentences.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="accordion-list">
          {visibleSentences.map((sentence, index) => (
            <SentenceAccordion key={index} data={sentence} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ResultSection;
