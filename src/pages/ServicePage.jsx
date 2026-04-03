import { useNavigate } from "react-router-dom";
import Home from "./Home";

function ServicePage() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    navigate("/auth");
  };

  return (
    <div>
      <div className="service-topbar">
        <div className="service-topbar-left">
          <div className="service-logo">딱 걸렸어!</div>
          <div className="service-user-text">
            {currentUser ? `${currentUser.name}님 환영합니다` : "환영합니다"}
          </div>
        </div>

        <button className="service-logout-button" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <Home />
    </div>
  );
}

export default ServicePage;