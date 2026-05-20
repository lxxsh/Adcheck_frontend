import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeImage, analyzeText, analyzeUrl } from "../api";
import { transformResult } from "../utils/transform";

const LABEL_SAFE = "정상";
const LABEL_CAUTION = "주의";
const LABEL_SUSPICIOUS = "의심";

const SUSPICION_PRIORITY = {
  [LABEL_SAFE]: 0,
  [LABEL_CAUTION]: 1,
  [LABEL_SUSPICIOUS]: 2,
};

function createImageItem(file, displayName) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    displayName,
    preview: URL.createObjectURL(file),
  };
}

function pickOverallSuspicion(results) {
  return results.reduce((highest, current) => {
    const highestScore = SUSPICION_PRIORITY[highest] ?? -1;
    const currentScore = SUSPICION_PRIORITY[current] ?? -1;
    return currentScore > highestScore ? current : highest;
  }, LABEL_SAFE);
}

function combineImageResponses(results, images) {
  const extractedTexts = results
    .map((item) => item.original_text || item.extracted_text || "")
    .filter((text) => text.trim());

  const overallScore =
    results.reduce((sum, item) => sum + (item.overall_score || 0), 0) /
    results.length;

  const sentenceResults = results.flatMap((item, index) => {
    const imageName = images[index]?.displayName || `Image${index + 1}`;
    return Array.isArray(item.sentence_results)
      ? item.sentence_results.map((sentence) => ({
          ...sentence,
          sentence: `[${imageName}] ${sentence.sentence || ""}`,
        }))
      : [];
  });

  const riskyCount = results.filter(
    (item) => (item.overall_suspicion_level || LABEL_SAFE) !== LABEL_SAFE
  ).length;

  return {
    original_text:
      extractedTexts.join("\n") ||
      images.map((image) => image.displayName).join(", "),
    overall_suspicion_level: pickOverallSuspicion(
      results.map((item) => item.overall_suspicion_level || LABEL_SAFE)
    ),
    overall_score: Number.isFinite(overallScore) ? overallScore : 0,
    sentence_results: sentenceResults,
    summary:
      images.length === 1
        ? results[0]?.summary || "이미지 분석 결과입니다."
        : `${images.length}개의 이미지를 모두 분석했습니다. ${
            riskyCount > 0
              ? `${riskyCount}개에서 주의 또는 의심 표현이 감지되었습니다.`
              : "모든 이미지가 비교적 안전한 표현으로 분류되었습니다."
          }`,
  };
}

