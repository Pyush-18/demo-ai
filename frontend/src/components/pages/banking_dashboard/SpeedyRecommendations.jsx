import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ChevronDown,
  Play,
  Tent,
  CheckCircle2,
  Sparkles,
  Filter,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { approveTransaction } from "../../../redux/features/tallySlice";
import { CustomSelector } from "../../ui/CustomSelector";

export default function SpeedyRecommendations() {
  const dispatch = useDispatch();
  const { files, selectedCompany, selectedFileId } = useSelector(
    (state) => state.tally
  );

  const currentCompany = useMemo(() => {
    return files.find((c) => c.id === selectedCompany?.id);
  }, [files, selectedCompany]);

  const currentFile = useMemo(() => {
    if (!currentCompany || !selectedFileId) return null;
    return currentCompany.bankingFiles.find((f) => f.id === selectedFileId);
  }, [currentCompany, selectedFileId]);

  const transactions = currentFile?.transactions || [];

  const speedyTransactions = useMemo(() => {
    return transactions.filter(
      (t) => t.status === "Pending" && !t.selectedLedger
    );
  }, [transactions]);

  const ledgers = currentCompany?.ledgers || [];

  const [selectedEntries, setSelectedEntries] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLedger, setSelectedLedger] = useState(
    currentFile?.selectedLedger || ""
  );
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const itemsPerPage = 5;

  const categories = useMemo(() => {
    const cats = [
      ...new Set(speedyTransactions.map((t) => t.category).filter(Boolean)),
    ];
    return cats.length > 0 ? cats : ["All"];
  }, [speedyTransactions]);

  const currentCategory = categories[currentCategoryIndex];

  const currentCategoryTransactions = useMemo(() => {
    if (!currentCategory || currentCategory === "All") {
      return speedyTransactions;
    }
    return speedyTransactions.filter((t) => t.category === currentCategory);
  }, [speedyTransactions, currentCategory]);

  useEffect(() => {
    if (currentFile?.selectedLedger) {
      setSelectedLedger(currentFile.selectedLedger);
    }
  }, [currentFile?.selectedLedger]);

  useEffect(() => {
    if (currentCategoryIndex >= categories.length && categories.length > 0) {
      setCurrentCategoryIndex(0);
    }
  }, [categories, currentCategoryIndex]);

  useEffect(() => {
    if (
      currentCategoryTransactions.length === 0 &&
      speedyTransactions.length > 0 &&
      currentCategoryIndex < categories.length - 1
    ) {
      const timeout = setTimeout(() => handleNextCategory(), 300); 
      return () => clearTimeout(timeout);
    }
  }, [
    currentCategoryTransactions,
    speedyTransactions,
    currentCategoryIndex,
    categories,
  ]);

  const handleNextCategory = () => {
    setCurrentCategoryIndex((prev) => {
      let next = prev + 1;
      while (next < categories.length) {
        const cat = categories[next];
        const hasPending =
          cat === "All"
            ? speedyTransactions.length > 0
            : speedyTransactions.filter((t) => t.category === cat).length > 0;

        if (hasPending) return next;
        next++;
      }
      return prev;
    });
  };

  const filteredEntries = useMemo(() => {
    return currentCategoryTransactions.filter((entry) => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        entry.narration?.toLowerCase().includes(q) ||
        entry.amount?.toString().includes(q) ||
        entry.type?.toLowerCase().includes(q) ||
        entry.category?.toLowerCase().includes(q)
      );
    });
  }, [currentCategoryTransactions, searchTerm]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEntries = filteredEntries.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, currentCategoryIndex]);

  const toggleEntry = (id) => {
    const newSelected = new Set(selectedEntries);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedEntries(newSelected);
  };

  const toggleAll = () => {
    const currentIds = currentEntries.map((e) => e.id);
    const allSelected = currentIds.every((id) => selectedEntries.has(id));
    const newSelected = new Set(selectedEntries);

    if (allSelected) {
      currentIds.forEach((id) => newSelected.delete(id));
    } else {
      currentIds.forEach((id) => newSelected.add(id));
    }
    setSelectedEntries(newSelected);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  const ledgerOptions = useMemo(
    () =>
      ledgers?.map((ledger) => ({
        value: ledger,
        label: ledger,
        icon: Tent,
      })) || [],
    [ledgers]
  );

  if (!currentFile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900">
        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10">
          <Filter className="text-purple-300 w-8 h-8" />
        </div>
        <p className="text-xl font-medium text-white mb-2">No file selected</p>
        <p className="text-purple-300/70 text-sm">
          Please select a banking file to continue
        </p>
      </div>
    );
  }

  if (speedyTransactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 p-6 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#0d0c15]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 text-center shadow-2xl">
          <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-green-400/20 to-emerald-500/20 rounded-full flex items-center justify-center border border-green-500/30 shadow-[0_0_30px_rgba(74,222,128,0.2)]">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">All Caught Up!</h2>
          <p className="text-purple-200/60 leading-relaxed">
            Every transaction has been mapped. Great job keeping your books
            clean.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 p-4 lg:p-8 font-sans ">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-[#1e1b2e] to-[#0d0c15] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
                  🤖
                </span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">
                Speedy Recommendations
              </h1>
              <p className="text-purple-300/70 text-sm mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                Processing{" "}
                <span className="text-white font-semibold">
                  {speedyTransactions.length}
                </span>{" "}
                pending entries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#0d0c15]/40 p-1 rounded-xl border border-white/5">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all"
            >
              <Play size={16} className="rotate-180 fill-current" />
            </button>
            <span className="text-xs font-medium text-purple-200 px-2">
              Page {currentPage} / {totalPages || 1}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-lg transition-all"
            >
              <Play size={16} className="fill-current" />
            </button>
          </div>
        </div>

        <div className="bg-[#0d0c15]/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="p-6 border-b border-white/5 flex flex-col lg:flex-row gap-5 items-center justify-between">
            <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 items-center flex-1">
              <div className="w-full sm:w-72">
                <label className="block text-xs font-medium text-purple-300/80 mb-1.5 ml-1">
                  ASSIGN LEDGER
                </label>
                <CustomSelector
                  options={ledgerOptions}
                  selectedValue={selectedLedger}
                  onSelect={setSelectedLedger}
                  placeholder="Choose Ledger..."
                />
              </div>

              <div className="w-full sm:w-64 relative group">
                <label className="block text-xs font-medium text-purple-300/80 mb-1.5 ml-1">
                  CATEGORY FILTER
                </label>
                <div className="relative">
                  <select
                    value={currentCategoryIndex}
                    onChange={(e) =>
                      setCurrentCategoryIndex(Number(e.target.value))
                    }
                    className="w-full h-[52px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-purple-500/50 text-white text-[15px] pl-4 pr-10 rounded-xl appearance-none cursor-pointer focus:outline-none focus:ring-0 transition-all duration-300"
                  >
                    {categories.map((cat, idx) => (
                      <option
                        key={idx}
                        value={idx}
                        className="bg-[#0d0c15] text-zinc-300"
                      >
                        {cat}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none group-hover:text-purple-400 transition-colors"
                    size={18}
                  />
                </div>
              </div>
            </div>

            <div className="w-full lg:w-80 relative">
              <label className="block text-xs font-medium text-purple-300/80 mb-1.5 ml-1 invisible">
                SEARCH
              </label>
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-[52px] bg-black/20 border border-white/10 rounded-xl pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.02] transition-all"
                />
              </div>
            </div>
          </div>

          <div className="overflow-hidden min-h-[400px]">
            <table className="w-full">
              <thead className="bg-white/[0.02]">
                <tr>
                  <th className="w-16 px-6 py-4 text-left">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={
                          currentEntries.length > 0 &&
                          currentEntries.every((e) => selectedEntries.has(e.id))
                        }
                        onChange={toggleAll}
                        className="peer w-5 h-5 cursor-pointer appearance-none rounded border border-white/20 bg-white/5 checked:bg-purple-500 checked:border-purple-500 transition-all"
                      />
                      <CheckCircle2 className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white w-3.5 h-3.5 left-[3px]" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300/60 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300/60 uppercase tracking-wider">
                    Narration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-purple-300/60 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-purple-300/60 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-purple-300/60 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {currentEntries.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center justify-center opacity-50">
                        <Sparkles className="w-10 h-10 text-purple-300 mb-4" />
                        <p className="text-purple-200">
                          No transactions match your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      onClick={() => toggleEntry(entry.id)}
                      className={`
                        group transition-all duration-200 cursor-pointer
                        ${
                          selectedEntries.has(entry.id)
                            ? "bg-purple-500/[0.08]"
                            : "hover:bg-white/[0.02]"
                        }
                      `}
                    >
                      <td className="px-6 py-5">
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedEntries.has(entry.id)}
                            onChange={() => toggleEntry(entry.id)}
                            className="peer w-5 h-5 cursor-pointer appearance-none rounded border border-white/20 bg-white/5 checked:bg-purple-500 checked:border-purple-500 transition-all"
                          />
                          <CheckCircle2 className="absolute pointer-events-none opacity-0 peer-checked:opacity-100 text-white w-3.5 h-3.5 left-[3px]" />
                        </div>
                      </td>
                      <td className="px-6 py-5 text-zinc-300 text-sm font-medium">
                        {entry.date}
                      </td>
                      <td className="px-6 py-5 text-white text-sm max-w-sm">
                        <div className="truncate" title={entry.narration}>
                          {entry.narration}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-purple-200">
                          {entry.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-mono text-white text-sm tracking-wide">
                        ₹{entry.amount?.toLocaleString("en-IN")}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span
                          className={`
                          inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border shadow-[0_0_10px_inset]
                          ${
                            entry.type === "Payment"
                              ? "bg-red-500/10 text-red-400 border-red-500/20 shadow-red-500/10"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10"
                          }
                        `}
                        >
                          {entry.type}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-[#0d0c15]/40 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleNextCategory}
              disabled={currentCategoryIndex >= categories.length - 1}
              className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2 disabled:opacity-30 disabled:hover:text-zinc-400"
            >
              Skip to next category{" "}
              <ChevronDown className="w-4 h-4 -rotate-90" />
            </button>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="hidden sm:block text-right mr-2">
                <p className="text-xs text-purple-300/60">SELECTED</p>
                <p className="text-xl font-bold text-white leading-none">
                  {selectedEntries.size}
                </p>
              </div>

              <button
                disabled={selectedEntries.size === 0 || !selectedLedger}
                onClick={() => {
                  if (!selectedLedger) {
                    return;
                  }
                  selectedEntries.forEach((id) => {
                    dispatch(
                      approveTransaction({
                        companyId: currentCompany?.id,
                        fileId: currentFile?.id,
                        transactionId: id,
                      })
                    );
                  });
                  setSelectedEntries(new Set());
                }}
                className={`
                  flex-1 sm:flex-none h-[52px] px-8 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2
                  ${
                    selectedEntries.size === 0 || !selectedLedger
                      ? "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5"
                      : "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5"
                  }
                `}
              >
                <Sparkles className="w-4 h-4" />
                Approve Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
