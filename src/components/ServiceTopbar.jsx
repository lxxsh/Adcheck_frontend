import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentNickname, isLoggedIn, logout } from "../api";

function ServiceTopbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const loggedIn = isLoggedIn();
  const nickname = getCurrentNickname();

  const isHomePage =
    location.pathname === "/" || location.pathname === "/service";
  const isMyPage = location.pathname === "/mypage";
  const isAuthPage = location.pathname === "/auth";

  const handleLogout = () => {
    logout();
  };

  const handleMoveAuth = (tab = "login") => {
    navigate("/auth", { state: { tab } });
  };

  const handleMoveHome = () => {
    if (isHomePage) {
      window.location.href = "/";
      return;
    }

    navigate("/");
  };

  return (
    <div className="service-topbar">
      <div className="service-topbar-left">
        <button className="service-logo-link" onClick={handleMoveHome}>
          <div className="service-logo">딱 걸렸어!</div>
        </button>
        <div className="service-user-text">
          {loggedIn && nickname ? `${nickname}님 환영합니다` : "환영합니다"}
        </div>
      </div>

      <div className="service-topbar-actions">
        {!isHomePage && (
          <Link to="/" className="service-secondary-link">
            메인
          </Link>
        )}

        {loggedIn ? (
          <>
            {!isMyPage && (
              <Link to="/mypage" className="service-secondary-link">
                마이페이지
              </Link>
            )}
            <button className="service-logout-button" onClick={handleLogout}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            {!isAuthPage && (
              <button
                className="service-secondary-button service-auth-action"
                onClick={() => handleMoveAuth("login")}
              >
                로그인
              </button>
            )}
            {!isAuthPage && (
              <button
                className="service-logout-button service-auth-action"
                onClick={() => handleMoveAuth("signup")}
              >
                회원가입
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ServiceTopbar;
