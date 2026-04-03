import { useState } from "react";
import ServiceTopbar from "../components/ServiceTopbar";
import { getCurrentNickname } from "../api";

function MyPage() {
  const nickname = getCurrentNickname();
  const [message] = useState("");

  return (
    <div>
      <ServiceTopbar />

      <div className="app-shell">
        <main className="page-container">
          <section className="glass-card mypage-card">
            <div className="section-header compact">
              <div>
                <p className="section-eyebrow">MY PAGE</p>
                <h2 className="section-title">회원 정보</h2>
              </div>
            </div>

            {message && <div className="auth-message-box">{message}</div>}

            <div className="mypage-meta-grid">
              <div className="mypage-meta-box">
                <div className="detail-title small">닉네임</div>
                <div className="mypage-meta-value">{nickname || "-"}</div>
              </div>
              <div className="mypage-meta-box">
                <div className="detail-title small">계정 상태</div>
                <div className="mypage-meta-value">로그인 중</div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default MyPage;
