import React, { useState, useEffect } from "react";
import { Page } from "../../../data/index.js";
import {
  LayoutDashboard,
  User,
  Building,
  Users,
  FileText,
  LogOut,
  X,
  Building2,
  ShoppingCart,
  Receipt,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";
import {
  clearAuthState,
  signOutUser,
} from "../../../redux/features/authSlice.js";
import { useDispatch } from "react-redux";
import { AnimatePresence, motion } from "motion/react";

const VouchritLogo = () => (
  <motion.img
    src="/logo.png"
    alt="Vouchrit Logo"
    className="h-9 w-9 flex-shrink-0 object-contain rounded-full"
    whileHover={{ rotate: 10, scale: 1.1 }}
    transition={{ type: "spring", stiffness: 300 }}
  />
);

const NavItem = ({
  page,
  activePage,
  setActivePage,
  children,
  isCollapsed,
  onClick,
}) => {
  const isActive = activePage === page;
  const handleClick = () => {
    if (onClick) {
      onClick(page);
    } else {
      setActivePage(page);
    }
  };

  return (
    <motion.li
      onClick={handleClick}
      className={`relative flex items-center p-3 my-1.5 cursor-pointer rounded-xl group select-none z-10 ${
        isActive
          ? "text-v-text-primary"
          : "text-v-text-secondary hover:text-v-text-primary"
      }`}
      whileTap={{ scale: 0.96 }}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav-pill"
          className="absolute inset-0 bg-gradient-to-r from-v-accent/20 to-v-accent/5 rounded-xl border border-v-accent/20 shadow-[0_0_20px_rgba(45,212,191,0.15)]"
          initial={false}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}

      {!isActive && (
        <div className="absolute inset-0 rounded-xl bg-v-glass-hover opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div
        className={`relative z-10 flex-shrink-0 transition-colors duration-300 ${
          isActive ? "text-v-accent" : ""
        }`}
      >
        {children}
      </div>
      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: "auto" }}
            exit={{ opacity: 0, x: -10, width: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="ml-4 font-medium whitespace-nowrap overflow-hidden relative z-10"
          >
            {page}
          </motion.span>
        )}
      </AnimatePresence>

      {isActive && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0.5 top-1/2 -translate-y-1/2 h-8 w-1 bg-v-accent rounded-full"
        />
      )}
    </motion.li>
  );
};

export const Sidebar = ({
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
  isTallyConnected,
  activeCompany,
  onFeatureNavigation,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [isTablet, setIsTablet] = useState(
    window.innerWidth >= 768 && window.innerWidth < 1024
  );

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isCollapsed = isTablet;

  const handleFeatureClick = (page) => {
    if (activeCompany && onFeatureNavigation) {
      onFeatureNavigation(page, activeCompany);
    } else {
      setActivePage(Page.TallyDashboard);
    }
  };
  const handleLogout = async () => {
    try {
      await dispatch(signOutUser()).unwrap();
      dispatch(clearAuthState());
      toast.success("See you next time!");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed.");
    }
  };

  const navItemConfig = {
    activePage,
    setActivePage,
    isCollapsed,
  };

  const sidebarVariants = {
    mobileClosed: { x: "-100%" },
    mobileOpen: { x: "0%" },
    desktop: {
      width: isCollapsed ? "5rem" : "18rem",
      x: "0%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const getVariant = () => {
    if (!isDesktop && !isTablet) return isOpen ? "mobileOpen" : "mobileClosed";
    return "desktop";
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isDesktop && !isTablet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        variants={sidebarVariants}
        initial="mobileClosed"
        animate={getVariant()}
        id="main-sidebar"
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-black/30 backdrop-blur-xl border-r border-white/5
          shadow-[4px_0_24px_-12px_rgba(0,0,0,0.5)]
        `}
      >
        <div
          className={`flex items-center h-20 px-5 relative mb-2 ${
            isCollapsed ? "justify-center" : ""
          }`}
        >
          <Link to="/" onClick={() => setIsOpen(false)}>
            <VouchritLogo />
          </Link>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ delay: 0.1 }}
                className="ml-3 flex flex-col"
              >
                <span className="text-xl font-bold text-v-text-primary tracking-tight">
                  Sulekhanan
                </span>
                <span className="text-[10px] text-v-text-secondary uppercase tracking-widest font-semibold">
                  Workspace
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 p-2 text-v-text-secondary hover:text-white md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

        <nav className="flex-grow px-3 overflow-y-auto scrollbar-hide">
          <ul className="space-y-1">
            {isTallyConnected ? (
              <>
                <div
                  className={`px-3 py-2 text-xs font-semibold text-v-accent/80 uppercase tracking-wider ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  Tally Sync
                </div>
                <NavItem page={Page.TallyDashboard} {...navItemConfig}>
                  <LayoutDashboard size={22} />
                </NavItem>

                <NavItem
                  page={Page.Banking}
                  {...navItemConfig}
                  onClick={() => handleFeatureClick(Page.Banking)}
                >
                  <Building2 size={22} />
                </NavItem>

                <NavItem
                  page={Page.Purchase}
                  {...navItemConfig}
                  onClick={() => handleFeatureClick(Page.Purchase)}
                >
                  <ShoppingCart size={22} />
                </NavItem>
                <NavItem
                  page={Page.Sales}
                  {...navItemConfig}
                  onClick={() => handleFeatureClick(Page.Sales)}
                >
                  <Receipt size={22} />
                </NavItem>
              </>
            ) : (
              <>
                <div
                  className={`px-3 py-2 text-xs font-semibold text-v-text-secondary/50 uppercase tracking-wider ${
                    isCollapsed ? "hidden" : "block"
                  }`}
                >
                  Main Menu
                </div>
                <NavItem page={Page.Dashboard} {...navItemConfig}>
                  <LayoutDashboard size={22} />
                </NavItem>
                <NavItem page={Page.PersonalInfo} {...navItemConfig}>
                  <User size={22} />
                </NavItem>
                <NavItem page={Page.CompanyInfo} {...navItemConfig}>
                  <Building size={22} />
                </NavItem>
                <NavItem page={Page.UserManagement} {...navItemConfig}>
                  <Users size={22} />
                </NavItem>
                <NavItem page={Page.MyPlans} {...navItemConfig}>
                  <FileText size={22} />
                </NavItem>
              </>
            )}
          </ul>
        </nav>
        <div className="p-3 mt-auto">
          <div className="bg-gradient-to-t from-white/5 to-transparent rounded-xl p-1">
            <motion.div
              onClick={handleLogout}
              whileTap={{ scale: 0.96 }}
              whileHover={{ backgroundColor: "rgba(255, 99, 99, 0.1)" }}
              className={`
                flex items-center p-3 cursor-pointer rounded-lg 
                text-v-text-secondary hover:text-red-400 transition-colors
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <LogOut size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="ml-4 font-medium whitespace-nowrap overflow-hidden"
                  >
                    Log Out
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
