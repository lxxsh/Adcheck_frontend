import { formatHistoryDate } from "../utils/history";

function getStatusClass(label) {
  if (label === "주의") return "danger";
  if (label === "의심") return "warning";
  if (label === "정상") return "safe";
  return "";
}

function getInputTypeText(inputType) {
  if (inputType === "text") return "문구";
  if (inputType === "url") return "URL";
  if (inputType === "image") return "이미지";
  return "기타";
}

function HistorySection({
  history,
  selectedHistoryId,
  onSelectHistory,
  onClearHistory,
}) {
  return (
    <section className="glass-card history-section">
      <div className="section-header compact">
        <div>
          <p className="section-eyebrow">HISTORY</p>
          <h3 className="subsection-title">내 분석 기록</h3>
        </div>

        <button className="history-clear-button" onClick={onClearHistory}>
          전체 삭제
        </button>
      </div>

      {history.length === 0 ? (
        <div className="history-empty-box">
          아직 저장된 분석 기록이 없습니다.
        </div>
      ) : (
        <div className="history-list">
          {history.map((item) => {
            const statusClass = getStatusClass(item.result.overallResult);
            const isSelected = selectedHistoryId === item.id;

            return (
              <button
                key={item.id}
                className={`history-item ${isSelected ? "selected" : ""}`}
                onClick={() => onSelectHistory(item)}
              >
                <div className="history-item-top">
                  <div className="history-item-meta">
                    <span className="history-type-badge">
                      {getInputTypeText(item.inputType)}
                    </span>
                    <span className="history-date">
                      {formatHistoryDate(item.createdAt)}
                    </span>
                  </div>

                  <span className={`status-pill ${statusClass}`}>
                    {item.result.overallResult}
                  </span>
                </div>

                <div className="history-preview">
                  {item.inputValue || "입력값 없음"}
                </div>

                <div className="history-summary">
                  {item.result.summary}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default HistorySection;