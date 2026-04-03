import { useState } from "react";

function InputSection({ setResult, setLoading }) {
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  const handleAnalyze = () => {
    if (!textInput.trim() && !urlInput.trim() && !imageFile) {
      setError("문구, URL, 이미지 중 하나 이상 입력해주세요.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      const mockData = {
        overallResult: "의심",
        overallScore: 72,
        summary:
          "과장 가능성이 있는 표현과 단정적인 효능 표현이 탐지되었습니다. 즉시 위법이라고 단정할 수는 없지만, 소비자 오인을 유발할 가능성이 있습니다.",
        evidences: [
          "‘7일 만에 개선’처럼 짧은 기간 내 효과를 단정하는 표현이 포함되어 있습니다.",
          "‘100% 효과’처럼 절대적인 보장형 문구가 확인되었습니다.",
          "효능을 강하게 확정하는 표현이 일부 문장에서 반복적으로 나타납니다.",
        ],
        sentences: [
          {
            text: "7일 만에 피부가 눈에 띄게 개선됩니다.",
            label: "위험",
            reason: "짧은 기간 안에 효과를 단정적으로 보장하는 표현입니다.",
            detail:
              "소비자가 실제 효능을 확정적으로 기대하게 만들 수 있는 문장입니다. 기간과 개선 결과를 함께 강조해 과장 표현으로 해석될 가능성이 높습니다.",
            keywords: ["7일 만에", "개선"],
            rules: ["효능과장", "절대표현"],
          },
          {
            text: "단 1회 사용만으로도 탄력이 살아납니다.",
            label: "의심",
            reason: "즉각적 효과를 강하게 암시하는 표현입니다.",
            detail:
              "사용 직후 눈에 띄는 변화를 보장하는 것처럼 읽힐 수 있습니다. 객관적 근거 없이 즉시성이나 확정적 효능을 강조하면 오인 가능성이 커집니다.",
            keywords: ["1회 사용", "탄력"],
            rules: ["효능과장", "기능성오인"],
          },
          {
            text: "피부에 촉촉한 보습감을 줍니다.",
            label: "정상",
            reason: "일반적인 사용감 설명 수준의 표현입니다.",
            detail:
              "질병 치료, 절대적 효과 보장, 기능성 단정 표현으로 보기 어렵습니다. 상대적으로 일반적인 화장품 홍보 문구에 가깝습니다.",
            keywords: ["보습감"],
            rules: ["일반홍보"],
          },
        ],
      };

      setResult(mockData);
      setLoading(false);
    }, 1800);
  };

  const renderTabContent = () => {
    if (activeTab === "text") {
      return (
        <div className="input-panel">
          <label className="input-label">광고 문구 입력</label>
          <textarea
            className="text-area"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="예시) 7일 만에 피부 개선, 단 1회 사용으로 탄력 강화"
            rows={7}
          />
          <div className="input-hint">
            광고 문구를 직접 붙여넣어 분석할 수 있습니다.
          </div>
        </div>
      );
    }

    if (activeTab === "url") {
      return (
        <div className="input-panel">
          <label className="input-label">광고 URL 입력</label>
          <input
            className="text-input"
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/ad-page"
          />
          <div className="input-hint">
            상세페이지나 광고 랜딩 페이지 URL을 입력하세요.
          </div>
        </div>
      );
    }

    return (
      <div className="input-panel">
        <label className="input-label">광고 이미지 업로드</label>
        <label className="upload-box">
          <input
            className="hidden-file"
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
          <div className="upload-icon">+</div>
          <div className="upload-text">
            {imageFile ? imageFile.name : "이미지를 업로드하려면 클릭하세요"}
          </div>
          <div className="upload-subtext">JPG, PNG 등 이미지 파일 업로드</div>
        </label>
      </div>
    );
  };

  return (
    <section className="glass-card input-card">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">INPUT</p>
          <h2 className="section-title">광고 내용 입력</h2>
        </div>
        <div className="section-chip">실시간 분석 준비</div>
      </div>

      <div className="tab-row">
        <button
          className={`tab-button ${activeTab === "text" ? "active" : ""}`}
          onClick={() => setActiveTab("text")}
        >
          문구 입력
        </button>
        <button
          className={`tab-button ${activeTab === "url" ? "active" : ""}`}
          onClick={() => setActiveTab("url")}
        >
          URL 입력
        </button>
        <button
          className={`tab-button ${activeTab === "image" ? "active" : ""}`}
          onClick={() => setActiveTab("image")}
        >
          이미지 업로드
        </button>
      </div>

      {renderTabContent()}

      {error && <div className="error-box">{error}</div>}

      <div className="action-row">
        <button className="analyze-button" onClick={handleAnalyze}>
          분석 시작하기
        </button>
      </div>
    </section>
  );
}

export default InputSection;