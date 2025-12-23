import React from "react";
import { Zap } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { useTallyStatus } from "../../../hooks/useTallyStatus";
import { setTallyConnected } from "../../../redux/features/dashboardSlice";

export const TallyHeader = () => {
  const dispatch = useDispatch();
  const { isTallyConnected } = useSelector((state) => state.dashboard);
  const { pollTallyStatus } = useTallyStatus(2000);

  const handleTallyToggle = () => {
    dispatch(setTallyConnected(!isTallyConnected));
    pollTallyStatus();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative z-20 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 pt-2 gap-4"
    >
      <div className="flex flex-col">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
        >
          Tally Web{" "}
          <span className="bg-gradient-to-r from-fuchsia-400 to-purple-600 bg-clip-text text-transparent">
            Connector
          </span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-gray-400 text-sm mt-1 font-medium"
        >
          Manage your Tally integration seamlessly
        </motion.p>
      </div>

      <motion.button
        onClick={handleTallyToggle}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        id="connect-tally"
        className={`
          relative overflow-hidden cursor-pointer group px-5 py-2.5 rounded-xl font-bold text-sm flex items-center transition-all duration-300 shadow-lg border border-white/10 whitespace-nowrap
          ${
            isTallyConnected
              ? "bg-gradient-to-r from-red-500/10 to-red-900/20 text-red-400 border-red-500/20 shadow-red-900/10"
              : "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
          }
        `}
      >
        {!isTallyConnected && (
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />
        )}

        <Zap
          size={18}
          className={`mr-2 transition-colors ${
            isTallyConnected ? "fill-current" : "fill-black text-black"
          }`}
        />
        <span className="relative z-20">
          {isTallyConnected ? "Disconnect Tally" : "Connect Tally"}
        </span>
      </motion.button>

      <style jsx>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.header>
  );
};