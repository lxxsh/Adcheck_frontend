import SentenceAccordion from "./SentenceAccordion";

function getStatusClass(label) {
  if (label === "주의") return "danger";
  if (label === "의심") return "warning";
  if (label === "정상") return "safe";
  return "";
}

function ResultSection({ result }) {
  if (!result) return null;

  const overallResult =
    result.overall_suspicion_level ?? result.overallResult ?? "판단 불가";

  const overallScoreRaw =
    result.overall_score ?? result.overallScore ?? 0;

  const overallScore =
    typeof overallScoreRaw === "number"
      ? Math.round(overallScoreRaw <= 1 ? overallScoreRaw * 100 : overallScoreRaw)
      : overallScoreRaw;

  const sentenceResults =
    result.sentence_results ?? result.sentences ?? [];

  const evidences =
    result.evidences ??
    sentenceResults.flatMap((item) => item.matched_keywords ?? []);

  const statusClass = getStatusClass(overallResult);

  return (
    <section className="result-wrapper">
      <div className={`glass-card result-hero ${statusClass}`}>
        <div className="result-hero-left">
          <p className="section-eyebrow">RESULT</p>
          <h2 className="section-title">전체 분석 결과</h2>

          <div className={`status-pill large ${statusClass}`}>
            {overallResult}
          </div>

          <p className="result-summary">{result.summary ?? "요약 정보가 없습니다."}</p>

          {result.isMock && (
            <div className="mock-badge">
              백엔드 서버가 꺼져 있어 데모 결과를 표시 중입니다
            </div>
          )}
        </div>

        <div className="score-card">
          <div className="score-label">의심도 점수</div>
          <div className="score-value">{overallScore}</div>
          <div className="score-unit">/ 100</div>
        </div>
      </div>

      <div className="result-grid">
        <div className="glass-card evidence-card">
          <div className="section-header compact">
            <div>
              <p className="section-eyebrow">EVIDENCE</p>
              <h3 className="subsection-title">핵심 근거 요약</h3>
            </div>
          </div>

          <div className="evidence-list">
            {evidences.length > 0 ? (
              evidences.map((evidence, index) => (
                <div key={index} className="evidence-item">
                  <div className="evidence-dot"></div>
                  <p>{evidence}</p>
                </div>
              ))
            ) : (
              <p>추출된 핵심 근거가 없습니다.</p>
            )}
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
            {sentenceResults.length > 0 ? (
              sentenceResults.map((sentence, index) => (
                <SentenceAccordion key={index} data={sentence} />
              ))
            ) : (
              <p>문장별 분석 결과가 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ResultSection;