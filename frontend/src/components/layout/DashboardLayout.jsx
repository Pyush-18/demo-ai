import { useEffect, useRef, useState } from "react";
import { TourProvider, useTour } from "@reactour/tour";
import "@reactour/tour/dist/index.css";
import { dashboardSteps, Page, tallyDashboardSteps } from "../../data/index.js";
import {
  CompanyInfo,
  Dashboard,
  DashboardHeader,
  MyPlans,
  PersonalInfo,
  UserManagement,
  Sidebar,
  TallyHeader,
} from "../index.js";

import DashboardContent from "../pages/tally dashboard/DashboardContent.jsx";
import { BankingPage } from "../pages/tally dashboard/components/BankingPage.jsx";
import { PurchasePage } from "../pages/tally dashboard/components/PurchasePage.jsx";
import { SalesPage } from "../pages/tally dashboard/components/SalesPage.jsx";
import { useDispatch, useSelector } from "react-redux";
import {
  resetActiveCompany,
  setActiveCompany,
  setActivePage,
  setSidebarOpen,
} from "../../redux/features/dashboardSlice.js";
import { useTallyConnection } from "../../hooks/useTallyConnection.js";
import { motion } from "motion/react";
import { CustomToolTip } from "../ui/CustomToolTip.jsx";

const convertToTourSteps = (steps) => {
  const totalSteps = steps.length;

  return steps.map((step, index) => ({
    selector: step.target,
    content: ({ setCurrentStep, currentStep, setIsOpen }) => (
      <CustomToolTip
        title={step.title || "Tip"}
        content={step.content}
        isLast={currentStep === totalSteps - 1}
        onNext={() => {
          if (currentStep === totalSteps - 1) {
            setIsOpen(false);
          } else {
            setCurrentStep((s) => s + 1);
          }
        }}
        onPrev={() => setCurrentStep((s) => s - 1)}
        onSkip={() => setIsOpen(false)}
        currentIndex={currentStep}
        totalSteps={totalSteps}
      />
    ),
    position: step.placement || "bottom",
  }));
};

