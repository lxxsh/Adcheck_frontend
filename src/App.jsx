import { Navigate, Route, Routes } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MyPage from "./pages/MyPage";
import ServicePage from "./pages/ServicePage";
import { isLoggedIn } from "./api";
import "./App.css";

function PrivateRoute({ children }) {
  return isLoggedIn() ? children : <Navigate to="/auth" replace />;
}

function PublicRoute({ children }) {
  return isLoggedIn() ? <Navigate to="/service" replace /> : children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/service" replace />} />
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthPage />
          </PublicRoute>
        }
      />
      <Route path="/service" element={<ServicePage />} />
      <Route
        path="/mypage"
        element={
          <PrivateRoute>
            <MyPage />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;

