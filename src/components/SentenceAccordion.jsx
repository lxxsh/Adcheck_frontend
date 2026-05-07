import { useState } from "react";

function getStatusClass(label) {
  if (label === "의심") return "danger";
  if (label === "주의") return "warning";
  if (label === "정상") return "safe";
  return "";
}

function SentenceAccordion({ data }) {
  const [open, setOpen] = useState(false);
  const statusClass = getStatusClass(data.label);
  const hasKeywords = data.keywords.length > 0;
  const hasRules = data.rules.length > 0;

  return (
    <div className={`accordion-item ${open ? "open" : ""}`}>
      <button className="accordion-header" onClick={() => setOpen(!open)}>
        <div className="accordion-header-left">
          <span className={`status-pill ${statusClass}`}>{data.label}</span>
          <span className="sentence-text">{data.text}</span>
        </div>
        <span className={`accordion-arrow ${open ? "rotate" : ""}`}>⌄</span>
      </button>

      {open && (
        <div className="accordion-body">
          <div className="detail-block">
            <div className="detail-title">판단 이유</div>
            <p>{data.reason}</p>
          </div>

          {(hasKeywords || hasRules) && (
            <div className="detail-meta-row">
              {hasKeywords && (
                <div className="meta-box">
                  <div className="detail-title small">근거 표현</div>
                  <div className="tag-list">
                    {data.keywords.map((keyword, index) => (
                      <span key={index} className="meta-tag">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {hasRules && (
                <div className="meta-box">
                  <div className="detail-title small">탐지 신호</div>
                  <div className="tag-list">
                    {data.rules.map((rule, index) => (
                      <span key={index} className="meta-tag outline">
                        {rule}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SentenceAccordion;
