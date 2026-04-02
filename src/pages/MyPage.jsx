import { useState } from "react";
import ServiceTopbar from "../components/ServiceTopbar";
import {
  getCurrentUser,
  updateCurrentUserProfile,
} from "../utils/userStore";

function MyPage() {
  const currentUser = getCurrentUser();
  const [name, setName] = useState(currentUser?.name || "");
  const [id, setId] = useState(currentUser?.id || "");
  const [password, setPassword] = useState(currentUser?.password || "");
  const [passwordCheck, setPasswordCheck] = useState(currentUser?.password || "");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim() || !id.trim() || !password.trim() || !passwordCheck.trim()) {
      setMessage("\uBAA8\uB4E0 \uD56D\uBAA9\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694.");
      return;
    }

    if (password !== passwordCheck) {
      setMessage("\uBE44\uBC00\uBC88\uD638 \uD655\uC778 \uAC12\uC774 \uC77C\uCE58\uD558\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.");
      return;
    }

    try {
      updateCurrentUserProfile({
        name: name.trim(),
        id: id.trim(),
        password,
      });
      setMessage(
        "\uD68C\uC6D0 \uC815\uBCF4\uAC00 \uC5C5\uB370\uC774\uD2B8\uB418\uC5C8\uC2B5\uB2C8\uB2E4."
      );
    } catch (error) {
      setMessage(error.message);
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
                <h2 className="section-title">
                  {"\uD68C\uC6D0 \uC815\uBCF4 \uAD00\uB9AC"}
                </h2>
              </div>
            </div>

            <p className="mypage-description">
              {
                "\uD604\uC7AC \uB85C\uADF8\uC778\uD55C \uACC4\uC815 \uC815\uBCF4\uB97C \uD655\uC778\uD558\uACE0 \uB098\uC911\uC5D0\uB3C4 \uC218\uC815\uD560 \uC218 \uC788\uB3C4\uB85D \uC900\uBE44\uD574\uB454 \uD398\uC774\uC9C0\uC785\uB2C8\uB2E4."
              }
            </p>

            {message && <div className="auth-message-box">{message}</div>}

            <form className="mypage-form" onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <label>{"\uC774\uB984"}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <label>{"\uC544\uC774\uB514"}</label>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <label>{"\uBE44\uBC00\uBC88\uD638"}</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="auth-input-group">
                <label>{"\uBE44\uBC00\uBC88\uD638 \uD655\uC778"}</label>
                <input
                  type="password"
                  value={passwordCheck}
                  onChange={(e) => setPasswordCheck(e.target.value)}
                />
              </div>

              <div className="mypage-meta-grid">
                <div className="mypage-meta-box">
                  <div className="detail-title small">
                    {"\uD604\uC7AC \uBD84\uC11D \uC774\uB825 \uD0A4"}
                  </div>
                  <div className="mypage-meta-value">
                    {currentUser?.id || "-"}
                  </div>
                </div>
                <div className="mypage-meta-box">
                  <div className="detail-title small">
                    {"\uACC4\uC815 \uC0C1\uD0DC"}
                  </div>
                  <div className="mypage-meta-value">
                    {"\uB85C\uCEEC \uC800\uC7A5\uC18C \uAE30\uBC18 \uD14C\uC2A4\uD2B8 \uACC4\uC815"}
                  </div>
                </div>
              </div>

              <div className="action-row">
                <button type="submit" className="analyze-button">
                  {"\uC815\uBCF4 \uC800\uC7A5"}
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
