import { useState } from "react";
import { useNavigate } from "react-router";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { saveUserProfile, setCompanyInfo } from "../../redux/features/authSlice.js";
import {
  CompanyInfoForm,
  PersonalInfoForm,
  Stepper,
  Illustration,
  VerifyEmail,
} from "../index.js";
import { auth } from "../../firebase.js";

export const Onboarding = () => {
  const [step, setStep] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { personalInfo } = useSelector((state) => state.auth);

  const nextStep = () => setStep((prev) => prev + 1);

  const handleFinalSubmit = async (data) => {
    dispatch(setCompanyInfo(data));

    const finalData = { ...personalInfo, ...data };

    const user = auth.currentUser;
    if (user) {
      await dispatch(
        saveUserProfile({
          uid: user.uid,
          personalInfo,
          companyInfo: data,
        })
      );
    }

    toast.success("Onboarding complete! Please verify your email.");
    nextStep();
  };

  const handleVerified = () => {
    toast.success("Email verified successfully!");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-black via-[#0a0014] to-[#1b0033]">
      <main className="w-full max-w-6xl bg-v-glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="hidden lg:flex items-center justify-center p-12 bg-gradient-to-b from-v-dark/50 to-black/60 border-r border-white/10">
            <Illustration />
          </div>

          <div className="p-8 sm:p-12 flex flex-col bg-black/30">
            <Stepper currentStep={step} totalSteps={3} />
            <div className="mt-10 flex-grow">
              {step === 1 && <PersonalInfoForm onNext={nextStep} />}
              {step === 2 && <CompanyInfoForm onSubmit={handleFinalSubmit} />}
              {step === 3 && <VerifyEmail onVerified={handleVerified} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
