import React, { useEffect, useRef } from "react";
import { Home, LogOut, User, Users, ArrowLeftRight } from "lucide-react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { clearAuthState, signOutUser, switchToPrimaryUser } from "../../redux/features/authSlice";
import toast from "react-hot-toast";

const Popover = ({ onClose }) => {
  const { user, activeUserName, isPrimaryUser, currentSubUser } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const popoverRef = useRef();

  const displayName = activeUserName || user?.displayName || "User";
  const displayEmail = currentSubUser?.email || user?.email;
  const displayPhoto = currentSubUser?.photoURL || user?.photoURL;
  const displayMobile = currentSubUser?.mobile;

  const handleLogout = async () => {
    try {
      await dispatch(signOutUser()).unwrap();
      dispatch(clearAuthState());
      toast.success("You've been logged out successfully!");
      navigate("/");
    } catch (error) {
      toast.error("Logout failed. Try again.");
    }
  };

  const handleSwitchToPrimary = async () => {
    try {
      await dispatch(switchToPrimaryUser()).unwrap();
      onClose();
    } catch (error) {
      console.error("Switch user error:", error);
      toast.error("Failed to switch user.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute top-14 -right-6 mt-2 w-80 rounded-xl shadow-2xl shadow-purple-900/50 bg-black z-[100] border border-purple-600/50 text-purple-100"
    >
     
      <div className="p-4 flex items-center border-b border-purple-800/50">
        <div className="relative flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white text-xl font-bold">
            {displayPhoto ? (
              <img
                src={displayPhoto}
                alt="User Avatar"
                className="h-full w-full object-cover rounded-full shadow-md"
              />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>
         
          {!isPrimaryUser && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black animate-pulse" />
          )}
        </div>
        <div className="ml-3 flex-grow overflow-hidden">
          <p className="text-lg font-semibold truncate">{displayName}</p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-purple-300">
              {isPrimaryUser ? "Primary Account" : "Sub-User"}
            </p>
            {!isPrimaryUser && (
              <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-[10px] rounded-full font-medium">
                ACTIVE
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-purple-800/50 bg-purple-950/20">
        {displayEmail && (
          <p className="text-xs text-purple-300 truncate">
            📧 {displayEmail}
          </p>
        )}
      </div>

      <div className="py-2 px-2">
        <Link
          to="/dashboard"
          onClick={onClose}
          className="group flex items-center w-full px-3 py-3 text-sm rounded-lg 
                     transition-all duration-300 
                     hover:bg-purple-900/70 hover:text-pink-400 
                     hover:shadow-lg hover:shadow-pink-500/10"
        >
          <Home className="h-5 w-5 mr-3 text-purple-400 group-hover:text-pink-400 transition-colors duration-300" />
          Dashboard
        </Link>


        {!isPrimaryUser && (
          <button
            onClick={handleSwitchToPrimary}
            className="group flex items-center w-full px-3 py-3 text-sm rounded-lg
                       transition-all duration-300 
                       hover:bg-blue-900/70 hover:text-blue-400
                       hover:shadow-lg hover:shadow-blue-500/10
                       border-t border-purple-800/50 mt-2 pt-3"
          >
            <ArrowLeftRight className="h-5 w-5 mr-3 text-blue-400 group-hover:text-blue-300 transition-colors duration-300" />
            Switch to Primary User
          </button>
        )}

        <button
          onClick={handleLogout}
          className="group flex items-center w-full px-3 py-3 text-sm text-left rounded-lg
                     transition-all duration-300 
                     border-t border-purple-800/50 mt-2 pt-3
                     hover:bg-red-900/70 hover:text-red-400
                     hover:shadow-lg hover:shadow-red-500/10"
        >
          <LogOut className="h-5 w-5 mr-3 text-purple-400 group-hover:text-red-400 transition-colors duration-300" />
          Sign Out
        </button>
      </div>

      {!isPrimaryUser && (
        <div className="px-4 py-2 border-t border-purple-800/50 bg-purple-950/30">
          <p className="text-[10px] text-purple-400 text-center">
            You're working as a sub-user. Some features may be limited.
          </p>
        </div>
      )}
    </div>
  );
};

export default Popover;