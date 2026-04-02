import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../utils/userStore";

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

  const handleSignup = (event) => {
    event.preventDefault();

    if (
      !signupName.trim() ||
      !signupId.trim() ||
      !signupPassword.trim() ||
      !signupPasswordCheck.trim()
    ) {
      setMessage("\uD68C\uC6D0\uAC00\uC785 \uC815\uBCF4\uB97C \uBAA8\uB450 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }

    if (signupPassword !== signupPasswordCheck) {
      setMessage("\uBE44\uBC00\uBC88\uD638 \uD655\uC778 \uAC12\uC774 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      return;
    }

    try {
      registerUser({
        name: signupName.trim(),
        id: signupId.trim(),
        password: signupPassword,
      });

      setMessage(
        "\uD68C\uC6D0\uAC00\uC785\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4. \uB85C\uADF8\uC778\uD574\uC8FC\uC138\uC694."
      );
      setActiveTab("login");
      setSignupName("");
      setSignupId("");
      setSignupPassword("");
      setSignupPasswordCheck("");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const handleLogin = (event) => {
    event.preventDefault();

    const user = loginUser(loginId.trim(), loginPassword);

    if (!user) {
      setMessage(
        "\uC544\uC774\uB514 \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4."
      );
      return;
    }

    navigate("/service");
  };

  return (
    <div className="auth-page">
      <div className="auth-background-shape auth-shape-1"></div>
      <div className="auth-background-shape auth-shape-2"></div>

      <div className="auth-layout">
        <section className="auth-brand-panel">
          <div className="auth-brand-badge">AI Advertising Risk Analyzer</div>
          <h1 className="auth-brand-title">
            {"\uD5C8\uC704\u00B7\uACFC\uC7A5 \uAD11\uACE0\uB97C"}
            <br />
            {"\uB354 \uBA85\uD655\uD558\uAC8C \uD655\uC778\uD558\uC138\uC694"}
          </h1>
          <p className="auth-brand-description">
            {
              "\uAD11\uACE0 \uBB38\uAD6C, URL, \uC774\uBBF8\uC9C0\uB97C \uC785\uB825\uD558\uBA74 \uD5C8\uC704\u00B7\uACFC\uC7A5 \uAC00\uB2A5\uC131\uC774 \uC788\uB294 \uD45C\uD604\uC744 \uD0D0\uC9C0\uD558\uACE0 \uADFC\uAC70\uB97C \uD568\uAED8 \uBCF4\uC5EC\uC8FC\uB294 \uBD84\uC11D \uC11C\uBE44\uC2A4\uC785\uB2C8\uB2E4."
            }
          </p>

          <div className="auth-feature-list">
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              {"\uAD11\uACE0 \uBB38\uAD6C, URL, \uC774\uBBF8\uC9C0 \uBD84\uC11D \uC9C0\uC6D0"}
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              {"\uC758\uC2EC \uACB0\uACFC \uC694\uC57D\uACFC \uC0C1\uC138 \uADFC\uAC70 \uD655\uC778"}
            </div>
            <div className="auth-feature-item">
              <span className="auth-feature-dot"></span>
              {"\uAC1C\uC778 \uAE30\uC900 \uBD84\uC11D \uC774\uB825 \uC800\uC7A5"}
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
                {"\uB85C\uADF8\uC778"}
              </button>
              <button
                className={`auth-tab-button ${activeTab === "signup" ? "active" : ""}`}
                onClick={() => {
                  setActiveTab("signup");
                  setMessage("");
                }}
              >
                {"\uD68C\uC6D0\uAC00\uC785"}
              </button>
            </div>

            <div className="auth-form-header">
              <h2>
                {activeTab === "login"
                  ? "\uB85C\uADF8\uC778"
                  : "\uD68C\uC6D0\uAC00\uC785"}
              </h2>
              <p>
                {activeTab === "login"
                  ? "\uC11C\uBE44\uC2A4\uB97C \uC774\uC6A9\uD558\uB824\uBA74 \uB85C\uADF8\uC778\uD574\uC8FC\uC138\uC694."
                  : "\uC0C8 \uACC4\uC815\uC744 \uB9CC\uB4E4\uACE0 \uC11C\uBE44\uC2A4\uB97C \uC2DC\uC791\uD574\uBCF4\uC138\uC694."}
              </p>
            </div>

            {message && <div className="auth-message-box">{message}</div>}

            {activeTab === "login" ? (
              <form className="auth-form" onSubmit={handleLogin}>
                <div className="auth-input-group">
                  <label>{"\uC544\uC774\uB514"}</label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="\uC544\uC774\uB514\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"
                  />
                </div>

                <div className="auth-input-group">
                  <label>{"\uBE44\uBC00\uBC88\uD638"}</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"
                  />
                </div>

                <button type="submit" className="auth-submit-button">
                  {"\uB85C\uADF8\uC778"}
                </button>
              </form>
            ) : (
              <form className="auth-form" onSubmit={handleSignup}>
                <div className="auth-input-group">
                  <label>{"\uC774\uB984"}</label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="\uC774\uB984\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694"
                  />
                </div>

                <div className="auth-input-group">
                  <label>{"\uC544\uC774\uB514"}</label>
                  <input
                    type="text"
                    value={signupId}
                    onChange={(e) => setSignupId(e.target.value)}
                    placeholder="\uC544\uC774\uB514\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"
                  />
                </div>

                <div className="auth-input-group">
                  <label>{"\uBE44\uBC00\uBC88\uD638"}</label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="\uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694"
                  />
                </div>

                <div className="auth-input-group">
                  <label>{"\uBE44\uBC00\uBC88\uD638 \uD655\uC778"}</label>
                  <input
                    type="password"
                    value={signupPasswordCheck}
                    onChange={(e) => setSignupPasswordCheck(e.target.value)}
                    placeholder="\uBE44\uBC00\uBC88\uD638\uB97C \uD55C \uBC88 \uB354 \uC785\uB825\uD574\uC8FC\uC138\uC694"
                  />
                </div>

                <button type="submit" className="auth-submit-button">
                  {"\uD68C\uC6D0\uAC00\uC785"}
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
