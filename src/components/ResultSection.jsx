import SentenceAccordion from "./SentenceAccordion";

function getStatusClass(label) {
  if (label === "주의") return "danger";
  if (label === "의심") return "warning";
  if (label === "정상") return "safe";
  return "";
}

function ResultSection({ result, source = "analysis", onNewAnalysis }) {
  const statusClass = getStatusClass(result.overallResult);
  const isHistoryResult = source === "history";

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

      <div className={`glass-card result-hero ${statusClass}`}>
        <div className="result-hero-left">
          <p className="section-eyebrow">RESULT</p>
          <h2 className="section-title">전체 분석 결과</h2>

          <div className={`status-pill large ${statusClass}`}>
            {result.overallResult}
          </div>

          <p className="result-summary">{result.summary}</p>

          {result.isMock && (
            <div className="mock-badge">
              백엔드 서버가 꺼져 있어 데모 결과를 표시 중입니다
            </div>
          )}
        </div>

        <div className="score-card">
          <div className="score-label">의심도 점수</div>
          <div className="score-value">{result.overallScore}</div>
          <div className="score-unit">/ 100</div>
        </div>
      </div>

      <div className="glass-card sentence-card">
        <div className="section-header compact">
          <div>
            <p className="section-eyebrow">DETAIL</p>
            <h3 className="subsection-title">문장별 상세 분석</h3>
          </div>
        </div>

        <div className="accordion-list">
          {result.sentences.map((sentence, index) => (
            <SentenceAccordion key={index} data={sentence} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ResultSection;
