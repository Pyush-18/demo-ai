import React, { useState } from "react";
import { OtpInput } from "../../index.js";
import axios from "axios";
import toast from "react-hot-toast";
import { useLocation } from "react-router";
import { Loader, UserPlus } from "lucide-react";

export const OtpVerificationForm = ({ onVerify }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/verify-otp`,
        {
          email,
          otp,
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        onVerify();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "❌ Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtpHandler = async() => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/auth/resend-otp`,
        {
          email,
        }
      )
      if(response.data.success){
        toast.success(response.data.message)
      }
    } catch (error) {
      toast.error(error.response.data.message)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-v-text-primary">
          Enter Verification Code
        </h1>
        <p className="text-v-text-secondary mt-2">
          We've sent a 6-digit code to your email.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="flex-grow flex flex-col items-center space-y-8"
      >
        <OtpInput length={6} onComplete={setOtp} />

        <div>
          <p className="text-sm text-v-text-secondary">
            Didn't receive the code?{" "}
            <button
            onClick={resendOtpHandler}
              type="button"
              className="font-semibold text-v-accent hover:underline focus:outline-none"
            >
              Resend Code
            </button>
          </p>
        </div>

        <div className="mt-auto w-full max-w-sm pt-6">
          <button
            type="submit"
            disabled={otp.length !== 6}
            className="w-full bg-v-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-v-accent/80 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <Loader className="w-5 h-5 animate-spin mr-2" />
            )}
            {loading ? "Verifying Account..." : "Verify"}
          </button>
        </div>
      </form>
    </div>
  );
};
