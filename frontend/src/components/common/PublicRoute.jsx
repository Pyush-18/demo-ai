import { Navigate, Outlet } from "react-router";
import { useSelector } from "react-redux";

export const PublicRoute = () => {
  const { user } = useSelector((state) => state.auth);
  if (user && user.emailVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
