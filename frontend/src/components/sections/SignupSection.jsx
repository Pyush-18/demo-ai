import { Key, Loader, Mail, UserPlus } from "lucide-react";
import { useState } from "react";
import { AuthLayout, NeonButton } from "../index.js";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { signUpUser } from "../../redux/features/authSlice.js";

export const SignUpSection = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (!acceptedTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      const result = await dispatch(signUpUser({ email, password }));
      if (signUpUser.fulfilled.match(result)) {
        navigate(`/onboarding?email=${email}`);
      } else {
        console.error("Signup failed:", result.payload);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error.message || "Signup failed");
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      imageUrl="https://i.pinimg.com/474x/58/62/d3/5862d3f6164d8e20648f18fe2038e833.jpg"
      imageText="Experience the future of financial compliance and secure your data instantly."
    >
      <form onSubmit={handleSignup} className="space-y-6">
        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Email address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full p-4 pl-12 rounded-xl bg-black/40 border border-purple-600/50 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">
            Create Password
          </label>
          <div className="relative">
            <input
              type="password"
              value={password}
              minLength="6"
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full p-4 pl-12 rounded-xl bg-black/40 border border-purple-600/50 text-white placeholder-gray-500 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
            />
            <Key className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
          </div>
        </div>

        <div className="flex items-start">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={acceptedTerms}
            onChange={() => setAcceptedTerms(!acceptedTerms)}
            required
            className="mt-1 w-4 h-4 text-pink-600 bg-gray-900 border-gray-700 rounded focus:ring-pink-500"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
            I agree to the{" "}
            <span className="text-pink-400 hover:text-pink-300 cursor-pointer">
              Terms of Service
            </span>{" "}
            and{" "}
            <span className="text-pink-400 hover:text-pink-300 cursor-pointer">
              Privacy Policy
            </span>
          </label>
        </div>

        <NeonButton
          type="submit"
          primary
          disabled={loading}
          className="w-full py-4 mt-6 flex justify-center items-center"
        >
          {loading ? (
            <Loader className="w-5 h-5 animate-spin mr-2" />
          ) : (
            <UserPlus className="w-5 h-5 mr-2" />
          )}
          {loading ? "Creating Account..." : "Sign Up"}
        </NeonButton>
      </form>

      <div className="mt-8 text-center text-gray-400">
        Already have an account?
        <button
          onClick={() => navigate("/login")}
          className="text-pink-400 font-semibold ml-2 hover:text-pink-300 transition"
        >
          Sign In
        </button>
      </div>
    </AuthLayout>
  );
};
