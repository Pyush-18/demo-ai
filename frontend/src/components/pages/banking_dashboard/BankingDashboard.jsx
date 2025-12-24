import { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  IndianRupee,
  Menu,
  MoveLeft,
  Search,
  Tent,
  Trash2,
  TrendingUp,
  UserRoundCheck,
  Bell,
  Hash,
  Loader,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  addBankingFile,
  bulkUpdateLedger,
  deleteTransaction,
  selectFile,
  setPostingMode,
  setTransactions,
  updateTransactionLedger,
} from "../../../redux/features/tallySlice";
import { useTransactionProcessor } from "../../../hooks/useTransactionProcessor";
import { CustomSelector } from "../../ui/CustomSelector";
import TransactionTableSkeleton from "../../skeleton/TransactionTableSkeleton";
import SpeedyRecommendations from "./SpeedyRecommendations";
const BankingDashboard = () => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [selectedType, setSelectedType] = useState("Ledger");
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [ledgerSelections, setLedgerSelections] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectCount, setSelectCount] = useState("");
  const [deletedHistory, setDeletedHistory] = useState([]);
  const [showSpeedyModal, setShowSpeedyModal] = useState(false);
  const [isPostingToTally, setIsPostingToTally] = useState(false);
  const { files, selectedFileId, selectedCompany, postingMode } = useSelector(
    (state) => state.tally
  );
  const { user } = useSelector((state) => state.auth);
  const { history, savedTransactions } = useSelector((state) => state.tally);
  const activeCompany = selectedCompany || files?.[0] || null;
  const companyId = activeCompany?.id;
  const currentCompany = files.find((c) => c.id === companyId);
  const currentFile =
    currentCompany?.bankingFiles?.find((f) => f.id === selectedFileId) || null;
  const transactions = currentFile?.transactions
    ? Array.isArray(currentFile.transactions)
      ? currentFile.transactions
      : Object.values(currentFile.transactions).flat()
    : [];
  const ledgers = currentCompany?.ledgers || [];
  const itemsPerPage = 8;
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const totalNotifications = useMemo(() => {
    const map = new Map();
    history?.forEach((tx) => map.set(tx.id, tx));
    savedTransactions?.forEach((tx) => map.set(tx.id, tx));
    return map.size;
  }, [history, savedTransactions]);
  const hasNotifications = totalNotifications > 0;
  const { normalizeTransactions, postApprovedTransactions } =
    useTransactionProcessor(
      transactions,
      currentFile?.selectedLedger,
      postingMode,
      ledgerSelections["bulk"]
    );
  useEffect(() => {
    if (!transactions?.length) return;
    const modalKey = `speedyModalShown_${selectedFileId}`;
    const alreadyShown = localStorage.getItem(modalKey);
    if (alreadyShown) return;
    const speedyCount = transactions.filter(
      (t) => t.status === "Pending" && !t.selectedLedger
    ).length;
    if (speedyCount > 0) {
      setShowSpeedyModal(true);
      localStorage.setItem(modalKey, "true");
    }
  }, [transactions, selectedFileId]);
  useEffect(() => {
    if (!currentFile?.selectedLedger || !transactions?.length) return;
    setLedgerSelections((prev) => {
      const updated = { ...prev };
      let hasChanges = false;
      transactions.forEach((tx) => {
        if (!updated[tx.id] && tx.status === "Resolved" && tx.selectedLedger) {
          updated[tx.id] = tx.selectedLedger;
          hasChanges = true;
        }
      });
      return hasChanges ? updated : prev;
    });
  }, [transactions, currentFile?.selectedLedger]);
  useEffect(() => {
    const modalKey = `speedyModalShown_${selectedFileId}`;
    if (!localStorage.getItem(modalKey)) {
      setShowSpeedyModal(false);
    }
  }, [selectedFileId]);
  useEffect(() => {
    const data = location?.state?.transactions;
    const fileId = location?.state?.id || "unknown-file";
    
    if (currentFile?.id === fileId && currentFile?.transactions?.length > 0) {
      if (!isInitialized) {
        setIsInitialized(true);
      }
      return;
    }
    if (isInitialized) {
      return;
    }
    if (!data || !companyId) {
      return;
    }
    if (!currentFile) {
      dispatch(
        addBankingFile({
          companyId,
          file: {
            id: fileId,
            name: location?.state?.fileName || "Untitled File",
            uploadedBy: user?.displayName || "Admin",
            uploadDate: new Date().toISOString(),
            selectedLedger:
              location?.state?.selectedLedger || location?.state?.bankLedger,
          },
        })
      );
    }
    dispatch(selectFile(fileId));
    const combined = Object.entries(data).flatMap(([category, txs]) => {
      if (Array.isArray(txs)) {
        return txs.map((tx) => ({ ...tx, category }));
      } else if (txs && typeof txs === "object") {
        return [{ ...txs, category }];
      }
      return [];
    });
    const normalized = normalizeTransactions(combined);
    const enriched = normalized.map((tx, index) => ({
      id: index + 1,
      date:
        tx.date instanceof Date ? tx.date.toLocaleDateString("en-GB") : "N/A",
      narration: tx.particulars || "N/A",
      amount: tx.amount || 0,
      type: tx.type,
      displayType: tx.type === "Payment" ? "Dr" : "Cr",
      category: tx.category || "N/A",
      status: "Pending",
      selectedLedger: null,
    }));
    dispatch(
      setTransactions({
        companyId,
        fileId,
        transactions: enriched,
      })
    );
    setIsInitialized(true);
  }, [
    companyId,
    location?.state,
    currentFile,
    isInitialized,
    dispatch,
    normalizeTransactions,
    user?.displayName,
  ]);
  useEffect(() => {
    if (isInitialized && location?.state?.transactions) {
      navigate(location.pathname, {
        replace: true,
        state: {
          id: location.state.id,
          fileName: location.state.fileName,
          selectedLedger: location.state.selectedLedger,
          bankLedger: location.state.bankLedger,
          dateRange: location.state.dateRange,
        },
      });
    }
  }, [isInitialized, location.pathname, location.state, navigate]);
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedTab === "pending" && t.status !== "Pending") return false;
      if (selectedTab === "resolved" && t.status !== "Resolved") return false;
      if (selectedTab === "deleted" && t.status !== "Deleted") return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.narration?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q) ||
          t.type?.toLowerCase().includes(q) ||
          t.amount?.toString().includes(q)
        );
      }
      return true;
    });
  }, [transactions, selectedTab, searchQuery]);
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);
  useEffect(() => {
    document.body.style.overflow = isOpenModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpenModal]);
  useEffect(() => {
    const newTotalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  }, [filteredTransactions.length, currentPage]);
  const statistics = useMemo(() => {
    const activeTransactions = transactions?.filter(
      (t) => t.status !== "Deleted"
    );
    const totalDebit = activeTransactions
      .filter((t) => t.type === "Payment")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const totalCredit = activeTransactions
      .filter((t) => t.type === "Receipt")
      .reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const speedyCount = transactions.filter(
      (t) => t.status === "Pending" && !t.selectedLedger
    ).length;
    const resolvedCount = transactions.filter(
      (t) => t.status === "Resolved"
    ).length;
    const pendingCount = transactions.filter(
      (t) => t.status === "Pending"
    ).length;
    const totalCount = transactions.length;
    return {
      totalDebit,
      totalCredit,
      speedyCount,
      resolvedCount,
      pendingCount,
      totalCount,
    };
  }, [transactions]);
  const formatAmount = (amt) =>
    "₹" + amt.toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );
  const progressStats = useMemo(
    () => [
      {
        label: "Resolved",
        count: statistics.resolvedCount,
        total: statistics.totalCount,
        percentage:
          statistics.totalCount > 0
            ? Math.round(
                (statistics.resolvedCount / statistics.totalCount) * 100
              )
            : 0,
        color: "#10b981",
      },
      {
        label: "Pending",
        count: statistics.pendingCount,
        total: statistics.totalCount,
        percentage:
          statistics.totalCount > 0
            ? Math.round(
                (statistics.pendingCount / statistics.totalCount) * 100
              )
            : 0,
        color: "#f59e0b",
      },
      {
        label: "Total",
        count: statistics.totalCount,
        total: statistics.totalCount,
        percentage: 100,
        color: "#8b5cf6",
      },
    ],
    [statistics]
  );
  const stats = useMemo(
    () => [
      {
        label: "Total Debit",
        value: formatAmount(statistics.totalDebit),
        icon: TrendingUp,
        color: "from-pink-500 to-purple-500",
      },
      {
        label: "Total Credit",
        value: formatAmount(statistics.totalCredit),
        icon: IndianRupee,
        color: "from-purple-500 to-indigo-500",
      },
      {
        label: "Pending",
        value: statistics.pendingCount.toString(),
        icon: Clock,
        color: "from-indigo-500 to-blue-500",
      },
    ],
    [statistics]
  );
  const ledgerOptions = useMemo(
    () =>
      ledgers?.map((ledger) => ({
        value: ledger,
        label: ledger,
        icon: Tent,
      })) || [],
    [ledgers]
  );
  const VoucherOptions = useMemo(
    () => [
      { value: "Payment", label: "Payment", icon: Tent },
      { value: "Receipt", label: "Receipt", icon: Tent },
      { value: "Contra", label: "Contra", icon: Tent },
    ],
    []
  );

  const handlePostToTally = async () => {
    setIsPostingToTally(true);
    try {
      await postApprovedTransactions();
    } catch (error) {
      toast.error("Failed to post transactions");
    } finally {
      setIsPostingToTally(false);
    }
  };

  const toggleSelectAll = useCallback(() => {
    const allSelectableTransactions = filteredTransactions.filter(
      (tx) => tx.status !== "Deleted"
    );
    const currentPageSelectableTransactions = currentTransactions.filter(
      (tx) => tx.status !== "Deleted"
    );
    let transactionsToSelect;
    if (selectCount && parseInt(selectCount, 10) > 0) {
      const count = Math.min(
        parseInt(selectCount, 10),
        allSelectableTransactions.length
      );
      transactionsToSelect = allSelectableTransactions.slice(0, count);
    } else {
      transactionsToSelect = currentPageSelectableTransactions;
    }
    const idsToSelect = transactionsToSelect.map((tx) => tx.id);
    const allSelected = idsToSelect.every((id) => selectedItems.includes(id));
    if (allSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !idsToSelect.includes(id))
      );
    } else {
      setSelectedItems((prev) => {
        const otherItems = prev.filter((id) => !idsToSelect.includes(id));
        return [...otherItems, ...idsToSelect];
      });
    }
  }, [filteredTransactions, currentTransactions, selectedItems, selectCount]);
  const toggleSelectItem = useCallback((id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);
  const handleLedgerSelect = useCallback(
    (id, value) => {
      setLedgerSelections((prev) => ({
        ...prev,
        [id]: value,
      }));
      if (id !== "bulk") {
        dispatch(
          updateTransactionLedger({
            companyId,
            fileId: selectedFileId,
            transactionId: id,
            selectedLedger: value,
            newStatus: "Resolved",
          })
        );
      }
    },
    [companyId, selectedFileId, dispatch]
  );
  const handleDeleteTransaction = useCallback(
    (transactionId) => {
      const transaction = transactions.find((tx) => tx.id === transactionId);
      if (transaction) {
        setDeletedHistory((prev) => [
          ...prev,
          {
            ...transaction,
            deletedAt: Date.now(),
          },
        ]);
      }
      dispatch(
        deleteTransaction({
          companyId,
          fileId: selectedFileId,
          transactionId,
        })
      );
    },
    [companyId, selectedFileId, dispatch, transactions]
  );
  const handleUndoDelete = useCallback(
    (transactionId) => {
      const deletedTx = deletedHistory.find((tx) => tx.id === transactionId);
      if (!deletedTx) {
        toast.error("Cannot undo: Transaction not found");
        return;
      }
      dispatch(
        updateTransactionLedger({
          companyId,
          fileId: selectedFileId,
          transactionId,
          selectedLedger: deletedTx.selectedLedger || null,
          newStatus: "Pending",
        })
      );
      setDeletedHistory((prev) => prev.filter((tx) => tx.id !== transactionId));
      toast.success("Transaction restored to Pending");
    },
    [deletedHistory, companyId, selectedFileId, dispatch]
  );
  const isHeaderCheckboxChecked = useMemo(() => {
    const allSelectable = filteredTransactions.filter(
      (tx) => tx.status !== "Deleted"
    );
    const currentPageSelectable = currentTransactions.filter(
      (tx) => tx.status !== "Deleted"
    );
    if (currentPageSelectable.length === 0) return false;
    if (selectCount && parseInt(selectCount, 10) > 0) {
      const count = Math.min(parseInt(selectCount, 10), allSelectable.length);
      const transactionsToCheck = allSelectable.slice(0, count);
      return (
        transactionsToCheck.length > 0 &&
        transactionsToCheck.every((tx) => selectedItems.includes(tx.id))
      );
    }
    return currentPageSelectable.every((tx) => selectedItems.includes(tx.id));
  }, [filteredTransactions, currentTransactions, selectedItems, selectCount]);
  const handleBulkDelete = useCallback(() => {
    if (selectedItems.length === 0) return;
    toast.custom((t) => (
      <div className="relative backdrop-blur-xl bg-gradient-to-br from-gray-900/80 via-purple-900/50 to-gray-800/80 border border-purple-700/40 text-white px-6 py-5 rounded-2xl shadow-2xl shadow-purple-900/40 flex flex-col gap-5 max-w-sm mx-auto transition-all duration-300">
        <div className="flex items-center gap-3">
          <svg
            className="w-6 h-6 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.3 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="text-xl font-semibold">Confirm Deletion</span>
        </div>
        <span className="text-gray-300">
          Delete{" "}
          <span className="text-red-400 font-semibold">
            {selectedItems.length}
          </span>{" "}
          transaction(s)?
        </span>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const deletedIds = [...selectedItems];
              const deletedTransactions = transactions.filter((tx) =>
                deletedIds.includes(tx.id)
              );
              setDeletedHistory((prev) => [
                ...prev,
                ...deletedTransactions.map((tx) => ({
                  ...tx,
                  deletedAt: Date.now(),
                })),
              ]);
              deletedIds.forEach((id) => {
                dispatch(
                  deleteTransaction({
                    companyId,
                    fileId: selectedFileId,
                    transactionId: id,
                  })
                );
              });
              toast.dismiss(t.id);
              setSelectedItems([]);
            }}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  }, [
    selectedItems,
    handleDeleteTransaction,
    transactions,
    companyId,
    selectedFileId,
    dispatch,
    handleUndoDelete,
  ]);
  const handleBulkLedgerUpdate = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one transaction");
      return;
    }
    const selectedLedger = ledgerSelections["bulk"];
    if (!selectedLedger) {
      toast.error("Please select a ledger");
      return;
    }
    dispatch(setPostingMode("bulk"));
    dispatch(
      bulkUpdateLedger({
        companyId,
        fileId: selectedFileId,
        transactionIds: selectedItems,
        newLedger: selectedLedger,
        newStatus: "Resolved",
      })
    );
    setLedgerSelections((prev) => {
      const updated = { ...prev };
      selectedItems.forEach((id) => {
        updated[id] = selectedLedger;
      });
      return updated;
    });
    toast.success(`${selectedItems.length} transaction(s) updated`);
    setSelectedItems([]);
  }, [selectedItems, ledgerSelections, companyId, selectedFileId, dispatch]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5 shadow-sm shadow-purple-500/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {}
            <div className="flex items-center gap-6">
              <button className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
                <Menu size={24} />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    {currentCompany?.name}
                    <span className="text-purple-400">Banking</span>
                  </h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span>Dashboard</span>
                  <span className="text-slate-600">/</span>
                  <span className="text-purple-300/90 font-medium">
                    {currentFile?.name}
                  </span>
                </div>
              </div>
            </div>
            {}
            <div className="flex items-center gap-2 sm:gap-4">
              {}
              <div className="flex items-center gap-1 pr-4 border-r border-white/5">
                <Link to="/dashboard">
                  <button className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95">
                    <MoveLeft size={20} />
                  </button>
                </Link>
                <button
                  onClick={() => navigate("/history")}
                  className="relative p-2.5 cursor-pointer rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all active:scale-95 group"
                >
                  <Bell size={20} />
                  {hasNotifications && (
                    <>
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full border border-slate-900 z-10" />
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-pink-500 rounded-full animate-ping opacity-75" />
                    </>
                  )}
                </button>
              </div>
              {}
              <button className="flex items-center gap-3 pl-2 group">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 via-purple-400 to-pink-500 p-[2px]">
                    <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-white font-bold text-sm group-hover:bg-transparent transition-all duration-300">
                      {user?.displayName?.charAt(0) || "A"}
                    </div>
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm font-medium text-slate-200 group-hover:text-purple-300 transition-colors">
                    {user?.displayName || "Admin"}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-full mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.slice(0, 2).map((stat, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}
                    >
                      <stat.icon className="text-white" size={24} />
                    </div>
                  </div>
                  <p className="text-purple-300/70 text-sm mb-2">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 h-full">
              <h3 className="text-purple-200 font-semibold mb-6">
                Transaction Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {progressStats.map((stat, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="relative w-24 h-24 mb-3">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="rgba(139, 92, 246, 0.1)"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke={stat.color}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${
                            2 * Math.PI * 40 * (1 - stat.percentage / 100)
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {stat.percentage}%
                        </span>
                      </div>
                    </div>
                    <p className="text-purple-300/70 text-xs mb-1">
                      {stat.label}
                    </p>
                    <p className="text-purple-100 font-semibold text-lg">
                      {stat.count}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                  Document Information
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between py-3 border-b border-purple-500/10">
                  <span className="text-purple-300/70 text-sm">
                    Bank Ledger
                  </span>
                  <span className="text-purple-100 font-semibold">
                    {currentFile?.selectedLedger || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-3 border-b border-purple-500/10">
                  <span className="text-purple-300/70 text-sm">Date Range</span>
                  <span className="text-purple-100 font-semibold">
                    {location?.state?.dateRange || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-purple-300/70 text-sm">Status</span>
                  <span className="px-4 py-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm">
                    Review
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/30 to-purple-500/30 rounded-2xl blur-xl" />
            <div className="relative bg-gradient-to-br from-pink-500/10 to-purple-500/10 backdrop-blur-sm border border-pink-500/30 rounded-2xl p-6 h-full flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
                  <TrendingUp className="text-white" size={24} />
                </div>
                <div className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 text-xs font-bold">
                  AI
                </div>
              </div>
              <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-200 to-purple-200 mb-2">
                Speedy Recommendations
              </h3>
              <p className="text-pink-300/80 text-sm mb-4">
                AI-powered insights
              </p>
              <div className="flex items-end justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-5xl font-bold text-white">
                    {statistics.speedyCount > 0 ? (
                      statistics.speedyCount
                    ) : (
                      <UserRoundCheck size={24} />
                    )}
                  </p>
                  <p className="text-pink-300/70 text-sm">
                    {statistics.speedyCount > 0 ? "Pending" : "Completed"}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpenModal(true)}
                  disabled={statistics.speedyCount === 0}
                  className={`px-4 py-2 rounded-lg text-white flex items-center gap-2 font-semibold ${
                    statistics.speedyCount > 0
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                      : "bg-gray-700/50 cursor-not-allowed opacity-60"
                  }`}
                >
                  Review
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-purple-500/20">
            <h3 className="text-lg font-bold text-purple-200 mr-2">
              Bulk Actions
            </h3>
            <select
              className="px-4 py-2 rounded-lg bg-slate-800/80 text-purple-100 border border-purple-500/30 focus:border-purple-500 focus:outline-none min-w-[140px]"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="Ledger">Ledger</option>
              <option value="Voucher Type">Voucher Type</option>
            </select>
            <div className="flex-grow ">
              <CustomSelector
                options={
                  selectedType === "Ledger" ? ledgerOptions : VoucherOptions
                }
                selectedValue={ledgerSelections["bulk"] || ""}
                onSelect={(value) => handleLedgerSelect("bulk", value)}
                placeholder={`Select ${selectedType}`}
              />
            </div>
            <button
              onClick={handleBulkLedgerUpdate}
              disabled={selectedItems.length === 0 || !ledgerSelections["bulk"]}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                selectedItems.length > 0 && ledgerSelections["bulk"]
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-600/30"
                  : "bg-gray-600/30 text-gray-400 cursor-not-allowed border border-gray-500/20"
              }`}
            >
              Apply to Selected ({selectedItems.length})
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              {["all", "pending", "resolved", "deleted"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTab === tab
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      : "bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                disabled={selectedItems.length === 0}
                className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
                  selectedItems.length > 0
                    ? "bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20"
                    : "bg-gray-800/40 border-gray-700 text-gray-500 cursor-not-allowed"
                }`}
              >
                <Trash2 size={18} />
                <span className="hidden sm:inline">Delete</span>
              </button>
              <button
                onClick={handlePostToTally}
                disabled={isPostingToTally}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  isPostingToTally
                    ? "bg-purple-500/50 cursor-not-allowed"
                    : "bg-gradient-to-r cursor-pointer from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                } text-white`}
              >
                {isPostingToTally ? (
                  <>
                    <Loader size={20} className="animate-spin"/>
                    <span className="hidden sm:inline">Posting...</span>
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    <span className="hidden sm:inline">Send to Tally</span>
                  </>
                )}
              </button>
            </div>
          </div>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900/50 border border-purple-500/20 rounded-xl pl-12 pr-4 py-3 text-purple-100 placeholder-purple-400/50"
            />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
          <Hash className="text-purple-300" size={20} />
          <label className="text-purple-200 font-medium">Select Count:</label>
          <input
            type="number"
            min="1"
            max={
              filteredTransactions.filter((tx) => tx.status !== "Deleted")
                .length
            }
            value={selectCount}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || parseInt(val) > 0) {
                setSelectCount(val);
              }
            }}
            placeholder="All"
            className="w-24 px-3 py-2 rounded-lg bg-slate-800/80 text-purple-100 border border-purple-500/30 focus:border-purple-500 focus:outline-none"
          />
          <span className="text-purple-300/70 text-sm">
            {selectCount && parseInt(selectCount) > 0
              ? `Select first ${selectCount} rows from all filtered transactions`
              : "Click header checkbox to select all transactions on current page"}
          </span>
          {selectCount && (
            <button
              onClick={() => {
                setSelectCount("");
                setSelectedItems([]);
              }}
              className="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 text-sm"
            >
              Clear
            </button>
          )}
        </div>
        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
          <div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-purple-500/20">
                  <th className="px-6 py-4 text-left">
                    <label className="relative inline-flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        disabled={currentTransactions.every(
                          (tx) => tx.status === "Deleted"
                        )}
                        checked={isHeaderCheckboxChecked}
                        className="appearance-none w-5 h-5 rounded-md border-2 bg-slate-800/50 border-purple-500/30 checked:bg-gradient-to-br checked:from-purple-500 checked:to-pink-500 checked:border-transparent"
                      />
                      {isHeaderCheckboxChecked && (
                        <Check
                          className="absolute pointer-events-none text-white"
                          size={16}
                          strokeWidth={3}
                        />
                      )}
                    </label>
                  </th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                    Narration
                  </th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                    Party Ledger
                  </th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.length === 0 ? (
                  <TransactionTableSkeleton />
                ) : (
                  currentTransactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className={`border-b border-purple-500/10 ${
                        transaction.status === "Deleted"
                          ? "bg-red-950/40 text-red-400 opacity-60"
                          : "hover:bg-purple-500/5 text-gray-200"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <label className="relative inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(transaction.id)}
                            onChange={() => toggleSelectItem(transaction.id)}
                            disabled={transaction.status === "Deleted"}
                            className="appearance-none w-5 h-5 rounded-md bg-slate-800/50 border-2 border-purple-500/30 checked:bg-gradient-to-br checked:from-purple-500 checked:to-pink-500 checked:border-transparent disabled:opacity-50"
                          />
                          {selectedItems.includes(transaction.id) && (
                            <Check
                              className="absolute pointer-events-none text-white"
                              size={16}
                              strokeWidth={3}
                            />
                          )}
                        </label>
                      </td>
                      <td className="px-6 py-4 text-purple-100">
                        {transaction.id}
                      </td>
                      <td className="px-6 py-4 text-purple-100">
                        {transaction.date}
                      </td>
                      <td
                        className="px-6 py-4 text-purple-100 max-w-md truncate"
                        title={transaction.narration}
                      >
                        {transaction.narration}
                      </td>
                      <td className="px-6 py-4 text-purple-100 font-medium">
                        ₹{transaction.amount}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs border ${
                            transaction.type === "Payment"
                              ? "bg-red-500/20 text-red-300 border-red-500/30"
                              : "bg-green-500/20 text-green-300 border-green-500/30"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <CustomSelector
                          options={ledgerOptions}
                          selectedValue={ledgerSelections[transaction.id] || ""}
                          onSelect={(value) =>
                            handleLedgerSelect(transaction.id, value)
                          }
                          placeholder="Select Party Ledger"
                          disabled={transaction.status === "Deleted"}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs border ${
                            transaction.status === "Resolved"
                              ? "bg-green-500/20 text-green-300 border-green-500/30"
                              : transaction.status === "Pending"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {transaction.status === "Deleted" ? (
                            <button
                              onClick={() => {
                                handleUndoDelete(transaction.id);
                              }}
                              className="p-2 rounded-lg bg-green-500/10 text-green-300 hover:bg-green-500/20"
                              title="Restore transaction"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                />
                              </svg>
                            </button>
                          ) : (
                            <>
                              <button
                                disabled={transaction.status === "Deleted"}
                                onClick={() => {
                                  handleDeleteTransaction(transaction.id);
                                  toast.custom(
                                    (t) => (
                                      <div className="backdrop-blur-xl bg-gradient-to-br from-gray-900/90 via-red-900/60 to-gray-800/90 border border-red-700/40 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 min-w-[320px]">
                                        <div className="flex items-center gap-3">
                                          <svg
                                            className="w-5 h-5 text-red-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                          >
                                            <path
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                              strokeWidth="2"
                                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                          </svg>
                                          <span className="text-sm font-medium">
                                            Transaction deleted
                                          </span>
                                        </div>
                                      </div>
                                    ),
                                    {
                                      duration: 3000,
                                      position: "bottom-right",
                                    }
                                  );
                                }}
                                className="p-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-6 py-4 border-t border-purple-500/20">
            <div className="text-purple-300 text-sm">
              {selectedItems.length > 0 && (
                <span className="mr-4 px-3 py-1 rounded-lg bg-purple-500/20 border border-purple-500/30">
                  {selectedItems.length} selected across all pages
                </span>
              )}
              Showing {startIndex + 1}-
              {Math.min(endIndex, filteredTransactions.length)} of{" "}
              {filteredTransactions.length}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                          : "bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="px-2 text-purple-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      {showSpeedyModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSpeedyModal(false)}
        >
          <div
            className="relative w-[90%] max-w-lg bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl shadow-2xl border border-purple-500/30 p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowSpeedyModal(false)}
              className="absolute top-4 right-4 text-purple-300 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <span className="text-3xl">🤖</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                  Speedy Recommendations
                </h2>
                <p className="text-purple-300 text-sm mt-1">
                  AI-powered transaction insights
                </p>
              </div>
            </div>
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6 mb-6">
              <p className="text-purple-100 text-lg mb-2">
                Speedy found{" "}
                <span className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                  {statistics.speedyCount}
                </span>{" "}
                recommended{" "}
                {statistics.speedyCount === 1 ? "transaction" : "transactions"}
              </p>
              <p className="text-purple-300 text-sm">
                These transactions are pending ledger assignment and ready for
                your review.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSpeedyModal(false)}
                className="flex-1 px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors"
              >
                Later
              </button>
              <button
                onClick={() => {
                  setShowSpeedyModal(false);
                  setIsOpenModal(true);
                }}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold transition-all shadow-lg shadow-purple-600/30"
              >
                Review Now
              </button>
            </div>
          </div>
        </div>
      )}
      {isOpenModal && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setIsOpenModal(false)}
        >
          <div
            className="relative w-[90%] max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <SpeedyRecommendations />
          </div>
        </div>
      )}
    </div>
  );
};
export default BankingDashboard;
