import { useState } from "react";
import { analyzeText, analyzeUrl, analyzeImage } from "../api";
import { transformResult } from "../utils/transform";

function InputSection({ setResult, setLoading, onAnalysisComplete }) {
  const [activeTab, setActiveTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  const getInputValue = () => {
    if (activeTab === "text") return textInput.trim();
    if (activeTab === "url") return urlInput.trim();
    if (activeTab === "image") return imageFile?.name || "이미지 파일";
    return "";
  };

  const handleAnalyze = async () => {
    try {
      setError("");

      if (activeTab === "text" && !textInput.trim()) {
        setError("광고 문구를 입력해주세요.");
        return;
      }

      if (activeTab === "url" && !urlInput.trim()) {
        setError("광고 URL을 입력해주세요.");
        return;
      }

      if (activeTab === "image" && !imageFile) {
        setError("이미지 파일을 업로드해주세요.");
        return;
      }

      setLoading(true);

      let response;

      if (activeTab === "text") {
        response = await analyzeText(textInput.trim());
      } else if (activeTab === "url") {
        response = await analyzeUrl(urlInput.trim());
      } else {
        response = await analyzeImage(imageFile);
      }

      const transformed = transformResult(response);
      setResult(transformed);

      if (onAnalysisComplete) {
        onAnalysisComplete({
          inputType: activeTab,
          inputValue: getInputValue(),
          result: transformed,
        });
      }
    } catch (err) {
      setError(err.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
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
            placeholder="예시) 7일 만에 피부 개선, 단 1회 사용만으로 탄력 강화"
            rows={7}
          />
          <div className="input-hint">
            광고 문구를 직접 붙여 넣어 분석할 수 있습니다.
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
            placeholder="https://example.com/product"
          />
          <div className="input-hint">
            상세페이지나 광고 랜딩 페이지 주소를 입력하세요.
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
          <div className="upload-subtext">
            JPG, PNG 등 광고 이미지 파일 업로드
          </div>
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
        <div className="section-chip">분석 후 자동 저장</div>
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