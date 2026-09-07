import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../AuthContext";

function RootAuthBoundary() {
  const { currentUser, isLoading, isSuccess } = useAuthContext();

  const location = useLocation();

  if (isLoading) {
    return <div className="spinner">Loading application...</div>;
  }

  if (!isSuccess) {
    return <div className="error">Failed to initialize application.</div>;
  }

  const isAuthRoute = location.pathname === "/auth";

  // If NOT logged in, force them to /auth (unless they are already there)
  if (!currentUser) {
    return isAuthRoute ? (
      <Outlet />
    ) : (
      <Navigate to="/auth" replace state={{ from: location }} />
    );
  }

  // If LOGGED in, prevent them from accessing /auth
  if (isAuthRoute) {
    return <Navigate to="/" replace />;
  }

  // Logged in and accessing a valid app route
  return <Outlet />;
}
export default RootAuthBoundary;
