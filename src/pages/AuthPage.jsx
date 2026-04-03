import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../api";

function AuthPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");

  // 로그인 상태
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // 회원가입 상태
  const [signupNickname, setSignupNickname] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordCheck, setSignupPasswordCheck] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();

    if (!signupNickname.trim() || !signupEmail.trim() || !signupPassword.trim() || !signupPasswordCheck.trim()) {
      setMessage("회원가입 정보를 모두 입력해주세요.");
      return;
    }

    if (signupPassword !== signupPasswordCheck) {
      setMessage("비밀번호 확인 값이 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      await register({
        email: signupEmail.trim(),
        password: signupPassword,
        nickname: signupNickname.trim(),
      });
      setMessage("회원가입이 완료되었습니다. 로그인해주세요.");
      setActiveTab("login");
      setSignupNickname("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupPasswordCheck("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await login({ email: loginEmail.trim(), password: loginPassword });
      navigate("/service");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-shape auth-shape-1"></div>
      <div className="auth-background-shape auth-shape-2"></div>

      <div className="auth-layout">
        <section className="auth-brand-panel">
          <div className="auth-brand-badge">AI Advertising Risk Analyzer</div>
          <h1 className="auth-brand-title">
            허위·과장 광고를
            <br />
            더 명확하게 확인하세요
          </h1>
          <p className="auth-brand-description">
            광고 문구, URL, 이미지를 입력하면 허위·과장 가능성이 있는 표현을
            탐지하고 근거를 함께 보여주는 분석 서비스입니다.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              광고 문구, URL, 이미지 분석 지원
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              의심 결과 요약과 상세 근거 확인
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              개인 분석 이력 저장
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-tab-row">
              <button
                className={`auth-tab-button ${activeTab === "login" ? "active" : ""}`}
                onClick={() => { setActiveTab("login"); setMessage(""); }}
              >
                로그인
              </button>
              <button
                className={`auth-tab-button ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => { setActiveTab("signup"); setMessage(""); }}
              >
                회원가입
              </button>
            </div>

            <div className="auth-form-header">
              <h2>{activeTab === "login" ? "로그인" : "회원가입"}</h2>
              <p>
                {activeTab === "login"
                  ? "서비스를 이용하려면 로그인해주세요."
                  : "새 계정을 만들고 서비스를 시작해보세요."}
              </p>
            </div>

            {message && <div className="auth-message-box">{message}</div>}

            {activeTab === "login" ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-input-group">
                  <label>이메일</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="이메일을 입력해주세요"
                  />
                </div>

                <div className="auth-input-group">
                  <label>비밀번호</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호를 입력해주세요"
                  />
                </div>

                <button type="submit" className="auth-submit-button" disabled={loading}>
                  {loading ? "로그인 중..." : "로그인"}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleSignup}>
                <div className="auth-input-group">
                  <label>닉네임</label>
                  <input
                    type="text"
                    value={signupNickname}
                    onChange={(e) => setSignupNickname(e.target.value)}
                    placeholder="닉네임을 입력해주세요 (2~20자)"
                  />
                </div>

                <div className="auth-input-group">
                  <label>이메일</label>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="이메일을 입력해주세요"
                  />
                </div>

                <div className="auth-input-group">
                  <label>비밀번호</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="비밀번호를 입력해주세요 (8자 이상)"
                  />
                </div>

                <div className="auth-input-group">
                  <label>비밀번호 확인</label>
                  <input
                    type="password"
                    value={signupPasswordCheck}
                    onChange={(e) => setSignupPasswordCheck(e.target.value)}
                    placeholder="비밀번호를 한 번 더 입력해주세요"
                  />
                </div>

                <button type="submit" className="auth-submit-button" disabled={loading}>
                  {loading ? "처리 중..." : "회원가입"}
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthPage;
