import React, { useState } from "react";
import { Search, HelpCircle, Youtube, Menu, Zap, User } from "lucide-react";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";

export const DashboardHeader = ({
  onMenuClick,
  onTallyToggle,
  isTallyConnected,
}) => {
  const {
    user: { email, displayName, photoURL },
  } = useSelector((state) => state.auth);

  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      id="welcome-header"
      className="relative z-20 flex flex-col md:flex-row items-start md:items-center justify-between pb-6 pt-2"
    >
      <div className="flex items-center w-full md:w-auto mb-6 md:mb-0">
        <button
          onClick={onMenuClick}
          className="md:hidden mr-4 p-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 border border-white/5 transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex flex-col">
          <motion.h1 
            className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-2"
          >
            <span>Welcome,</span>
            <span className="bg-gradient-to-r from-fuchsia-400 to-purple-600 bg-clip-text text-transparent truncate max-w-[200px] sm:max-w-md">
              {displayName?.split(" ")[0]}
            </span>
            <motion.span 
              animate={{ rotate: [0, 14, -8, 14, -4, 10, 0, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 5 }}
              className="origin-bottom-right inline-block"
            >
              👋
            </motion.span>
          </motion.h1>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Let's automate your VAT compliance today.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
        
        <motion.button
          onClick={onTallyToggle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
           id="connect-tally"
          className={`
            relative overflow-hidden group cursor-pointer px-5 py-2.5 rounded-xl font-bold text-sm flex items-center transition-all duration-300 shadow-lg border border-white/10
            ${isTallyConnected
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
            className={`mr-2 transition-colors ${isTallyConnected ? "fill-current" : "fill-black text-black"}`} 
          />
          <span className="relative z-20">
            {isTallyConnected ? "Disconnect Tally" : "Connect Tally"}
          </span>
        </motion.button>

        <div className="relative hidden lg:block group">
          <motion.div
            animate={{ width: isSearchFocused ? 280 : 240 }}
            className={`relative flex items-center bg-black/20 border transition-colors duration-300 rounded-xl overflow-hidden
              ${isSearchFocused ? "border-purple-500/50 bg-black/40 shadow-[0_0_15px_rgba(168,85,247,0.15)]" : "border-white/10 hover:border-white/20"}
            `}
          >
            <Search
              size={18}
              className={`absolute left-3.5 transition-colors ${isSearchFocused ? "text-purple-400" : "text-gray-500"}`}
            />
            <input
              type="text"
              placeholder="Search..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="bg-transparent text-sm text-white placeholder-gray-500 py-2.5 pl-10 pr-4 w-full focus:outline-none"
            />
            <div className={`absolute right-3 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] font-medium text-gray-500 transition-opacity ${isSearchFocused ? 'opacity-0' : 'opacity-100'}`}>
              /
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.1)" }} className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-white transition-colors">
            <HelpCircle size={20} />
            </motion.button>
            <motion.button whileHover={{ scale: 1.1, backgroundColor: "rgba(220, 38, 38, 0.15)" }} className="hidden md:flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-red-500 transition-colors">
            <Youtube size={20} />
            </motion.button>
        </div>

        <div className="h-8 w-px bg-white/10 hidden sm:block mx-1" />

        <div className="flex items-center gap-3 pl-1">
          <motion.div 
            className="relative group cursor-pointer"
            whileHover={{ scale: 1.05 }}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full opacity-0 group-hover:opacity-100 blur transition duration-500" />
            
            <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-[#0d0c22] ring-2 ring-white/10 group-hover:ring-transparent transition-all">
                {photoURL ? (
                <img
                    src={photoURL}
                    alt="User"
                    className="h-full w-full object-cover"
                />
                ) : (
                <div className="h-full w-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white">
                    <User size={20} />
                </div>
                )}
            </div>

            <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 border-2 border-[#0d0c22] rounded-full z-10"></div>
          </motion.div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none mb-1">{displayName}</p>
            <p className="text-[11px] text-gray-400 font-medium tracking-wide">{email}</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};