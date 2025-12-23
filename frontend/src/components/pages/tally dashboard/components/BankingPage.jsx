import {
  Banknote,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  Clock,
  MoreHorizontal,
  Calendar,
  ArrowRight,
  FileText,
  Filter,
  Search,
  Upload,
  User,
  X,
  Check,
  FileSpreadsheet, 
  Download, 
  AlertCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { DateRangeInput } from "../../../ui/DataRangeInput";
import { useNavigate } from "react-router";
import axios from "axios";
import toast from "react-hot-toast";
import {
  addBankingFile,
  setSelectedCompany,
  setSelectedFileId,
  setTransactions,
} from "../../../../redux/features/tallySlice";
import { nanoid } from "@reduxjs/toolkit";
import { useTallyData } from "../../../../hooks/useTallyData";
import { motion, AnimatePresence } from "motion/react";

export const BankingPage = ({ company, onBack }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState("All Files");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUploadDate, setSelectedUploadDate] = useState("");
  const [selectedUploadedBy, setSelectedUploadedBy] = useState("");
  const [selectedBankLedger, setSelectedBankLedger] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef(null);

  const { user } = useSelector((state) => state.auth);
  const { files: allReduxFiles } = useSelector((state) => state.tally);
  const { fetchAllAccounts, bankLedgers, ledgers } = useTallyData(company?.id);

  useEffect(() => {
    if (company?.id) {
      fetchAllAccounts();
      dispatch(setSelectedCompany(company));
    }
  }, [company?.id, dispatch, fetchAllAccounts]);

  useEffect(() => {
    return () => {
      setSelectedFile(null);
      setIsUploadModalOpen(false);
    };
  }, []);

  const companyFiles = useMemo(() => {
    const companyEntry = allReduxFiles.find((c) => c.id === company?.id);
    const files = companyEntry?.bankingFiles || [];

    return files.map((f) => ({
      ...f,
      bankLedger:
        (
          f.bankLedger ||
          f.selectedLedger ||
          f.selectedLedgerName ||
          ""
        ).trim() || null,
      uploadedBy: f.uploadedBy || "unknown",
      uploadDate: f.uploadDate || "",
    }));
  }, [allReduxFiles, company?.id]);

  const handleUploadButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.value = null;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setIsUploadModalOpen(true);
  };

  const handleUploadSubmit = async (data) => {
    if (!selectedFile || !company?.id) return;

    setIsUploading(true);
    const newFileId = nanoid();
    console.log(data);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("dateRange", data?.dateRange || "");
      formData.append("bankLedger", data?.bankLedger || "");
      formData.append("bankName", data?.bankName || "");

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_BASE_URL}/llm-call`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast.success("File uploaded successfully!");

      const uploadDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const newFile = {
        id: newFileId,
        companyId: company?.id,
        fileName: selectedFile.name,
        name: selectedFile.name,
        uploadedBy: user?.displayName || "anonymous",
        uploadDate,
        bankLedger: data?.bankLedger || "N/A",
        bankName: data?.bankName || "N/A",
        dateRange: data?.dateRange || "",
        status: "Review",
        responseData: response.data.data,
        selectedLedger: data?.bankLedger || null,
      };

      dispatch(addBankingFile({ companyId: company?.id, file: newFile }));

      dispatch(
        setTransactions({
          companyId: company?.id,
          fileId: newFileId,
          transactions: response.data.data,
        })
      );

      setIsUploadModalOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const filteredFiles = useMemo(() => {
    return companyFiles.filter((file) => {
      const matchesTab =
        currentTab === "All Files" || file.status === currentTab;

      const matchesSearch = (file?.name || "")
        .toLowerCase()
        .includes((searchTerm || "").toLowerCase());

      const matchesUploadDate =
        !selectedUploadDate ||
        (file?.uploadDate &&
          file.uploadDate
            .toLowerCase()
            .includes(selectedUploadDate.toLowerCase()));

      const matchesUploadedBy =
        !selectedUploadedBy ||
        (file?.uploadedBy || "").toLowerCase() ===
          selectedUploadedBy.toLowerCase();

      const fileLedger = (file.bankLedger || file.selectedLedger || "")
        .toString()
        .trim()
        .toLowerCase();

      const matchesBankLedger =
        !selectedBankLedger ||
        fileLedger === selectedBankLedger.toLowerCase() ||
        fileLedger.includes(selectedBankLedger.toLowerCase());

      const matchesStatus =
        !selectedStatus ||
        (file?.status || "").toLowerCase() === selectedStatus.toLowerCase();

      return (
        matchesTab &&
        matchesSearch &&
        matchesUploadDate &&
        matchesUploadedBy &&
        matchesBankLedger &&
        matchesStatus
      );
    });
  }, [
    companyFiles,
    currentTab,
    searchTerm,
    selectedUploadDate,
    selectedUploadedBy,
    selectedBankLedger,
    selectedStatus,
  ]);

  const statusColors = {
    "All Files": "text-gray-400",
    "In Review": "text-amber-400",
    "Issue Fixed": "text-green-400",
  };

  const uploadDateOptions = [
    ...new Set(companyFiles.map((f) => f.uploadDate).filter(Boolean)),
  ].map((date) => ({ label: date, value: date }));

  const uploadedByOptions = [
    ...new Set(companyFiles.map((f) => f.uploadedBy).filter(Boolean)),
  ].map((name) => ({ label: name, value: name }));

  const bankLedgerOptions = [
    ...new Set(
      allReduxFiles?.flatMap((f) => f.bankLedgers || []).filter(Boolean)
    ),
  ].map((ledger) => ({ label: ledger, value: ledger }));

  const statusOptions = [
    ...new Set(companyFiles.map((f) => f.status).filter(Boolean)),
  ].map((status) => ({ label: status, value: status }));

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-300 font-sans selection:bg-fuchsia-500/30">
      <header className="sticky top-0 z-30 bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="group p-2 -ml-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gray-500 mb-1">
              <span>Finance</span>
              <span className="text-gray-700">/</span>
              <span>Banking</span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">
                Banking Files
              </span>
              <span className="mx-2 text-gray-600 font-light">for</span>
              {company?.name || "Company Name"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all text-sm font-medium">
            <FileText size={18} className="text-fuchsia-400" />
            Shulekhanan Templates
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
            accept=".xlsx,.csv,.pdf"
          />

          <button
            onClick={handleUploadButtonClick}
            className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload size={18} />
            <span>Upload File</span>
          </button>
        </div>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center mb-8 gap-6">
          <div className="flex p-1 bg-gray-900/80 border border-white/5 rounded-2xl w-full lg:w-auto">
            {["All Files", "In Review", "Issue Fixed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setCurrentTab(tab)}
                className={`flex-1 lg:flex-none px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  currentTab === tab
                    ? "bg-gray-800 text-fuchsia-400 shadow-sm ring-1 ring-white/10"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <span>Showing {filteredFiles.length} records</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Page</span>
              <select className="bg-gray-800 rounded-lg border border-gray-700 py-1 px-2 text-white outline-none focus:ring-1 focus:ring-fuchsia-500">
                <option>1</option>
                <option>2</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
          
          <div className="flex items-center gap-2 relative group">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-fuchsia-400 transition-colors"
            />
            <input
              type="text"
              placeholder="Search by file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:border-fuchsia-500/50 focus:ring-4 focus:ring-fuchsia-500/10 outline-none transition-all"
            />
          </div>

          <DropdownFilter
            label="Upload Date"
            icon={Clock}
            options={uploadDateOptions}
            selectedOption={selectedUploadDate}
            onSelect={setSelectedUploadDate}
          />

          <DropdownFilter
            label="Uploaded By"
            icon={User}
            options={uploadedByOptions}
            selectedOption={selectedUploadedBy}
            onSelect={setSelectedUploadedBy}
          />

          <DropdownFilter
            label="Bank Ledger"
            icon={Banknote}
            options={bankLedgerOptions}
            selectedOption={selectedBankLedger}
            onSelect={setSelectedBankLedger}
          />

          <DropdownFilter
            label="Status"
            icon={CheckSquare}
            options={statusOptions}
            selectedOption={selectedStatus}
            onSelect={setSelectedStatus}
          />
        </div>

        <div className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          {filteredFiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 w-16">#</th>
                    <th className="px-6 py-4">File Details</th>
                    <th className="px-6 py-4">Timeline</th>
                    <th className="px-6 py-4">Ownership</th>
                    <th className="px-6 py-4">Ledger Reference</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredFiles.map((file, index) => (
                    <tr
                      key={file.no}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-xs text-gray-600 font-mono">
                        {(index + 1).toString().padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                            <Banknote size={16} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {file.name}
                            </div>
                            <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                              <Calendar size={10} />
                              {file.dateRange || "No range specified"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {file.uploadDate}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 border border-fuchsia-500/20 flex items-center justify-center text-[10px] font-bold text-fuchsia-400">
                            {file.uploadedBy.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-400">
                            {file.uploadedBy}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-fuchsia-300 font-medium px-2 py-1 bg-fuchsia-500/5 rounded border border-fuchsia-500/10">
                          {file.selectedLedger || "Unassigned"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`
                          inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                          ${
                            file.status === "Issue Fixed" ||
                            file.status === "Ready"
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          }
                        `}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              file.status === "Issue Fixed" ||
                              file.status === "Ready"
                                ? "bg-emerald-400"
                                : "bg-amber-400 animate-pulse"
                            }`}
                          ></span>
                          {file.status === "All Files" ? "Ready" : file.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            dispatch(setSelectedFileId(file.id));
                            navigate("/banking-dashboard", { state: file });
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-all p-2 hover:bg-white/10 rounded-lg text-fuchsia-400 hover:text-fuchsia-300"
                        >
                          <ArrowRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center mb-6 ring-1 ring-white/10 shadow-inner">
                <Filter size={32} className="text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                No entries found
              </h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                {currentTab === "All Files"
                  ? "Your banking dashboard is empty. Upload a bank statement or CSV to start reconciling your ledgers."
                  : `There are currently no files marked as '${currentTab}'.`}
              </p>
              {currentTab === "All Files" && (
                <button
                  onClick={handleUploadButtonClick}
                  className="mt-8 px-6 py-2.5 bg-fuchsia-600/10 hover:bg-fuchsia-600 text-fuchsia-400 hover:text-white border border-fuchsia-600/20 rounded-xl transition-all font-medium"
                >
                  Get Started
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {isUploadModalOpen && (
        <UploadModal
          onClose={() => {
            setIsUploadModalOpen(false);
            setSelectedFile(null);
          }}
          onSubmit={handleUploadSubmit}
          bankLedgers={bankLedgers}
          ledgers={ledgers}
          selectedFile={selectedFile}
          isUploading={isUploading}
        />
      )}
    </div>
  );
};

export const DropdownFilter = ({
  label,
  icon: Icon,
  options,
  selectedOption,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    onSelect(option);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getValue = (opt) => (typeof opt === "object" ? opt.value : opt);
  const getLabel = (opt) => (typeof opt === "object" ? opt.label : opt);

  return (
    <div className="relative group min-w-[200px]" ref={dropdownRef}>
      <label className="text-[10px] font-bold uppercase tracking-widest text-fuchsia-300/70 mb-1.5 ml-1 block">
        {label}
      </label>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-between w-full
          bg-gray-900/60 backdrop-blur-md 
          border text-sm font-medium transition-all duration-200 ease-in-out
          rounded-xl pl-3 pr-3 py-2.5
          outline-none
          shadow-lg shadow-black/20
          
          hover:bg-gray-800/80 hover:border-fuchsia-500/50
          active:scale-[0.98]
          
          ${
            isOpen
              ? "border-fuchsia-500 ring-1 ring-fuchsia-500/30 text-white"
              : "border-fuchsia-500/20 text-fuchsia-100/90"
          }
        `}
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && (
            <Icon
              size={16}
              className={`transition-colors ${
                isOpen ? "text-fuchsia-400" : "text-fuchsia-500/70"
              }`}
            />
          )}
          <span className={selectedOption ? "text-white" : "text-gray-400"}>
            {selectedOption
              ? getLabel(
                  options.find((o) => getValue(o) === selectedOption) ||
                    selectedOption
                )
              : `Select ${label}...`}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`text-fuchsia-500/70 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-fuchsia-400" : "rotate-0"
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-0 right-0 mt-2 z-50 origin-top"
          >
            <div className="bg-gray-900/95 backdrop-blur-xl border border-fuchsia-500/20 rounded-xl shadow-2xl shadow-black/50 overflow-hidden ring-1 ring-white/5">
              
              <ul
                className={`py-1.5 ${
                  options.length > 5
                    ? "max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-fuchsia-900/50 hover:scrollbar-thumb-fuchsia-700/50"
                    : ""
                }`}
              >
              
                <li
                  onClick={() => handleSelect("")}
                  className="px-3 py-2 mx-1.5 rounded-lg text-sm text-gray-400 cursor-pointer transition-colors hover:bg-white/5 hover:text-fuchsia-200 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded bg-fuchsia-500/10 group-hover:bg-fuchsia-500/20 transition-colors">
                      <Filter size={14} className="text-fuchsia-400" />
                    </div>
                    <span>All {label}</span>
                  </div>
                  {!selectedOption && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      <Check size={14} className="text-fuchsia-400" />
                    </motion.span>
                  )}
                </li>

                <div className="h-px bg-gradient-to-r from-transparent via-fuchsia-500/20 to-transparent my-1.5 mx-2" />

                {options.map((option) => {
                  const val = getValue(option);
                  const lab = getLabel(option);
                  const isSelected = selectedOption === val;
                  const OptionIcon = option.icon;

                  return (
                    <li
                      key={val}
                      onClick={() => handleSelect(val)}
                      className={`
                        px-3 py-2 mx-1.5 rounded-lg text-sm cursor-pointer 
                        flex items-center justify-between transition-all duration-200
                        ${
                          isSelected
                            ? "bg-fuchsia-500/20 text-white font-medium"
                            : "text-gray-300 hover:bg-white/5 hover:text-fuchsia-100"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        {OptionIcon && (
                          <OptionIcon
                            size={16}
                            className={
                              isSelected ? "text-fuchsia-300" : "text-gray-500"
                            }
                          />
                        )}
                        <span>{lab}</span>
                      </div>

                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Check size={14} className="text-fuchsia-400" />
                        </motion.span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



export const UploadModal = ({
  onClose,
  onSubmit,
  bankLedgers,
  selectedFile,
  isUploading,
}) => {
  const [fileDetails, setFileDetails] = useState({
    bankLedger: "",
    bankName: "",
  });

  const indianBanks = [
    "State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank",
    "Kotak Mahindra Bank", "Punjab National Bank", "Bank of Baroda",
    "Canara Bank", "Union Bank of India", "Bank of India",
  ];

  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const handleSelectChange = (e) => {
    setFileDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }
    if (!fileDetails.bankLedger || !fileDetails.bankName) {
      toast.error("Please select both Bank Ledger and Bank Name");
      return;
    }

    const payload = {
      ...fileDetails,
      file: selectedFile,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      dateRange:
        dateRange.startDate && dateRange.endDate
          ? `${dateRange.startDate.toLocaleDateString(
              "en-GB"
            )} - ${dateRange.endDate.toLocaleDateString("en-GB")}`
          : "",
    };

    onSubmit(payload);
  };

  const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return "0 KB";
    const kb = sizeInBytes / 1024;
    return kb < 1024 ? `${kb.toFixed(2)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-2xl w-full max-w-lg m-4 shadow-2xl transform transition-all flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-bold text-white tracking-wide">
              Document Upload
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Configure details before processing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

      
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
        >
   
          <div className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
              selectedFile 
              ? "bg-fuchsia-900/10 border-fuchsia-500/30" 
              : "bg-gray-800/40 border-gray-700 border-dashed"
          }`}>
             {selectedFile && <div className="absolute top-0 left-0 w-1 h-full bg-fuchsia-500"></div>}
             
            <div className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${selectedFile ? "bg-fuchsia-500/20 text-fuchsia-300" : "bg-gray-700 text-gray-500"}`}>
                <FileSpreadsheet size={24} />
              </div>
              <div className="flex-1 min-w-0">
                {selectedFile ? (
                  <>
                    <p className="text-sm font-medium text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatFileSize(selectedFile.size)} • Ready to upload
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-400 italic">No file selected</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <FormSelect
              id="bankLedger"
              name="bankLedger"
              label="Target Ledger"
              options={bankLedgers.map((l) => ({ label: l, value: l })) || []}
              value={fileDetails.bankLedger}
              onChange={handleSelectChange}
              required
              placeholder="Select Ledger"
            />

            <FormSelect
              id="bankName"
              name="bankName"
              label="Source Bank"
              options={indianBanks.map((bank) => ({ label: bank, value: bank }))}
              value={fileDetails.bankName}
              onChange={handleSelectChange}
              required
              placeholder="Search & Select Bank"
            />
            
      
            <div className="pt-1">
                 <DateRangeInput onChange={setDateRange} />
            </div>
          </div>

      
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-amber-400" />
                <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Format Guidelines
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg text-gray-400 group-hover:text-blue-400 transition-colors">
                        <FileText size={18} />
                    </div>
                    <div className="text-xs text-gray-300">
                        <span className="block font-medium text-gray-200">Split Columns</span>
                        Credit & Debit separated
                    </div>
                </div>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  title="Download Template"
                >
                  <Download size={16} />
                </button>
              </div>

              <div className="flex justify-between items-center bg-gray-800/50 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors group">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg text-gray-400 group-hover:text-emerald-400 transition-colors">
                        <FileText size={18} />
                    </div>
                    <div className="text-xs text-gray-300">
                        <span className="block font-medium text-gray-200">Single Column</span>
                        Unified amount column
                    </div>
                </div>
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                  title="Download Template"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 pt-4 border-t border-white/10 flex gap-3 bg-gray-900/50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-sm font-bold shadow-lg transition-all transform active:scale-[0.98] ${
              !selectedFile || isUploading
                ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white shadow-fuchsia-500/20"
            }`}
          >
            {isUploading ? (
              <>
                <Clock size={18} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Upload size={18} />
                <span>Upload Document</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};


export const FormSelect = ({
  id,
  name,
  label,
  value,
  onChange,
  options = [],
  required,
  placeholder,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = useMemo(() => {
    return options.filter((option) => {
      const label = typeof option === "object" ? option.label : option;
      return String(label).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [options, searchTerm]);

  const getCurrentLabel = () => {
    if (!value) return placeholder;
    const isObjectArray = options.length > 0 && typeof options[0] === "object";
    if (isObjectArray) {
      const selectedObj = options.find((opt) => opt.value === value);
      return selectedObj ? selectedObj.label : value;
    }
    return value;
  };

  const handleSelect = (optionValue) => {
    onChange({ target: { name: name || id, value: optionValue } });
    setIsOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="relative group" ref={dropdownRef}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-300 mb-2 transition-colors group-focus-within:text-fuchsia-400"
      >
        {label}
        {required && <span className="text-fuchsia-500 ml-1">*</span>}
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center justify-between w-full
          bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 
          text-left pl-4 pr-10 py-3 rounded-xl cursor-pointer transition-all duration-200
          hover:bg-gray-800 hover:border-gray-500
          focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500/50
          ${!value ? "text-gray-400" : "text-white font-medium"}`}
      >
        <span className="truncate">{getCurrentLabel()}</span>
        <ChevronDown
          size={18}
          className={`absolute right-3 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-fuchsia-400" : "rotate-0"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10 animation-fade-in-down">
          
          <div className="p-2 border-b border-gray-700 sticky top-0 bg-gray-900/95 z-10">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              />
              <input
                ref={searchInputRef}
                type="text"
                className="w-full bg-gray-800 text-sm text-white rounded-lg pl-9 pr-3 py-2 border border-transparent focus:border-fuchsia-500/50 focus:bg-gray-800 focus:outline-none placeholder-gray-500 transition-all"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <ul
            className={`py-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent`}
          >
            
            <li
              className="px-4 py-2.5 text-sm text-gray-400 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => handleSelect("")}
            >
              Select...
            </li>

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const optionValue =
                  typeof option === "object" ? option.value : option;
                const optionLabel =
                  typeof option === "object" ? option.label : option;
                const isSelected = value === optionValue;

                return (
                  <li
                    key={optionValue || index}
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between
                      ${
                        isSelected
                          ? "bg-fuchsia-500/20 text-fuchsia-200"
                          : "text-gray-200 hover:bg-gray-800 hover:text-white"
                      }`}
                    onClick={() => handleSelect(optionValue)}
                  >
                    <span>{optionLabel}</span>
                    {isSelected && (
                      <Check size={16} className="text-fuchsia-400" />
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-3 text-sm text-gray-500 text-center italic">
                No results found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
