import { useEffect, useState } from "react";
import { auth } from "../../../firebase";
import { reload } from "firebase/auth";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { refreshUser } from "../../../redux/features/authSlice";

export const VerifyEmail = ({ onVerified }) => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);
  const [checking, setChecking] = useState(false);

  const handleCheckVerification = async () => {
    try {
      setChecking(true);
      await auth.currentUser.reload();
      const result = await dispatch(refreshUser());

      if (refreshUser.fulfilled.match(result)) {
        if (result.payload.emailVerified) {
          toast.success("Email verified successfully!");
          onVerified();
        } else {
          toast.error("Your email is not verified yet.");
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to check verification status.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (user?.emailVerified) {
      onVerified();
    }
  }, [user?.emailVerified, onVerified]);
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-2xl font-bold text-v-text-primary">
        Verify Your Email
      </h1>
      <p className="text-v-text-secondary max-w-md">
        We’ve sent a verification link to your email. Please check your inbox
        and click the link. Once done, click the button below to continue.
      </p>
      <button
        onClick={handleCheckVerification}
        disabled={checking}
        className="bg-v-accent text-white font-semibold py-3 px-6 rounded-lg hover:bg-v-accent/80 transition-colors duration-300 w-full sm:w-auto"
      >
        {checking ? "Checking..." : "I’ve Verified My Email"}
      </button>

      <p className="text-v-text-secondary mt-4 text-sm">
        Once verified, click the button above to continue.
      </p>
    </div>
  );
};
