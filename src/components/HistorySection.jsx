import { formatHistoryDate } from "../utils/history";

function getStatusClass(label) {
  if (label === "주의") return "danger";
  if (label === "의심") return "warning";
  if (label === "정상") return "safe";
  return "";
}

function getInputTypeText(inputType) {
  if (inputType === "text") return "문구";
  if (inputType === "image") return "이미지";
  return "기타";
}

function getPreviewLabel(inputType) {
  if (inputType === "image") return "추출 문구";
  return "분석 문구";
}

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index);
  }

  const start = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  return Array.from({ length: 5 }, (_, index) => start + index);
}

function HistorySection({
  history,
  selectedHistoryId,
  onSelectHistory,
  onClearHistory,
  onDeleteHistory,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 5,
  onPageChange,
  error = "",
}) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);
  const pageOffset = currentPage * pageSize;

  return (
    <section className="glass-card history-section">
      <div className="section-header compact">
        <div>
          <p className="section-eyebrow">HISTORY</p>
          <h3 className="subsection-title">내 분석 기록</h3>
          {totalElements > 0 && (
            <p className="history-count">
              총 {totalElements}개 중 {pageOffset + 1}-
              {pageOffset + history.length}개 표시
            </p>
          )}
        </div>

        <button className="history-clear-button" onClick={onClearHistory}>
          전체 삭제
        </button>
      </div>

      {error && <div className="history-error-box">{error}</div>}

      {history.length === 0 ? (
        <div className="history-empty-box">
          로그인 후 분석하면 기록이 여기에 표시됩니다.
        </div>
      ) : (
        <>
          <div className="history-list">
            {history.map((item, index) => {
              const statusClass = getStatusClass(item.result.overallResult);
              const isSelected = selectedHistoryId === item.id;

              return (
                <div
                  key={item.id}
                  className={`history-item ${isSelected ? "selected" : ""}`}
                >
                  <button
                    type="button"
                    className="history-item-main"
                    onClick={() => onSelectHistory(item)}
                  >
                    <div className="history-item-top">
                      <div className="history-item-meta">
                        <span className="history-index">{pageOffset + index + 1}</span>
                        <span className="history-type-badge">
                          {getInputTypeText(item.inputType)}
                        </span>
                        <span className="history-date">
                          {formatHistoryDate(item.createdAt)}
                        </span>
                      </div>

                      <span className="history-arrow">›</span>
                    </div>

                    <div className="history-preview-label">
                      {getPreviewLabel(item.inputType)}
                    </div>
                    <div className="history-preview">
                      {item.inputValue || "입력값 없음"}
                    </div>

                    <div className="history-result-row">
                      <span className={`status-pill ${statusClass}`}>
                        {item.result.overallResult}
                      </span>
                      <span className="history-score">
                        {item.result.overallScore}점
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    className="history-delete-button"
                    aria-label="분석 기록 삭제"
                    onClick={() => onDeleteHistory?.(item)}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="history-pagination">
              <button
                type="button"
                className="history-page-button wide"
                disabled={currentPage === 0}
                onClick={() => onPageChange?.(currentPage - 1)}
              >
                이전
              </button>

              {pageNumbers[0] > 0 && (
                <>
                  <button
                    type="button"
                    className="history-page-button"
                    onClick={() => onPageChange?.(0)}
                  >
                    1
                  </button>
                  <span className="history-page-ellipsis">...</span>
                </>
              )}

              {pageNumbers.map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`history-page-button ${
                    page === currentPage ? "active" : ""
                  }`}
                  onClick={() => onPageChange?.(page)}
                >
                  {page + 1}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <>
                  <span className="history-page-ellipsis">...</span>
                  <button
                    type="button"
                    className="history-page-button"
                    onClick={() => onPageChange?.(totalPages - 1)}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                className="history-page-button wide"
                disabled={currentPage >= totalPages - 1}
                onClick={() => onPageChange?.(currentPage + 1)}
              >
                다음
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default HistorySection;
