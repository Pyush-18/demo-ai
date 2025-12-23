import { AlertTriangle, Menu, Search, RefreshCw } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { GradientButton } from "../../ui/GradientButton";
import { CompanyCard } from "./CompanyCard";
import { useEffect, useState, useRef } from "react";
import { SyncCompanyModal } from "./SyncCompanyModal";
import { ReviewErrorsModal } from "./ReviewErrorsModal";
import { Page } from "../../../data";
import { useDispatch, useSelector } from "react-redux";
import { useTally } from "../../../hooks/useTally";
import toast from "react-hot-toast";
import { nanoid } from "@reduxjs/toolkit";
import {
  addActiveCompany,
  removeAvailableCompany,
  setAvailableCompanies,
  addCompany,
  addSalesFile,
  addSalesInvoice,
  addPurchaseFile,
  addPurchaseInvoice,
  setPrefetchedTallyData,
  setSelectedCompany,
} from "../../../redux/features/tallySlice";
import { useUserContextSync } from "../../../hooks/useUserContextSync";
import { useTallyData } from "../../../hooks/useTallyData";
import {
  sendTallyRequest,
  generateFetchLedgersXML,
  generateFetchStockItemsXML,
  parseLedgers,
  parseStockItems,
  xmlToJson,
} from "../../../utils/tallyUtils";
import { savePrefetchedDataToFirebase } from "../../../config/firebaseService";

const CONNECTIVITY_DATA = {
  tallyConnector: {
    status: "Connected",
    details: "IP: localhost | Port: 9000",
  },
  vouchritServer: { status: "Connected" },
};

const LedgerFetcher = ({ companyId, onComplete }) => {
  const { fetchAllAccounts, hasLedgers } = useTallyData(companyId);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (companyId && !hasFetched.current && !hasLedgers) {
      hasFetched.current = true;
      fetchAllAccounts(false).then(() => {
        if (onComplete) onComplete();
      });
    } else if (hasLedgers && onComplete) {
      onComplete();
    }
  }, [companyId, fetchAllAccounts, onComplete, hasLedgers]);

  return null;
};

