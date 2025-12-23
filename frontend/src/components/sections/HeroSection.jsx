import { ArrowRight, FileText, Zap } from "lucide-react";
import { NeonButton, GlassCard } from "../index.js";
import { useNavigate } from "react-router";

export const HeroSection = () => {
    const navigate = useNavigate()
  return (
    <section
      id="home"
      className="pt-24 pb-32 mt-20 relative z-10 overflow-hidden"
    >
      <div className="text-center max-w-6xl mx-auto px-4">
        <div className="inline-block text-sm font-semibold tracking-widest uppercase text-purple-300 bg-purple-900/50 px-4 py-1 rounded-full border border-purple-600/50 mb-4 shadow-xl">
          Instant Polished Compliance
        </div>
        <h1 className="text-6xl lg:text-7xl font-extrabold text-white max-w-5xl mx-auto leading-tight mb-6">
          Stop manually calculating.{" "}
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            Automate your VAT Returns
          </span>{" "}
          instantly.
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
          Shulekhanan simplifies VAT and corporation tax compliance for small
          businesses and accountants using AI-driven accuracy.
        </p>
        <div className="flex justify-center space-x-4">
          <NeonButton onClick={() => navigate("/signup")} primary>Get Started Free</NeonButton>
          <NeonButton>Book a Demo</NeonButton>
        </div>

        <div className="mt-20 w-full flex justify-center">
          <GlassCard className="max-w-4xl w-full p-8 lg:p-12 relative overflow-hidden">
            <div className="flex items-center justify-between mb-6 border-b border-purple-500/20 pb-4">
              <div className="flex items-center">
                <FileText className="w-6 h-6 text-pink-400 mr-3" />
                <h2 className="text-2xl font-semibold text-white">
                  Shulekhanan Compliance Engine
                </h2>
              </div>
              <span className="text-sm text-gray-400">Ready in 30 seconds</span>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-purple-900/50 border border-purple-700/50 text-left">
                  <p className="text-4xl font-bold text-pink-400">99.9%</p>
                  <p className="text-sm text-gray-300">
                    Accuracy improvement compared to manual reporting.
                  </p>
                </div>
                <ul className="space-y-3 text-left text-gray-300">
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-pink-400 mr-2" />{" "}
                    Instantly calculates liability
                  </li>
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-pink-400 mr-2" />{" "}
                    Reduces audit risk
                  </li>
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-pink-400 mr-2" />{" "}
                    Handles complex multi-rate scenarios
                  </li>
                  <li className="flex items-center text-sm">
                    <ArrowRight className="w-4 h-4 text-pink-400 mr-2" />{" "}
                    Secure, HMRC-compliant filing
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <GlassCard className="p-4">
                  <div className="flex items-center text-gray-400 mb-2">
                    <Zap className="w-4 h-4 mr-2 text-purple-400" />
                    <span className="text-sm">
                      Enter your accounting data or connect API
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      placeholder="Enter file URL"
                      className="w-full bg-purple-900/70 text-gray-200 border border-pink-500/50 rounded-lg py-3 px-4 focus:ring-2 focus:ring-pink-500 outline-none"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-300 transition">
                      <Zap className="w-5 h-5" />
                    </button>
                  </div>
                </GlassCard>

                <div className="p-4 rounded-lg bg-black/30 border border-gray-700/50 text-sm text-gray-400 text-left">
                  <p>
                    Your VAT report will be ready to review, edit, and submit
                    within seconds. Stop the spreadsheets.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};
