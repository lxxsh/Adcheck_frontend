import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../utils/userStore";

function ServiceTopbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = getCurrentUser();
  const isServicePage = location.pathname === "/service";
  const isMyPage = location.pathname === "/mypage";

  const handleLogout = () => {
    logoutUser();
    navigate("/auth");
  };

  return (
    <div className="service-topbar">
      <div className="service-topbar-left">
        <Link to="/service" className="service-logo-link">
          <div className="service-logo">{"\uB531 \uAC78\uB838\uC5B4!"}</div>
        </Link>
        <div className="service-user-text">
          {currentUser
            ? `${currentUser.name}\uB2D8 \uD658\uC601\uD569\uB2C8\uB2E4`
            : "\uD658\uC601\uD569\uB2C8\uB2E4"}
        </div>
      </div>

      <div className="service-topbar-actions">
        {!isServicePage && (
          <Link to="/service" className="service-secondary-link">
            {"\uBA54\uC778"}
          </Link>
        )}
        {!isMyPage && (
          <Link to="/mypage" className="service-secondary-link">
            {"\uB9C8\uC774\uD398\uC774\uC9C0"}
          </Link>
        )}
        <button className="service-logout-button" onClick={handleLogout}>
          {"\uB85C\uADF8\uC544\uC6C3"}
        </button>
      </div>
    </div>
  );
}

export default ServiceTopbar;