function DashboardContent_Inner({ tourKeyRef }) {
  const { isTallyConnected, toggleTallyConnection } = useTallyConnection();
  const dispatch = useDispatch();
  const { activePage, isSidebarOpen, activeCompany } = useSelector(
    (state) => state.dashboard
  );
  const prevTallyConnected = useRef(isTallyConnected);
  const { setIsOpen, setSteps, setCurrentStep } = useTour();

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getPaddingLeft = () => {
    if (windowWidth >= 1024) return "18rem";
    if (windowWidth >= 768) return "5rem";
    return "0rem";
  };

  useEffect(() => {
    if (prevTallyConnected.current !== isTallyConnected) {
      if (isTallyConnected) {
        const isTallyFeaturePage = [
          Page.Banking,
          Page.Purchase,
          Page.Sales,
        ].includes(activePage);
        if (!isTallyFeaturePage) {
          dispatch(setActivePage(Page.TallyDashboard));
        }
      } else {
        dispatch(resetActiveCompany());
        dispatch(setActivePage(Page.Dashboard));
      }
    }
    prevTallyConnected.current = isTallyConnected;
  }, [isTallyConnected, dispatch, activePage]);

  useEffect(() => {
    const tourKey =
      activePage === Page.TallyDashboard
        ? "hasSeenTallyTour"
        : "hasSeenMainTour";

    const hasSeenTour = localStorage.getItem(tourKey);

    if (hasSeenTour === "true") {
      return;
    }

    tourKeyRef.current = tourKey;

    const stepsToUse =
      activePage === Page.TallyDashboard ? tallyDashboardSteps : dashboardSteps;

    const tourSteps = convertToTourSteps(stepsToUse);
    setSteps(tourSteps);

    const timer = setTimeout(() => {
      setCurrentStep(0);
      setIsOpen(true);
    }, 1500);

    return () => {
      clearTimeout(timer);
    };
  }, [activePage, setIsOpen, setSteps, setCurrentStep, tourKeyRef]);

  const handleFeatureClick = (page, company) => {
    dispatch(setActiveCompany(company));
    dispatch(setActivePage(page));
  };

  const handleFeatureNavigation = (page, company) => {
    dispatch(setActiveCompany(company));
    dispatch(setActivePage(page));
  };
  
  const handleBackToTallyDashboard = () => {
    dispatch(resetActiveCompany());
    dispatch(setActivePage(Page.TallyDashboard));
  };

  const effectivePage =
    isTallyConnected && activePage === Page.Dashboard
      ? Page.TallyDashboard
      : activePage;

  const isTallyFeaturePage = [Page.Banking, Page.Purchase, Page.Sales].includes(
    effectivePage
  );

  const renderContent = () => {
    if (isTallyFeaturePage) {
      const PageComponent =
        effectivePage === Page.Banking
          ? BankingPage
          : effectivePage === Page.Purchase
          ? PurchasePage
          : SalesPage;

      return (
        <PageComponent
          company={activeCompany}
          onBack={handleBackToTallyDashboard}
        />
      );
    }

    switch (effectivePage) {
      case Page.TallyDashboard:
        return <DashboardContent onFeatureClick={handleFeatureClick} />;
      case Page.Dashboard:
        return <Dashboard setActivePage={setActivePage} />;
      case Page.PersonalInfo:
        return <PersonalInfo />;
      case Page.CompanyInfo:
        return <CompanyInfo />;
      case Page.UserManagement:
        return <UserManagement />;
      case Page.MyPlans:
        return <MyPlans />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  const HeaderComponent = isTallyConnected ? TallyHeader : DashboardHeader;

  return (
    <div
      className="text-v-text-primary min-h-screen font-sans"
      style={{
        backgroundColor: "#0d0c22",
        backgroundImage:
          "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }}
    >
      <Sidebar
        activePage={activePage}
        setActivePage={(page) => dispatch(setActivePage(page))}
        isOpen={isSidebarOpen}
        setIsOpen={(open) => dispatch(setSidebarOpen(open))}
        isTallyConnected={isTallyConnected}
        activeCompany={activeCompany}
        onFeatureNavigation={handleFeatureNavigation}
      />

      <motion.div
        initial={false}
        animate={{ paddingLeft: getPaddingLeft() }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="min-h-screen transition-all"
      >
        <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <HeaderComponent
            onMenuClick={() => dispatch(setSidebarOpen(!isSidebarOpen))}
            onTallyToggle={toggleTallyConnection}
            isTallyConnected={isTallyConnected}
          />
          <div className="mt-8">{renderContent()}</div>
        </main>
      </motion.div>
    </div>
  );
}

export function DashboardLayout() {
  const currentTourKeyRef = useRef("");

  return (
    <TourProvider
      steps={[]}
      styles={{
        popover: (base) => ({
          ...base,
          backgroundColor: "transparent",
          borderRadius: 16,
          padding: 0,
          boxShadow: "none",
          maxWidth: "none",
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        maskWrapper: (base) => ({
          ...base,
          color: "rgba(0, 0, 0, 0.75)",
        }),
        badge: (base) => ({
          ...base,
          display: "none",
        }),
        close: (base) => ({
          ...base,
          display: "none",
        }),
      }}
      padding={10}
      showNavigation={false}
      showBadge={false}
      showCloseButton={false}
      disableInteraction={false}
      scrollSmooth={true}
      onClickMask={({ setIsOpen }) => {}}
      beforeClose={() => {
        if (currentTourKeyRef.current) {
          localStorage.setItem(currentTourKeyRef.current, "true");
        }
        return true;
      }}
    >
      <DashboardContent_Inner tourKeyRef={currentTourKeyRef} />
    </TourProvider>
  );
}