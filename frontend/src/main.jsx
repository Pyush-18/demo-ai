import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter, Routes, Route } from "react-router";
import {
  AboutUs,
  ContactUs,
  PricingSection,
  Home,
  LoginSection,
  SignUpSection,
  DashboardLayout,
  Onboarding,
} from "./components/index.js";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { persistor, store } from "./redux/store/store.js";
import { ProtectedRoute } from "./components/common/ProtectedRoute.jsx";
import { PublicRoute } from "./components/common/PublicRoute.jsx";
import { PersistGate } from "redux-persist/integration/react";
import BankingDashboard from "./components/pages/banking_dashboard/BankingDashboard.jsx";
import HistoryPage from "./components/pages/banking_dashboard/HistoryPage.jsx";
import SalesPurchaseSection from "./components/pages/tally dashboard/components/SalesPurchaseSection.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PersistGate loading={null} persistor={persistor}>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="about" element={<AboutUs />} />
              <Route path="contact" element={<ContactUs />} />
              <Route path="pricing" element={<PricingSection />} />
            </Route>

            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginSection />} />
              <Route path="/signup" element={<SignUpSection />} />
              <Route path="/onboarding" element={<Onboarding />} />
            </Route>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardLayout />} />
            <Route path="/banking-dashboard" element={<BankingDashboard />}/>
            <Route path="/sales-purchase/dashboard" element={<SalesPurchaseSection />}/>
            <Route path="/history" element={<HistoryPage />}/>
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="bottom-right"/>
      </Provider>
    </PersistGate>
  </StrictMode>
);
