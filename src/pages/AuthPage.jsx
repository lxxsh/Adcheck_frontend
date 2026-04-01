import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");

  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupId, setSignupId] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordCheck, setSignupPasswordCheck] = useState("");

  const [message, setMessage] = useState("");

  const handleSignup = (e) => {
    e.preventDefault();

    if (
      !signupName.trim() ||
      !signupId.trim() ||
      !signupPassword.trim() ||
      !signupPasswordCheck.trim()
    ) {
      setMessage("회원가입 정보를 모두 입력해주세요.");
      return;
    }

    if (signupPassword !== signupPasswordCheck) {
      setMessage("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    const user = {
      name: signupName,
      id: signupId,
      password: signupPassword,
    };

    localStorage.setItem("mockUser", JSON.stringify(user));
    setMessage("회원가입이 완료되었습니다. 로그인 해주세요.");
    setActiveTab("login");

    setSignupName("");
    setSignupId("");
    setSignupPassword("");
    setSignupPasswordCheck("");
  };

  const handleLogin = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem("mockUser"));

    if (!savedUser) {
      setMessage("가입된 계정이 없습니다. 먼저 회원가입을 진행해주세요.");
      return;
    }

    if (
      loginId === savedUser.id &&
      loginPassword === savedUser.password
    ) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("currentUser", JSON.stringify(savedUser));
      navigate("/service");
      return;
    }

    setMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
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
            더 똑똑하게 확인하세요
          </h1>
          <p className="auth-brand-description">
            광고 문구, URL, 이미지를 입력하면 허위·과장 가능성이 있는 표현을
            탐지하고 이유를 함께 보여주는 분석 서비스입니다.
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              광고 문구, URL, 이미지 분석 지원
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              의심 / 주의 / 정상 결과 요약 제공
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              근거와 문장별 상세 설명 확인 가능
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-card">
            <div className="auth-tab-row">
              <button
                className={`auth-tab-button ${activeTab === "login" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("login");
                  setMessage("");
                }}
              >
                로그인
              </button>
              <button
                className={`auth-tab-button ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("signup");
                  setMessage("");
                }}
              >
                회원가입
              </button>
            </div>

            <div className="auth-form-header">
              <h2>{activeTab === "login" ? "로그인" : "회원가입"}</h2>
              <p>
                {activeTab === "login"
                  ? "서비스를 이용하려면 로그인해주세요."
                  : "새 계정을 만들고 서비스를 시작하세요."}
              </p>
            </div>

            {message && <div className="auth-message-box">{message}</div>}

            {activeTab === "login" ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-input-group">
                  <label>아이디</label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                  />
                </div>

                <div className="auth-input-group">
                  <label>비밀번호</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>

                <button type="submit" className="auth-submit-button">
                  로그인
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleSignup}>
                <div className="auth-input-group">
                  <label>이름</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="이름을 입력하세요"
                  />
                </div>

                <div className="auth-input-group">
                  <label>아이디</label>
                  <input
                    type="text"
                    value={signupId}
                    onChange={(e) => setSignupId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                  />
                </div>

                <div className="auth-input-group">
                  <label>비밀번호</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>

                <div className="auth-input-group">
                  <label>비밀번호 확인</label>
                  <input
                    type="password"
                    value={signupPasswordCheck}
                    onChange={(e) => setSignupPasswordCheck(e.target.value)}
                    placeholder="비밀번호를 다시 입력하세요"
                  />
                </div>

                <button type="submit" className="auth-submit-button">
                  회원가입
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