const DashboardContent = ({ onFeatureClick }) => {
  const dispatch = useDispatch();
  const { isTallyConnected } = useSelector((state) => state.dashboard);
  const { activeCompanies, availableCompanies, files } = useSelector(
    (state) => state.tally
  );
  const { user } = useSelector((state) => state.auth);

  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCompanyId, setPendingCompanyId] = useState(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [fetchedCompanies, setFetchedCompanies] = useState(new Set());

  const { fetchDataFromTally } = useTally();
  const { activeUserId } = useUserContextSync();

  const errorCompanies = activeCompanies?.filter(
    (c) => c.status === "Needs Review"
  );
  const errorCount = errorCompanies?.length || 0;

  const handleSyncNewCompany = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);

      const tallyData = await fetchDataFromTally();

      if (!tallyData?.companyName) {
        toast.error("No company found in Tally response.");
        return;
      }

      const companyName = tallyData.companyName; 

      const existingCompany = files?.find(
        (c) => c.name.toLowerCase() === companyName.toLowerCase()
      );

      let companyId;

      if (existingCompany) {
        companyId = existingCompany.id;
        
      } else {
        companyId = nanoid();
       

        dispatch(
          addCompany({
            id: companyId,
            name: companyName,
          })
        );

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      const alreadyActive = activeCompanies?.find(
        (c) =>
          c.id === companyId ||
          c.name.toLowerCase() === companyName.toLowerCase()
      );

      const alreadyAvailable = availableCompanies?.find(
        (c) =>
          c.id === companyId ||
          c.name.toLowerCase() === companyName.toLowerCase()
      );

      if (!alreadyAvailable && !alreadyActive) {
        dispatch(
          setAvailableCompanies([
            {
              id: companyId,
              name: companyName,
              period: tallyData.companyPeriod || "FY 2024-25",
              status: "Tally Prime",
              uploadedBy: user?.displayName || "System",
            },
          ])
        );

        await new Promise((resolve) => setTimeout(resolve, 100));
      }


      setIsPrefetching(true);

      try {
       
        const [parsedLedgers, parsedStock] = await Promise.all([
          (async () => {
            const ledgerXML = generateFetchLedgersXML(companyName);
            const ledgerResponse = await sendTallyRequest(ledgerXML);
            const ledgerJson = xmlToJson(ledgerResponse);
            const result = parseLedgers(ledgerJson);
   
            return result;
          })(),
          (async () => {
            const stockXML = generateFetchStockItemsXML(companyName); 
            const stockResponse = await sendTallyRequest(stockXML);
            const stockJson = xmlToJson(stockResponse);
            const result = parseStockItems(stockJson);
            return result;
          })(),
        ]);

        if (!parsedLedgers || !parsedStock) {
          throw new Error("Failed to parse ledgers or stock items");
        }


        dispatch(
          setPrefetchedTallyData({
            companyId: companyId,
            ledgers: parsedLedgers,
            stockItems: parsedStock,
          })
        );

        const firebaseSaveResult = await savePrefetchedDataToFirebase(
          companyId,
          parsedLedgers,
          parsedStock
        );

        if (!firebaseSaveResult.success) {
    
          toast.error("Data fetched but failed to save to Firebase");
        }


        await new Promise((resolve) => setTimeout(resolve, 200));

        setFetchedCompanies((prev) => new Set([...prev, companyId]));

        toast.success(`${companyName} synced successfully!`);

        setIsSyncModalOpen(true);
      } catch (error) {
        toast.error("Failed to load data: " + error.message);
      } finally {
        setIsPrefetching(false);
      }

      setPendingCompanyId(companyId);
    } catch (err) {
      toast.error(err.message || "Failed to fetch data from Tally.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLedgerFetchComplete = () => {
  
    setIsSyncModalOpen(true);
    setPendingCompanyId(null);
  };

  const handleMapCompany = (companyId) => {
    const companyToMap = availableCompanies.find((c) => c.id === companyId);
    if (!companyToMap) {
      toast.error("Company not found");
      return;
    }

    const now = new Date();
    const formattedDate = `${now.getDate()} ${now.toLocaleString("default", {
      month: "short",
    })} ${now.getFullYear()}`;

    const newActiveCompany = {
      ...companyToMap,
      syncDate: formattedDate,
      status: "Active",
      features: ["Sales", "Purchase", "Banking"],
    };

    dispatch(addActiveCompany(newActiveCompany));
    dispatch(removeAvailableCompany(companyId));

  
    dispatch(setSelectedCompany(newActiveCompany));

    setIsSyncModalOpen(false);
    toast.success(`${companyToMap.name} added to active companies!`);
  };

  const handleReviewErrors = () => setIsErrorModalOpen(true);

  const handleSalesClick = (company) => {
  
    dispatch(setSelectedCompany(company));
    onFeatureClick(Page.Sales, company);
  };

  const handlePurchaseClick = (company) => {
    dispatch(setSelectedCompany(company));
    onFeatureClick(Page.Purchase, company);
  };

  const handleBankingClick = (company) => {
    dispatch(setSelectedCompany(company));
    onFeatureClick(Page.Banking, company);
  };
  const prefetchTallyDataForCompany = async (company) => {
    if (fetchedCompanies.has(company.id)) {
      return;
    }

    setIsPrefetching(true);

    try {
      const [parsedLedgers, parsedStock] = await Promise.all([
        (async () => {
          const ledgerXML = generateFetchLedgersXML(company.name); 
          const ledgerResponse = await sendTallyRequest(ledgerXML);
          const ledgerJson = xmlToJson(ledgerResponse);
          return parseLedgers(ledgerJson);
        })(),
        (async () => {
          const stockXML = generateFetchStockItemsXML(company.name); 
          const stockResponse = await sendTallyRequest(stockXML);
          const stockJson = xmlToJson(stockResponse);
          return parseStockItems(stockJson);
        })(),
      ]);

      dispatch(
        setPrefetchedTallyData({
          companyId: company.id,
          ledgers: parsedLedgers,
          stockItems: parsedStock,
        })
      );

      setFetchedCompanies((prev) => new Set([...prev, company.id]));
      setIsPrefetching(false);
    } catch (error) {
      setIsPrefetching(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow =
      isSyncModalOpen || isErrorModalOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSyncModalOpen, isErrorModalOpen]);

  return (
    <div className="text-white font-sans min-h-screen p-8 rounded-2xl bg-gray-950">
      <StatusBar
        isTallyConnected={isTallyConnected}
        connectivity={CONNECTIVITY_DATA}
      />

      {pendingCompanyId && (
        <LedgerFetcher
          companyId={pendingCompanyId}
          onComplete={handleLedgerFetchComplete}
        />
      )}

      <div
        id="company-management-header"
        className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-indigo-400/20"
      >
        <h2 className="text-3xl font-bold text-white mb-6">
          Tally Company Management
        </h2>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-64 space-y-4 flex-shrink-0">
            <GradientButton
              id="sync-new-company"
              icon={RefreshCw}
              onClick={handleSyncNewCompany}
              disabled={isSyncing || pendingCompanyId !== null || isPrefetching}
            >
              {isSyncing
                ? "Syncing..."
                : pendingCompanyId
                ? "Fetching Ledgers..."
                : isPrefetching
                ? "Loading Data..."
                : "Sync New Company"}
            </GradientButton>

            <button
              id="review-errors"
              onClick={handleReviewErrors}
              className="w-full py-3 text-indigo-400 hover:text-white transition-colors duration-200 rounded-xl border border-indigo-400/50 hover:bg-indigo-400/10 font-semibold"
            >
              <span className="flex items-center justify-center space-x-2">
                <AlertTriangle size={20} /> Review Errors ({errorCount})
              </span>
            </button>

            <p className="text-sm text-gray-500 pt-4">
              Need help connecting Tally? View our{" "}
              <a
                href="#"
                className="text-fuchsia-400 hover:underline transition-colors"
              >
                Setup Guide
              </a>
              .
            </p>
          </div>

          <div className="flex-1">
            <div
              id="active-companies"
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4"
            >
              <h3 className="text-xl font-semibold text-white">
                Active Companies ({activeCompanies?.length || 0})
              </h3>
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder="Search Companies..."
                  className="bg-gray-700/50 border border-gray-600 text-white pl-10 pr-4 py-2 rounded-xl w-full focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition"
                />
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {activeCompanies?.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onBankingClick={handleBankingClick}
                  onPurchaseClick={handlePurchaseClick}
                  onSalesClick={handleSalesClick}
                />
              ))}

              <div
                id="add-new-company"
                className="bg-gray-800/60 p-5 rounded-2xl shadow-lg border border-dashed border-gray-600 flex flex-col items-center justify-center text-center text-gray-500 cursor-pointer hover:border-fuchsia-400 transition-colors duration-300"
                onClick={handleSyncNewCompany}
              >
                <Menu size={32} className="mb-2" />
                <p className="font-semibold">Map/Add New Company</p>
                <p className="text-xs">Click to scan your Tally data.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SyncCompanyModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        companies={availableCompanies}
        onMap={handleMapCompany}
      />

      <ReviewErrorsModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        companies={errorCompanies}
      />
    </div>
  );
};

export default DashboardContent;
