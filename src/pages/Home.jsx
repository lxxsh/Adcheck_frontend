import { useState } from "react";
import InputSection from "../components/InputSection";
import ResultSection from "../components/ResultSection";

function Home() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app-shell">
      <div className="background-glow bg-glow-1"></div>
      <div className="background-glow bg-glow-2"></div>

      <main className="page-container">
        <section className="hero-section">
          <div className="hero-badge">AI 광고 위험도 분석 시스템</div>
          <h1 className="hero-title">
            허위·과장 광고 의심도를
            <br />
            더 명확하게 분석하세요
          </h1>
          <p className="hero-description">
            광고 문구, URL, 이미지 입력을 통해 허위·과장 가능성이 있는 표현을 탐지하고,
            왜 의심스러운지 근거와 함께 확인할 수 있습니다.
          </p>
        </section>

        <InputSection setResult={setResult} setLoading={setLoading} />

        {loading && (
          <section className="glass-card loading-card">
            <div className="loading-spinner"></div>
            <div>
              <h3 className="loading-title">광고 내용을 분석하고 있습니다</h3>
              <p className="loading-description">
                문장 분리, 규칙 기반 탐지, AI 분석 결과를 순차적으로 정리하고 있습니다.
              </p>
            </div>
          </section>
        )}

        {result && !loading && <ResultSection result={result} />}
      </main>
    </div>
  );
}

export default Home;