function InputSection({
  setResult,
  setLoading,
  onAnalysisComplete,
  onAnalysisStart,
  loggedIn,
  resetSignal,
  cancelSignal,
}) {
  const [activeTab, setActiveTab] = useState("compose");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const imagesRef = useRef([]);
  const abortControllerRef = useRef(null);
  const requestSequenceRef = useRef(0);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  useEffect(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestSequenceRef.current += 1;
    setLoading(false);
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    imagesRef.current = [];
    setImages([]);
    setTextInput("");
    setUrlInput("");
    setError("");
    setActiveTab("compose");
  }, [resetSignal, setLoading]);

  useEffect(() => {
    if (!cancelSignal) return;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    requestSequenceRef.current += 1;
    setLoading(false);
  }, [cancelSignal, setLoading]);

  const hasImages = useMemo(() => images.length > 0, [images]);

  const appendImages = (files) => {
    if (!files.length) return;

    setImages((current) => [
      ...current,
      ...files.map((file, index) =>
        createImageItem(file, `Image${current.length + index + 1}`)
      ),
    ]);
    setError("");
    setActiveTab("compose");
  };

  const removeImage = (imageId) => {
    setImages((current) => {
      const target = current.find((image) => image.id === imageId);
      if (target) URL.revokeObjectURL(target.preview);
      return current.filter((image) => image.id !== imageId);
    });
  };

  const clearImages = () => {
    images.forEach((image) => URL.revokeObjectURL(image.preview));
    setImages([]);
  };

  const getInputValue = () => {
    if (activeTab === "url") return urlInput.trim();

    if (hasImages) {
      return images.length > 1
        ? `${images[0].displayName} +${images.length - 1} more`
        : images[0].displayName;
    }

    return textInput.trim();
  };

  const getHistoryInputType = () => {
    if (activeTab === "url") return "url";
    return hasImages ? "image" : "text";
  };

  const handleFileChange = (event) => {
    appendImages(Array.from(event.target.files || []));
    event.target.value = "";
  };

  const handleClipboardPaste = (event) => {
    const files = Array.from(event.clipboardData?.items || [])
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter(Boolean);

    if (!files.length) return;

    event.preventDefault();
    appendImages(files);
  };

  const handleAnalyze = async () => {
    const requestId = requestSequenceRef.current + 1;

    try {
      setError("");

      if (activeTab === "url" && !urlInput.trim()) {
        setError("광고 URL을 입력해 주세요.");
        return;
      }

      if (activeTab === "compose" && !textInput.trim() && !hasImages) {
        setError("광고 문구를 입력하거나 이미지를 업로드해 주세요.");
        return;
      }

      if (activeTab === "compose" && textInput.trim() && hasImages) {
        setError("문구와 이미지는 동시에 분석할 수 없습니다. 하나만 선택해 주세요.");
        return;
      }

      abortControllerRef.current?.abort();
      const controller = new AbortController();
      abortControllerRef.current = controller;
      requestSequenceRef.current = requestId;

      onAnalysisStart?.();
      setLoading(true);

      let response;

      if (activeTab === "url") {
        response = await analyzeUrl(urlInput.trim(), { signal: controller.signal });
      } else if (hasImages) {
        const imageResponses = await Promise.all(
          images.map((image) => analyzeImage(image.file, { signal: controller.signal }))
        );
        response = combineImageResponses(imageResponses, images);
      } else {
        response = await analyzeText(textInput.trim(), { signal: controller.signal });
      }

      if (requestSequenceRef.current !== requestId || controller.signal.aborted) {
        return;
      }

      const transformed = transformResult(response);
      setResult(transformed);

      if (onAnalysisComplete) {
        onAnalysisComplete({
          inputType: getHistoryInputType(),
          inputValue:
            getHistoryInputType() === "image"
              ? transformed.originalText || getInputValue()
              : getInputValue(),
          result: transformed,
        });
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }
      setError(err.message || "분석 중 오류가 발생했습니다.");
    } finally {
      if (requestSequenceRef.current === requestId) {
        abortControllerRef.current = null;
        setLoading(false);
      }
    }
  };

  const renderTabContent = () => {
    if (activeTab === "url") {
      return (
        <div className="input-panel">
          <label className="input-label">광고 URL 입력</label>
          <input
            className="text-input"
            type="text"
            value={urlInput}
            onChange={(event) => setUrlInput(event.target.value)}
            placeholder="https://example.com/product"
          />
          <div className="input-hint">
            상품 상세 페이지나 광고 랜딩 페이지 주소를 입력해 주세요.
          </div>
        </div>
      );
    }

    return (
      <div className="input-panel compose-panel" onPaste={handleClipboardPaste}>
        <label className="input-label">광고 문구 또는 이미지</label>
        <textarea
          className="text-area compose-text-area"
          value={textInput}
          onChange={(event) => setTextInput(event.target.value)}
          placeholder="광고 문구를 입력하거나 클립보드의 이미지를 Ctrl+V로 바로 붙여 넣어 보세요."
          rows={6}
        />

        <div className="compose-toolbar">
          <label className="attach-button">
            이미지 추가
            <input
              className="hidden-file"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
            />
          </label>

          {images.length > 0 && (
            <button
              type="button"
              className="attach-remove-button"
              onClick={clearImages}
            >
              전체 이미지 제거
            </button>
          )}
        </div>

        <div
          className={`upload-box compose-upload-box ${
            images.length > 0 ? "has-image" : ""
          }`}
        >
          {images.length > 0 ? (
            <div className="image-gallery">
              <div className="image-gallery-header">
                <div className="image-gallery-title">{`첨부된 이미지 ${images.length}장`}</div>
                <div className="image-gallery-hint">
                  첨부된 이미지는 모두 분석됩니다. 붙여넣기나 추가 선택으로 계속 누적할 수 있습니다.
                </div>
              </div>

              <div className="image-preview-grid">
                {images.map((image) => (
                  <div key={image.id} className="image-thumb-card">
                    <div className="image-thumb-frame">
                      <img
                        className="image-thumb"
                        src={image.preview}
                        alt={image.displayName}
                      />
                    </div>

                    <div className="image-thumb-meta">
                      <div className="image-thumb-name">{image.displayName}</div>
                      <div className="image-thumb-actions">
                        <button
                          type="button"
                          className="image-chip subtle"
                          onClick={() => removeImage(image.id)}
                        >
                          제거
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="upload-icon">+</div>
              <div className="upload-text">
                이미지를 드래그해 업로드하거나 클립보드에서 바로 붙여 넣으세요
              </div>
              <div className="upload-subtext">
                JPG, PNG 파일을 지원합니다. 캡처 후 Ctrl+V 붙여넣기도 가능합니다
              </div>
            </>
          )}
        </div>

        <div className="input-hint">
          문구를 입력하면 문구 분석, 이미지를 첨부하면 첨부된 이미지 전체를 순서대로 분석합니다.
        </div>
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
        <div className="section-chip">
          {loggedIn
            ? "분석 기록 자동 저장"
            : "비회원 분석 가능, 로그인 시 기록 저장"}
        </div>
      </div>

      <div className="tab-row">
        <button
          className={`tab-button ${activeTab === "compose" ? "active" : ""}`}
          onClick={() => setActiveTab("compose")}
        >
          문구/이미지 입력
        </button>
        <button
          className={`tab-button ${activeTab === "url" ? "active" : ""}`}
          onClick={() => setActiveTab("url")}
        >
          URL 입력
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
