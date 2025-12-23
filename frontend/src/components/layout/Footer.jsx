import { Github, Instagram, Linkedin, X } from "lucide-react";
import { Link } from "react-router";
import {motion} from "motion/react"

export const Footer = () => {
  return (
    <footer className="relative bg-zinc-950 text-gray-300 border-t border-zinc-800 font-sans rounded-tl-4xl rounded-tr-4xl">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="col-span-1">
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

          <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-sm">
            Shulekhanan is your AI-powered solution for streamlined finance
            operations and intelligent voucher management.
          </p>

          <div>
            <h5 className="text-white font-medium mb-3 text-sm">
              Follow our Social Media Pages
            </h5>
            <div className="flex space-x-4">
              {[
                { icon: <X size={16} />, label: "X (Twitter)" },
                { icon: <Instagram size={16} />, label: "Instagram" },
                { icon: <Linkedin size={16} />, label: "LinkedIn" },
                { icon: <Github size={16} />, label: "GitHub" },
              ].map((item, index) => (
                <a
                  key={index}
                  href="#"
                  aria-label={item.label}
                  className="hover:text-purple-400 transition-colors p-2 bg-gray-800 rounded-full"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-1 flex justify-between flex-wrap md:flex-nowrap gap-10">
  
          <div className="flex-1 min-w-[120px]">
            <h4 className="text-white font-semibold mb-4 border-b border-purple-800/50 pb-2">
              Menu
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/"
                  className="hover:text-purple-400 transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-purple-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-purple-400 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/demo"
                  className="hover:text-purple-400 transition-colors"
                >
                  Book a Demo
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex-1 min-w-[120px]">
            <h4 className="text-white font-semibold mb-4 border-b border-purple-800/50 pb-2">
              Business
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  to="/pricing"
                  className="hover:text-purple-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-purple-400 transition-colors"
                >
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-purple-400 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/refund"
                  className="hover:text-purple-400 transition-colors"
                >
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800 py-6 text-sm text-zinc-500 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-center items-center">
          <p className="text-center">
            © 2025 Zenfi Technologies Private Limited
          </p>
        </div>
      </div>
    </footer>
  );
};
