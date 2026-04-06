import { useEffect, useMemo, useRef, useState } from "react";
import { formatHistoryDate } from "../utils/history";

const PAGE_SIZE = 10;
const VISIBLE_BOX_HEIGHT = 360; // 대략 3개 카드 정도 보이는 높이

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const scrollRef = useRef(null);
  const loadMoreRef = useRef(null);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [history]);

  const visibleHistory = useMemo(() => {
    return history.slice(0, visibleCount);
  }, [history, visibleCount]);

  const hasMore = visibleCount < history.length;

  useEffect(() => {
    const root = scrollRef.current;
    const target = loadMoreRef.current;

    if (!root || !target || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;

        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, history.length));
      },
      {
        root,
        rootMargin: "0px 0px 120px 0px",
        threshold: 0.1,
      }
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [history.length, hasMore]);

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
        <div
          ref={scrollRef}
          className="history-list"
          style={{
            maxHeight: `${VISIBLE_BOX_HEIGHT}px`,
            overflowY: "auto",
            paddingRight: "6px",
          }}
        >
          {visibleHistory.map((item) => {
            const statusClass = getStatusClass(item.result?.overallResult);
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
                    {item.result?.overallResult || "정상"}
                  </span>
                </div>

                <div className="history-preview">
                  {item.inputValue || "입력값 없음"}
                </div>

                <div className="history-summary">
                  {item.result?.summary || "요약 없음"}
                </div>
              </button>
            );
          })}

          <div ref={loadMoreRef} style={{ height: "1px" }} />

          {!hasMore && history.length > PAGE_SIZE && (
            <div
              style={{
                textAlign: "center",
                padding: "10px 0 4px",
                fontSize: "12px",
                color: "#7b8190",
              }}
            >
              모든 기록을 불러왔습니다.
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default HistorySection;