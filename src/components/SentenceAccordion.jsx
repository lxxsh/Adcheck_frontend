import { useState } from "react";

function getStatusClass(label) {
  if (label === "주의") return "danger";
  if (label === "의심") return "warning";
  if (label === "정상") return "safe";
  return "";
}

function SentenceAccordion({ data }) {
  const [open, setOpen] = useState(false);
  const statusClass = getStatusClass(data.label);

  return (
    <div className={`accordion-item ${open ? "open" : ""}`}>
      <button className="accordion-header" onClick={() => setOpen(!open)}>
        <div className="accordion-header-left">
          <span className={`status-pill ${statusClass}`}>{data.label}</span>
          <span className="sentence-text">{data.text}</span>
        </div>
        <span className={`accordion-arrow ${open ? "rotate" : ""}`}>^</span>
      </button>

      {open && (
        <div className="accordion-body">
          <div className="detail-block">
            <div className="detail-title">판단 이유</div>
            <p>{data.reason}</p>
          </div>

          <div className="detail-block">
            <div className="detail-title">상세 설명</div>
            <p>{data.detail}</p>
          </div>

          <div className="meta-box">
            <div className="detail-title small">키워드</div>
            <div className="tag-list">
              {data.keywords.length > 0 ? (
                data.keywords.map((keyword, index) => (
                  <span key={index} className="meta-tag">
                    {keyword}
                  </span>
                ))
              ) : (
                <span className="meta-tag">키워드 없음</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SentenceAccordion;
