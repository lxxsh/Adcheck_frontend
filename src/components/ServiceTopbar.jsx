import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentNickname, logout } from "../api";

function ServiceTopbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const nickname = getCurrentNickname();
  const isServicePage = location.pathname === "/service";
  const isMyPage = location.pathname === "/mypage";

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="service-topbar">
      <div className="service-topbar-left">
        <Link to="/service" className="service-logo-link">
          <div className="service-logo">딱 걸렸어!</div>
        </Link>
        <div className="service-user-text">
          {nickname ? `${nickname}님 환영합니다` : "환영합니다"}
        </div>
      </div>

      <div className="service-topbar-actions">
        {!isServicePage && (
          <Link to="/service" className="service-secondary-link">
            메인
          </Link>
        )}
        {!isMyPage && (
          <Link to="/mypage" className="service-secondary-link">
            마이페이지
          </Link>
        )}
        <button className="service-logout-button" onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default ServiceTopbar;
