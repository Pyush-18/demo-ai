import { motion } from "motion/react";
import guideImg from "/guideImg.png";

export const CustomToolTip = ({ 
  title, 
  content, 
  isLast, 
  onNext, 
  onPrev, 
  onSkip,
  currentIndex,
  totalSteps 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="relative w-[320px] bg-gradient-to-br from-[#1a0b2e]/95 via-[#2d1557]/95 to-[#09021a]/95 border border-fuchsia-500/30 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(168,85,247,0.5)] overflow-hidden"
      style={{ pointerEvents: 'auto' }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-fuchsia-500/10 to-indigo-500/10 blur-2xl"
        animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative p-5 flex flex-col items-start space-y-3">
        <div className="flex justify-between w-full items-center">
          <span className="text-xs uppercase tracking-wider text-fuchsia-300 font-semibold">
            {title || "Welcome Tip"}
          </span>
          <span className="text-[10px] text-gray-400 bg-gray-800/40 px-2 py-1 rounded-full">
            Step {currentIndex + 1} of {totalSteps}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <motion.img
            src={guideImg}
            alt="Guide"
            className="w-24 h-24 self-center drop-shadow-[0_0_25px_#a855f7]"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />

          <p className="text-sm text-gray-300 leading-snug flex-1">
            {content}
          </p>
        </div>

        <div className="flex justify-between w-full mt-3 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSkip();
            }}
            className="text-xs text-gray-400 hover:text-fuchsia-300 transition cursor-pointer"
          >
            Skip Tour
          </button>
          
          <div className="flex gap-2">
            {currentIndex > 0 && (
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gray-700/50 text-white text-sm px-4 py-2 rounded-full font-semibold hover:bg-gray-600/50 transition cursor-pointer"
              >
                Back
              </motion.button>
            )}
            
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white text-sm px-5 py-2 rounded-full font-semibold shadow-[0_0_15px_rgba(168,85,247,0.6)] cursor-pointer"
            >
              {isLast ? "Finish" : "Next"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};