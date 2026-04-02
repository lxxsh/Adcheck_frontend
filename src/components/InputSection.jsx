import { useEffect, useMemo, useRef, useState } from "react";
import { analyzeImage, analyzeText, analyzeUrl } from "../api";
import { transformResult } from "../utils/transform";

const LABEL_SAFE = "\uC815\uC0C1";
const LABEL_WARNING = "\uC758\uC2EC";
const LABEL_DANGER = "\uC8FC\uC758";

const SUSPICION_PRIORITY = {
  [LABEL_SAFE]: 0,
  [LABEL_WARNING]: 1,
  [LABEL_DANGER]: 2,
};

function createImageItem(file) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
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
  const overallScore =
    results.reduce((sum, item) => sum + (item.overall_score || 0), 0) /
    results.length;

  const sentenceResults = results.flatMap((item, index) => {
    const imageName = images[index]?.file?.name || `\uC774\uBBF8\uC9C0 ${index + 1}`;

    return Array.isArray(item.sentence_results)
      ? item.sentence_results.map((sentence) => ({
          ...sentence,
          sentence: `[${imageName}] ${sentence.sentence || ""}`,
        }))
      : [];
  });

  const mockIncluded = results.some((item) => item.__mock);
  const riskyCount = results.filter(
    (item) => (item.overall_suspicion_level || LABEL_SAFE) !== LABEL_SAFE
  ).length;

  return {
    __mock: mockIncluded,
    original_text: images.map((image) => image.file.name).join(", "),
    overall_suspicion_level: pickOverallSuspicion(
      results.map((item) => item.overall_suspicion_level || LABEL_SAFE)
    ),
    overall_score: Number.isFinite(overallScore) ? overallScore : 0,
    sentence_results: sentenceResults,
    summary:
      images.length === 1
        ? results[0]?.summary || "\uC774\uBBF8\uC9C0 \uBD84\uC11D \uACB0\uACFC\uC785\uB2C8\uB2E4."
        : `${images.length}\uC7A5\uC758 \uC774\uBBF8\uC9C0\uB97C \uBAA8\uB450 \uBD84\uC11D\uD588\uC2B5\uB2C8\uB2E4. ${
            riskyCount > 0
              ? `${riskyCount}\uC7A5\uC5D0\uC11C \uC8FC\uC758 \uB610\uB294 \uC758\uC2EC \uD45C\uD604\uC774 \uAC10\uC9C0\uB418\uC5C8\uC2B5\uB2C8\uB2E4.`
              : "\uBAA8\uB4E0 \uC774\uBBF8\uC9C0\uC5D0\uC11C \uBE44\uAD50\uC801 \uC548\uC804\uD55C \uD45C\uD604\uC73C\uB85C \uBD84\uB958\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
          }`,
  };
}

