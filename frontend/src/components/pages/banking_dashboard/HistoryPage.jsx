import React, { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  MoveLeft,
  Filter,
  Download,
} from "lucide-react";
import { useExport } from "../../../hooks/useExport";
import ExportModal from "../tally dashboard/ExportModal";

const HistoryPage = () => {
  const navigate = useNavigate();
  const { savedTransactions, history, selectedCompany } = useSelector(
    (state) => state.tally
  );
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("history");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const { handleExport } = useExport();

  const itemsPerPage = 8;

  const rawData = activeTab === "history" ? history : savedTransactions;

  const filteredData = useMemo(() => {
    return rawData?.filter((tx) => {
     
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        tx.narration?.toLowerCase().includes(searchLower) ||
        tx.partyLedger?.toLowerCase().includes(searchLower) ||
        tx.type?.toLowerCase().includes(searchLower) ||
        tx.amount?.toString().includes(searchLower);

      let matchesDate = true;
      if (dateFilter.startDate || dateFilter.endDate) {
        const txDate = new Date(tx.savedAt || tx.historyDate);
        if (dateFilter.startDate) {
          matchesDate = txDate >= new Date(dateFilter.startDate);
        }
        if (dateFilter.endDate && matchesDate) {
          matchesDate = txDate <= new Date(dateFilter.endDate);
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [rawData, searchQuery, dateFilter]);

  const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData?.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, activeTab]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">


      <nav className="sticky top-0 z-50 w-full bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
     
            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate(-1)}
                className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-purple-500/30 hover:bg-purple-500/10 transition-all duration-300"
              >
                <MoveLeft
                  size={18}
                  className="group-hover:-translate-x-0.5 transition-transform"
                />
              </button>

              <div>
                <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  Transaction History
                </h1>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  {selectedCompany?.name || "All Companies"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-slate-200">
                    {user?.displayName || "Admin"}
                  </div>
                </div>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20">
                  {user?.displayName?.charAt(0) || "A"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
      
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-green-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300/70 text-sm mb-2">
                    Saved Transactions
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {savedTransactions?.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500">
                  <CheckCircle2 className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-300/70 text-sm mb-2">
                    Total History
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {history?.length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Calendar className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl blur-xl" />
            <div className="relative bg-slate-900/50 backdrop-blur-sm border border-red-500/20 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-300/70 text-sm mb-2">Failed Posts</p>
                  <p className="text-3xl font-bold text-white">
                    {history?.filter((tx) => !tx.postedSuccessfully).length}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                  <XCircle className="text-white" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "history"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30"
                    : "bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                }`}
              >
                History ({history?.length})
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
                  activeTab === "saved"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                    : "bg-green-500/10 text-green-300 hover:bg-green-500/20"
                }`}
              >
                Saved ({savedTransactions?.length})
              </button>
            </div>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 flex items-center gap-2"
            >
              <Download size={18} />
              Export
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
                className="w-full bg-slate-900/50 border border-purple-500/20 rounded-xl pl-12 pr-4 py-3 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="relative">
              <Calendar
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400"
                size={20}
              />
              <input
                type="date"
                value={dateFilter.startDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, startDate: e.target.value })
                }
                className="w-full bg-slate-900/50 border border-purple-500/20 rounded-xl pl-12 pr-4 py-3 text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="relative">
              <Calendar
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400"
                size={20}
              />
              <input
                type="date"
                value={dateFilter.endDate}
                onChange={(e) =>
                  setDateFilter({ ...dateFilter, endDate: e.target.value })
                }
                className="w-full bg-slate-900/50 border border-purple-500/20 rounded-xl pl-12 pr-4 py-3 text-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {dateFilter.startDate || dateFilter.endDate ? (
            <button
              onClick={() => setDateFilter({ startDate: "", endDate: "" })}
              className="text-purple-300 text-sm hover:text-purple-100 flex items-center gap-2"
            >
              <Filter size={16} />
              Clear Date Filter
            </button>
          ) : null}
        </div>

        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-sm z-10">
                  <tr className="border-b border-purple-500/20">
                    <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                      Narration
                    </th>
                    <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                      Party Ledger
                    </th>
                    <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-purple-300 font-medium text-sm">
                      Posted Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentData?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-12 text-center text-purple-300/70"
                      >
                        <div className="flex flex-col items-center gap-3">
                          <Search size={48} className="text-purple-400/50" />
                          <p className="text-lg">No transactions found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentData?.map((tx, index) => (
                      <tr
                        key={`${tx.id}-${index}`}
                        className="border-b border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          {tx.postedSuccessfully ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle2
                                size={20}
                                className="text-green-400"
                              />
                              <span className="px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-300 border border-green-500/30">
                                Success
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <XCircle size={20} className="text-red-400" />
                              <span className="px-3 py-1 rounded-full text-xs bg-red-500/20 text-red-300 border border-red-500/30">
                                Failed
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-purple-100">
                          {tx.date || "N/A"}
                        </td>
                        <td
                          className="px-6 py-4 text-purple-100 max-w-md truncate"
                          title={tx.narration}
                        >
                          {tx.narration || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-purple-100">
                          {tx.partyLedger || tx.selectedLedger || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-purple-100 font-medium">
                          ₹{tx.amount?.toLocaleString("en-IN") || 0}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs border ${
                              tx.type === "Payment"
                                ? "bg-red-500/20 text-red-300 border-red-500/30"
                                : "bg-green-500/20 text-green-300 border-green-500/30"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-purple-200 text-sm">
                          {formatDate(tx.savedAt || tx.historyDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {filteredData?.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-purple-500/20">
              <p className="text-purple-300 text-sm">
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredData.length)} of{" "}
                {filteredData.length}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        data={activeTab === "history" ? history : savedTransactions}
        onExport={handleExport}
      />
    </div>
  );
};

export default HistoryPage;
