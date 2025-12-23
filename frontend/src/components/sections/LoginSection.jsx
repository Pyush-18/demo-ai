import { Key, Loader, LogIn, Mail } from "lucide-react";
import { AuthLayout, NeonButton } from "../index.js";
import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/features/authSlice.js";

export const LoginSection = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await dispatch(
        loginUser({
          email,
          password,
        })
      ).unwrap();

      if (result && result.user) {
        const userType = result.userType;
        
        if (userType === "primary") {
          toast.success(`Welcome back, ${result.user.displayName || "Primary User"}!`);
        } else if (userType === "sub-user") {
          const subUserName = result.subUserData?.name || result.user.displayName;
          toast.success(`Welcome back, ${subUserName}!`);
        }

        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login Error:", error);

      let message = "Login failed. Please try again.";

      if (typeof error === 'string') {
        if (error.includes("auth/user-not-found")) {
          message = "No user found with this email.";
        } else if (error.includes("auth/wrong-password") || error.includes("auth/invalid-credential")) {
          message = "Incorrect email or password.";
        } else if (error.includes("auth/too-many-requests")) {
          message = "Too many attempts. Please try again later.";
        } else if (error.includes("auth/invalid-email")) {
          message = "Invalid email format.";
        } else if (error.includes("email")) {
          message = "Please verify your email before logging in.";
        } else {
          message = error;
        }
      } else if (error?.code) {
        switch (error.code) {
          case "auth/user-not-found":
            message = "No user found with this email.";
            break;
          case "auth/wrong-password":
          case "auth/invalid-credential":
            message = "Incorrect email or password.";
            break;
          case "auth/too-many-requests":
            message = "Too many attempts. Please try again later.";
            break;
          case "auth/invalid-email":
            message = "Invalid email format.";
            break;
          default:
            message = error.message || "Login failed. Please try again.";
        }
      }

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      imageUrl="https://i.pinimg.com/474x/58/62/d3/5862d3f6164d8e20648f18fe2038e833.jpg"
      imageText="Streamline VAT, GST, and Corporation Tax filing with guaranteed accuracy."
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label
            htmlFor="login-email"
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            Email address
          </label>
          <div className="relative">
            <input
              id="login-email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-black/40 border border-purple-600/50 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
              placeholder="you@example.com"
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div>
          <label
            htmlFor="login-password"
            className="block text-sm font-medium text-gray-400 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <input
              id="login-password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 pl-12 rounded-xl bg-black/40 border border-purple-600/50 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
              placeholder="••••••••"
            />
            <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
          <p className="text-xs text-purple-300">
            💡 Both <strong>Primary Users</strong> and <strong>Sub-Users</strong> can log in using their email and password.
          </p>
        </div>

        <NeonButton
          primary
          type="submit"
          className="w-full py-4 mt-6 flex justify-center items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <LogIn className="w-5 h-5 mr-2" />
          )}
          {isLoading ? "Signing In..." : "Sign In"}
        </NeonButton>
      </form>

      <div className="mt-8 text-center text-gray-400">
        Don't have an account?
        <button
          onClick={() => navigate("/signup")}
          className="text-pink-400 font-semibold ml-2 hover:text-pink-300 transition"
        >
          Create Account
        </button>
      </div>
    </AuthLayout>
  );
};