function InputSection({ setResult, setLoading, onAnalysisComplete }) {
  const [activeTab, setActiveTab] = useState("compose");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const imagesRef = useRef([]);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, []);

  const hasImages = useMemo(() => images.length > 0, [images]);

  const appendImages = (files) => {
    if (!files.length) {
      return;
    }

    const nextImages = files.map(createImageItem);

    setImages((current) => [...current, ...nextImages]);
    setError("");
    setActiveTab("compose");
  };

  const removeImage = (imageId) => {
    setImages((current) => {
      const target = current.find((image) => image.id === imageId);
      if (target) {
        URL.revokeObjectURL(target.preview);
      }

      return current.filter((image) => image.id !== imageId);
    });
  };

  const clearImages = () => {
    images.forEach((image) => URL.revokeObjectURL(image.preview));
    setImages([]);
  };

  const getInputValue = () => {
    if (activeTab === "url") {
      return urlInput.trim();
    }

    if (hasImages) {
      return images.length > 1
        ? `${images[0].file.name} +${images.length - 1} more`
        : images[0].file.name;
    }

    return textInput.trim();
  };

  const getHistoryInputType = () => {
    if (activeTab === "url") {
      return "url";
    }

    return hasImages ? "image" : "text";
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    appendImages(files);
    event.target.value = "";
  };

  const handleClipboardPaste = (event) => {
    const clipboardItems = Array.from(event.clipboardData?.items || []);
    const files = clipboardItems
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter(Boolean);

    if (!files.length) {
      return;
    }

    event.preventDefault();
    appendImages(files);
  };

  const handleAnalyze = async () => {
    try {
      setError("");

      if (activeTab === "url" && !urlInput.trim()) {
        setError("\uAD11\uACE0 URL\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
        return;
      }

      if (activeTab === "compose" && !textInput.trim() && !hasImages) {
        setError(
          "\uAD11\uACE0 \uBB38\uAD6C\uB97C \uC785\uB825\uD558\uAC70\uB098 \uC774\uBBF8\uC9C0\uB97C \uBD99\uC5EC\uB123\uAC70\uB098 \uC5C5\uB85C\uB4DC\uD574\uC8FC\uC138\uC694."
        );
        return;
      }

      if (activeTab === "compose" && textInput.trim() && hasImages) {
        setError(
          "\uD604\uC7AC\uB294 \uBB38\uAD6C\uC640 \uC774\uBBF8\uC9C0\uB97C \uB3D9\uC2DC\uC5D0 \uBD84\uC11D\uD560 \uC218 \uC5C6\uC5B4\uC694. \uD558\uB098\uB9CC \uC120\uD0DD\uD574\uC8FC\uC138\uC694."
        );
        return;
      }

      setLoading(true);

      let response;

      if (activeTab === "url") {
        response = await analyzeUrl(urlInput.trim());
      } else if (hasImages) {
        const imageResponses = await Promise.all(
          images.map((image) => analyzeImage(image.file))
        );
        response = combineImageResponses(imageResponses, images);
      } else {
        response = await analyzeText(textInput.trim());
      }

      const transformed = transformResult(response);
      setResult(transformed);

      if (onAnalysisComplete) {
        onAnalysisComplete({
          inputType: getHistoryInputType(),
          inputValue: getInputValue(),
          result: transformed,
        });
      }
    } catch (err) {
      setError(err.message || "\uBD84\uC11D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4.");
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (activeTab === "url") {
      return (
        <div className="input-panel">
          <label className="input-label">
            {"\uAD11\uACE0 URL \uC785\uB825"}
          </label>
          <input
            className="text-input"
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/product"
          />
          <div className="input-hint">
            {
              "\uC0C1\uC138 \uD398\uC774\uC9C0\uB098 \uAD11\uACE0 \uB79C\uB529 \uD398\uC774\uC9C0 \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694."
            }
          </div>
        </div>
      );
    }

    return (
      <div className="input-panel compose-panel" onPaste={handleClipboardPaste}>
        <label className="input-label">
          {"\uAD11\uACE0 \uBB38\uAD6C \uB610\uB294 \uC774\uBBF8\uC9C0"}
        </label>
        <textarea
          className="text-area compose-text-area"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder={
            "\uAD11\uACE0 \uBB38\uAD6C\uB97C \uC785\uB825\uD558\uAC70\uB098, \uD074\uB9BD\uBCF4\uB4DC\uC5D0 \uBCF5\uC0AC\uD55C \uC774\uBBF8\uC9C0\uB97C Ctrl+V\uB85C \uBC14\uB85C \uBD99\uC5EC\uB123\uC5B4 \uBCF4\uC138\uC694."
          }
          rows={6}
        />

        <div className="compose-toolbar">
          <label className="attach-button">
            {"\uC774\uBBF8\uC9C0 \uCD94\uAC00"}
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
              {"\uC804\uCCB4 \uC774\uBBF8\uC9C0 \uC81C\uAC70"}
            </button>
          )}
        </div>

        <div className={`upload-box compose-upload-box ${images.length > 0 ? "has-image" : ""}`}>
          {images.length > 0 ? (
            <div className="image-gallery">
              <div className="image-gallery-header">
                <div className="image-gallery-title">
                  {`\uCCA8\uBD80\uB41C \uC774\uBBF8\uC9C0 ${images.length}\uC7A5`}
                </div>
                <div className="image-gallery-hint">
                  {
                    "\uCCA8\uBD80\uB41C \uC774\uBBF8\uC9C0\uB294 \uBAA8\uB450 \uBD84\uC11D\uD569\uB2C8\uB2E4. \uBD99\uC5EC\uB123\uAE30\uB098 \uCD94\uAC00 \uC120\uD0DD\uC73C\uB85C \uACC4\uC18D \uB204\uC801\uD560 \uC218 \uC788\uC5B4\uC694."
                  }
                </div>
              </div>

              <div className="image-preview-grid">
                {images.map((image) => (
                  <div key={image.id} className="image-thumb-card">
                    <div className="image-thumb-frame">
                        <img
                          className="image-thumb"
                          src={image.preview}
                          alt={image.file.name}
                        />
                    </div>

                    <div className="image-thumb-meta">
                      <div className="image-thumb-name">{image.file.name}</div>
                      <div className="image-thumb-actions">
                        <button
                          type="button"
                          className="image-chip subtle"
                          onClick={() => removeImage(image.id)}
                        >
                          {"\uC0AD\uC81C"}
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
                {
                  "\uC774\uBBF8\uC9C0\uB97C \uC5EC\uB7EC \uC7A5 \uC5C5\uB85C\uB4DC\uD558\uAC70\uB098 \uD074\uB9BD\uBCF4\uB4DC\uC5D0\uC11C \uBC14\uB85C \uBD99\uC5EC\uB123\uC73C\uC138\uC694"
                }
              </div>
              <div className="upload-subtext">
                {
                  "JPG, PNG \uC5EC\uB7EC \uC7A5 \uC120\uD0DD \uAC00\uB2A5, \uCEA1\uCC98 \uD6C4 Ctrl+V \uBD99\uC5EC\uB123\uAE30\uB3C4 \uC9C0\uC6D0\uD569\uB2C8\uB2E4"
                }
              </div>
            </>
          )}
        </div>

        <div className="input-hint">
          {
            "\uBB38\uAD6C\uB97C \uC785\uB825\uD558\uBA74 \uBB38\uAD6C \uBD84\uC11D, \uC774\uBBF8\uC9C0\uB97C \uCCA8\uBD80\uD558\uBA74 \uCCA8\uBD80\uB41C \uC774\uBBF8\uC9C0 \uC804\uBD80\uB97C \uC21C\uCC28 \uBD84\uC11D\uD569\uB2C8\uB2E4."
          }
        </div>
      </div>
    );
  };

  return (
    <section className="glass-card input-card">
      <div className="section-header">
        <div>
          <p className="section-eyebrow">INPUT</p>
          <h2 className="section-title">
            {"\uAD11\uACE0 \uB0B4\uC6A9 \uC785\uB825"}
          </h2>
        </div>
        <div className="section-chip">
          {"\uBD84\uC11D \uD6C4 \uC790\uB3D9 \uC800\uC7A5"}
        </div>
      </div>

      <div className="tab-row">
        <button
          className={`tab-button ${activeTab === "compose" ? "active" : ""}`}
          onClick={() => setActiveTab("compose")}
        >
          {"\uBB38\uAD6C/\uC774\uBBF8\uC9C0 \uC785\uB825"}
        </button>
        <button
          className={`tab-button ${activeTab === "url" ? "active" : ""}`}
          onClick={() => setActiveTab("url")}
        >
          {"URL \uC785\uB825"}
        </button>
      </div>

      {renderTabContent()}

      {error && <div className="error-box">{error}</div>}

      <div className="action-row">
        <button className="analyze-button" onClick={handleAnalyze}>
          {"\uBD84\uC11D \uC2DC\uC791\uD558\uAE30"}
        </button>
      </div>
    </section>
  );
}

export default InputSection;
