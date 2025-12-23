import { Navigate, Outlet } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { auth } from "../../firebase";
import { refreshUser } from "../../redux/features/authSlice";
import toast from "react-hot-toast";

export const ProtectedRoute = () => {
  const { user, userType, loading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (auth.currentUser) {
      dispatch(refreshUser());
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    toast.error("Please log in first.");
    return <Navigate to="/login" replace />;
  }

  if (userType === "primary" && !user.emailVerified) {
    toast.error("Please verify your email before accessing the dashboard.");
    return <Navigate to="/verify-email" replace />;
  }


  return <Outlet />;
};