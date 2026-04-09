import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  login,
  register,
  sendEmailCode,
  verifyEmailCode,
} from "../api";
import ServiceTopbar from "../components/ServiceTopbar";

function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTab = location.state?.tab === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState(initialTab);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupNickname, setSignupNickname] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPasswordCheck, setSignupPasswordCheck] = useState("");
  const [signupCode, setSignupCode] = useState("");
  const [signupCodeSent, setSignupCodeSent] = useState(false);
  const [signupEmailVerified, setSignupEmailVerified] = useState(false);
  const [verifiedSignupEmail, setVerifiedSignupEmail] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nextTab = location.state?.tab === "signup" ? "signup" : "login";
    setActiveTab(nextTab);
    setMessage("");
  }, [location.state]);

  useEffect(() => {
    if (verifiedSignupEmail && verifiedSignupEmail !== signupEmail.trim()) {
      setSignupEmailVerified(false);
      setVerifiedSignupEmail("");
      setSignupCode("");
      setSignupCodeSent(false);
    }
  }, [signupEmail, verifiedSignupEmail]);

  const handleSendSignupCode = async () => {
    if (!signupEmail.trim()) {
      setMessage("이메일을 먼저 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await sendEmailCode(signupEmail.trim());
      setSignupCodeSent(true);
      setSignupEmailVerified(false);
      setVerifiedSignupEmail("");
      setMessage(response.message || "인증 코드가 이메일로 전송되었습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupCode = async () => {
    if (!signupEmail.trim() || !signupCode.trim()) {
      setMessage("이메일과 인증 코드를 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyEmailCode({
        email: signupEmail.trim(),
        code: signupCode.trim(),
      });
      setSignupEmailVerified(true);
      setVerifiedSignupEmail(signupEmail.trim());
      setMessage(response.message || "이메일 인증이 완료되었습니다.");
    } catch (error) {
      setSignupEmailVerified(false);
      setVerifiedSignupEmail("");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    if (
      !signupNickname.trim() ||
      !signupEmail.trim() ||
      !signupPassword.trim() ||
      !signupPasswordCheck.trim()
    ) {
      setMessage("회원가입 정보를 모두 입력해주세요.");
      return;
    }

    if (!signupEmailVerified || verifiedSignupEmail !== signupEmail.trim()) {
      setMessage("회원가입 전에 이메일 인증을 완료해주세요.");
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
      setSignupCode("");
      setSignupCodeSent(false);
      setSignupEmailVerified(false);
      setVerifiedSignupEmail("");
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
    <div>
      <ServiceTopbar />
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
              찾아주고 그 근거를 함께 보여주는 분석 서비스입니다.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span className="auth-feature-dot"></span>
                광고 문구, URL, 이미지 분석 지원
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-dot"></span>
                결과 요약과 상세 근거 확인
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-dot"></span>
                개인 분석 이력 관리
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
                    : "이메일 인증을 완료한 뒤 계정을 생성할 수 있습니다."}
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
                      onChange={(event) => setLoginEmail(event.target.value)}
                      placeholder="이메일을 입력해주세요"
                    />
                  </div>

                  <div className="auth-input-group">
                    <label>비밀번호</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
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
                      onChange={(event) => setSignupNickname(event.target.value)}
                      placeholder="닉네임을 입력해주세요"
                    />
                  </div>

                  <div className="auth-input-group">
                    <label>이메일</label>
                    <div className="auth-inline-row">
                      <input
                        type="email"
                        value={signupEmail}
                        onChange={(event) => setSignupEmail(event.target.value)}
                        placeholder="이메일을 입력해주세요"
                      />
                      <button
                        type="button"
                        className="auth-inline-button"
                        onClick={handleSendSignupCode}
                        disabled={loading}
                      >
                        인증코드 전송
                      </button>
                    </div>
                  </div>

                  <div className="auth-input-group">
                    <label>인증 코드</label>
                    <div className="auth-inline-row">
                      <input
                        type="text"
                        value={signupCode}
                        onChange={(event) => setSignupCode(event.target.value)}
                        placeholder="이메일로 받은 인증 코드를 입력해주세요"
                      />
                      <button
                        type="button"
                        className="auth-inline-button"
                        onClick={handleVerifySignupCode}
                        disabled={loading || !signupCodeSent}
                      >
                        {signupEmailVerified ? "인증 완료" : "인증 확인"}
                      </button>
                    </div>
                    {signupEmailVerified && (
                      <div className="auth-inline-hint success">이메일 인증이 완료되었습니다.</div>
                    )}
                  </div>

                  <div className="auth-input-group">
                    <label>비밀번호</label>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(event) => setSignupPassword(event.target.value)}
                      placeholder="비밀번호를 입력해주세요 (8자 이상)"
                    />
                  </div>

                  <div className="auth-input-group">
                    <label>비밀번호 확인</label>
                    <input
                      type="password"
                      value={signupPasswordCheck}
                      onChange={(event) => setSignupPasswordCheck(event.target.value)}
                      placeholder="비밀번호를 다시 입력해주세요"
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
    </div>
  );
}

export default AuthPage;
