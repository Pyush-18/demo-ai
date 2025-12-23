import { NeonButton } from "../index.js";
import { navigationItems } from "../../data/index.js";
import { LogIn, User } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { useSelector } from "react-redux";
import Popover from "../ui/PopOver.jsx";
import {motion} from "motion/react"

export const Header = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full flex justify-between items-center p-6 lg:px-12 backdrop-blur-lg bg-black/20 z-50 border-b border-purple-500/20">
      <Link to="/" className="group flex items-center gap-3 no-underline">
      <motion.div 
        className="relative flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div className="absolute inset-0 bg-purple-500/30 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="relative p-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl overflow-hidden">
          <img 
            src="/logo.png" 
            alt="sulekhanan" 
            className="w-9 h-9 object-contain rounded-lg"
          />
        </div>
      </motion.div>
      <div className="flex flex-col leading-none">
        <motion.span 
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-pink-200 to-purple-400"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          Sulekhanan
        </motion.span>
        
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="h-[2px] w-full bg-gradient-to-r from-pink-500/0 via-pink-500/50 to-purple-500/0 mt-1 origin-left"
        />
      </div>
    </Link>
      <div className="hidden lg:flex space-x-10 text-gray-300 font-medium">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="hover:text-pink-400 transition duration-150"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <div className="relative flex items-center">
        {user ? (
          <button
            onClick={() => setIsPopoverOpen((prev) => !prev)}
            className="flex items-center justify-center w-10 h-10 rounded-full 
                       bg-gradient-to-br from-purple-600 to-pink-500 text-white 
                       hover:ring-2 ring-pink-400 transition duration-150"
          >
             {user?.photoURL ? (
              <img
                src={user?.photoURL}
                alt="User Avatar"
                className="h-full w-full object-cover rounded-full shadow-md hover:shadow-purple-600"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </button>
        ) : (
          <NeonButton onClick={() => navigate("/login")}>
            <LogIn className="w-4 h-4 mr-2 inline" />
            Login
          </NeonButton>
        )}

        {user && isPopoverOpen && <Popover onClose={() => setIsPopoverOpen(false)}/>}
      </div>
    </nav>
  );
};
