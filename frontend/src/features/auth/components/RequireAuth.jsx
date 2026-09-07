import { Navigate, Outlet } from "react-router-dom";
import { useGetCurrentUser } from "../hooks/useAuth";

function RequireAuth() {
  const { data: currentUser, isLoading, isSuccess } = useGetCurrentUser();

  if (isLoading) return <div>Loading...</div>;

  if (!currentUser || !isSuccess) return <Navigate to="/auth" replace />;

  return <Outlet />;
}

export default RequireAuth;
