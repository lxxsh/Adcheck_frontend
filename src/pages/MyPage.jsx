import { useEffect, useState } from "react";
import ServiceTopbar from "../components/ServiceTopbar";
import {
  changePassword,
  getCurrentEmail,
  getCurrentNickname,
  sendEmailCode,
  verifyEmailCode,
} from "../api";

function MyPage() {
  const nickname = getCurrentNickname();
  const email = getCurrentEmail();

  const [newPassword, setNewPassword] = useState("");
  const [newPasswordCheck, setNewPasswordCheck] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (verifiedEmail && verifiedEmail !== email) {
      setEmailVerified(false);
      setVerifiedEmail("");
      setEmailCode("");
      setCodeSent(false);
    }
  }, [email, verifiedEmail]);

  const handleSendCode = async () => {
    if (!email) {
      setMessage("로그인된 이메일 정보를 찾을 수 없습니다.");
      return;
    }

    try {
      setLoading(true);
      const response = await sendEmailCode(email);
      setCodeSent(true);
      setEmailVerified(false);
      setVerifiedEmail("");
      setMessage(response.message || "인증 코드가 이메일로 전송되었습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!email || !emailCode.trim()) {
      setMessage("인증 코드를 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      const response = await verifyEmailCode({
        email,
        code: emailCode.trim(),
      });
      setEmailVerified(true);
      setVerifiedEmail(email);
      setMessage(response.message || "이메일 인증이 완료되었습니다.");
    } catch (error) {
      setEmailVerified(false);
      setVerifiedEmail("");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (event) => {
    event.preventDefault();

    if (!newPassword.trim() || !newPasswordCheck.trim()) {
      setMessage("새 비밀번호 정보를 모두 입력해주세요.");
      return;
    }

    if (!emailVerified || verifiedEmail !== email) {
      setMessage("비밀번호 변경 전에 이메일 인증을 완료해주세요.");
      return;
    }

    if (newPassword.length < 8) {
      setMessage("새 비밀번호는 8자 이상으로 입력해주세요.");
      return;
    }

    if (newPassword !== newPasswordCheck) {
      setMessage("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      const response = await changePassword({
        currentPassword: "",
        newPassword: newPassword.trim(),
      });
      setNewPassword("");
      setNewPasswordCheck("");
      setEmailCode("");
      setCodeSent(false);
      setEmailVerified(false);
      setVerifiedEmail("");
      setMessage(response.message || "비밀번호가 변경되었습니다.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

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
                <div className="detail-title small">이메일</div>
                <div className="mypage-meta-value">{email || "-"}</div>
              </div>
              <div className="mypage-meta-box">
                <div className="detail-title small">비밀번호</div>
                <div className="mypage-meta-value">********</div>
              </div>
              <div className="mypage-meta-box">
                <div className="detail-title small">계정 상태</div>
                <div className="mypage-meta-value">로그인 중</div>
              </div>
            </div>

            <form className="mypage-form" onSubmit={handlePasswordUpdate}>
              <div className="mypage-password-grid">
                <div className="auth-input-group mypage-password-span">
                  <label>이메일 인증 코드</label>
                  <div className="auth-inline-row">
                    <input
                      type="text"
                      value={emailCode}
                      onChange={(event) => setEmailCode(event.target.value)}
                      placeholder="이메일로 받은 인증 코드를 입력해주세요"
                    />
                    <button
                      type="button"
                      className="auth-inline-button"
                      onClick={handleSendCode}
                      disabled={loading}
                    >
                      인증코드 전송
                    </button>
                    <button
                      type="button"
                      className="auth-inline-button"
                      onClick={handleVerifyCode}
                      disabled={loading || !codeSent}
                    >
                      {emailVerified ? "인증 완료" : "인증 확인"}
                    </button>
                  </div>
                  {emailVerified && (
                    <div className="auth-inline-hint success">이메일 인증이 완료되었습니다.</div>
                  )}
                </div>

                <div className="auth-input-group mypage-password-span">
                  <label>새 비밀번호</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="새 비밀번호를 입력해주세요"
                  />
                </div>

                <div className="auth-input-group mypage-password-span">
                  <label>새 비밀번호 확인</label>
                  <input
                    type="password"
                    value={newPasswordCheck}
                    onChange={(event) => setNewPasswordCheck(event.target.value)}
                    placeholder="새 비밀번호를 다시 입력해주세요"
                  />
                </div>
              </div>

              <div className="mypage-action-row">
                <button type="submit" className="auth-submit-button mypage-submit-button" disabled={loading}>
                  {loading ? "변경 중..." : "비밀번호 변경"}
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}

export default MyPage;
