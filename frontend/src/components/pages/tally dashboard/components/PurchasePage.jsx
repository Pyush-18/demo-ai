import {
  CheckSquare,
  ChevronLeft,
  Clock,
  File,
  FileText,
  HardHat,
  Search,
  Tag,
  Upload,
  X,
  Calendar,
  User,
  Package,
  ArrowRight,
  Filter,
  MoreHorizontal,
} from "lucide-react";
import { DropdownFilter } from "./BankingPage";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectPurchaseFilesByCompany } from "../../../../redux/selector/tallySelectors";
import { useNavigate } from "react-router";
import { InvoiceModal } from "../../dashboard/modal/InvoiceModal";

export const PurchasePage = ({ company, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedUploadedBy, setSelectedUploadedBy] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedParty, setSelectedParty] = useState("");
  const [selectedVoucherType, setSelectedVoucherType] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  const purchaseFiles = useSelector(
    company ? selectPurchaseFilesByCompany(company.id) : () => []
  );

  const files = purchaseFiles.flatMap((file) =>
    file.invoices.map((invoice, index) => ({
      no: index + 1,
      fileName: `${invoice.voucherNo || "Invoice"}`,
      duration: getRelativeTime(invoice.createdAt),
      uploadDate: formatDate(invoice.createdAt),
      uploadedBy: file.uploadedBy || "System",
      status: invoice.status || "Pending",
      fileId: file.id,
      invoiceId: invoice.id,
      invoiceData: invoice,
      fileData: file,
    }))
  );

  const uniqueParties = [
    ...new Set(files.map((f) => f.invoiceData.partyName).filter(Boolean)),
  ];
  const uniqueVoucherTypes = [
    ...new Set(files.map((f) => f.invoiceData.voucherType).filter(Boolean)),
  ];
  const uniqueUploadedBy = [
    ...new Set(files.map((f) => f.uploadedBy).filter(Boolean)),
  ];
  const uniqueStatuses = [
    ...new Set(files.map((f) => f.status).filter(Boolean)),
  ];

  const filteredFiles = files.filter((file) => {
  
    const matchesSearch = file.fileName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

  
    const matchesStatus =
      selectedStatus === "" || file.status === selectedStatus;

    const matchesUploadedBy =
      selectedUploadedBy === "" || file.uploadedBy === selectedUploadedBy;

    let matchesDuration = true;
    if (selectedDuration !== "") {
      const now = new Date();
      const uploadDate = new Date(file.invoiceData.createdAt);
      const diffMs = now - uploadDate;
      const diffDays = Math.floor(diffMs / 86400000);

      if (selectedDuration === "1d") {
        matchesDuration = diffDays < 1;
      } else if (selectedDuration === "1w") {
        matchesDuration = diffDays < 7;
      } else if (selectedDuration === "1m") {
        matchesDuration = diffDays < 30;
      } else if (selectedDuration === "1m+") {
        matchesDuration = diffDays >= 30;
      }
    }

    const matchesParty =
      selectedParty === "" || file.invoiceData.partyName === selectedParty;

    const matchesVoucherType =
      selectedVoucherType === "" ||
      file.invoiceData.voucherType === selectedVoucherType;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesUploadedBy &&
      matchesDuration &&
      matchesParty &&
      matchesVoucherType
    );
  });

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "processed":
        return "bg-green-100 text-green-800 dark:bg-opacity-20 dark:text-green-400";
      case "pending":
      case "processing":
        return "bg-amber-100 text-amber-800 dark:bg-opacity-20 dark:text-amber-400";
      case "failed":
      case "deleted":
        return "bg-red-100 text-red-800 dark:bg-opacity-20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-opacity-20 dark:text-gray-400";
    }
  };

  const handleDetailsClick = (file) => {
    setSelectedInvoice(file);
    setShowDetailsModal(true);
  };

  const showTable = filteredFiles.length > 0;

  return (
    <div className="min-h-screen bg-[#0B0C15] text-slate-300 font-sans selection:bg-fuchsia-500/30">
    
      <header className="sticky top-0 z-30 bg-[#0B0C15]/80 backdrop-blur-xl border-b border-white/5 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="group p-2 -ml-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            title="Go back"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-gray-500 mb-1">
              <span>Purchase</span>
              <span className="text-gray-700">/</span>
              <span>Documents</span>
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">
                Purchase Documents
              </span>
              <span className="mx-2 text-gray-600 font-light">for</span>
              {company?.name || "Company Name"}
            </h1>
          </div>
        </div>

        <button
          onClick={() => navigate("/sales-purchase/dashboard")}
          className="group flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <span>Go to Purchase</span>
          <ArrowRight
            size={16}
            className="opacity-70 group-hover:translate-x-1 transition-transform"
          />
        </button>
      </header>

      <main className="p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
        
          <div className="relative group flex items-center">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search
                size={16}
                className="text-gray-500 group-focus-within:text-indigo-400 transition-colors"
              />
            </div>
            <input
              type="text"
              placeholder="Search by file name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-4 py-2.5 bg-gray-900/50 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-600 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:bg-gray-900 transition-all outline-none"
            />
          </div>

      
          <DropdownFilter
            label="Duration"
            icon={Clock}
            options={[
              { label: "Less than 1 day", value: "1d" },
              { label: "Less than 1 week", value: "1w" },
              { label: "Less than 1 month", value: "1m" },
              { label: "More than 1 month", value: "1m+" },
            ]}
            selectedOption={selectedDuration}
            onSelect={setSelectedDuration}
          />

        
          <DropdownFilter
            label="Party"
            icon={HardHat}
            options={uniqueParties.map((party) => ({
              label: party,
              value: party,
            }))}
            selectedOption={selectedParty}
            onSelect={setSelectedParty}
          />

       
          <DropdownFilter
            label="Voucher"
            icon={Tag}
            options={uniqueVoucherTypes.map((type) => ({
              label: type,
              value: type,
            }))}
            selectedOption={selectedVoucherType}
            onSelect={setSelectedVoucherType}
          />

         
          <DropdownFilter
            label="Status"
            icon={CheckSquare}
            options={uniqueStatuses.map((status) => ({
              label: status,
              value: status,
            }))}
            selectedOption={selectedStatus}
            onSelect={setSelectedStatus}
          />
        </div>
        <div className="bg-gray-900/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
     
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Filter size={16} className="text-indigo-500" />
              Processed Files
              <span className="bg-white/10 text-gray-300 text-[10px] px-2 py-0.5 rounded-full">
                {filteredFiles.length}
              </span>
            </h2>

            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>Page 1 of 5</span>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-white/10 disabled:opacity-50">
                  <ChevronLeft size={14} />
                </button>
                <button className="p-1 rounded hover:bg-white/10">
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {filteredFiles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 w-16">#</th>
                    <th className="px-6 py-4">File Name</th>
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Upload Date</th>
                    <th className="px-6 py-4">Uploaded By</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredFiles.map((file, index) => (
                    <tr
                      key={`${file.fileId}-${file.invoiceId}`}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4 text-xs text-gray-600 font-mono">
                        {(index + 1).toString().padStart(2, "0")}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          
                          <div className="p-2 rounded bg-fuchsia-500/10 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors">
                            <FileText size={16} />
                          </div>
                          <span className="text-sm font-medium text-gray-200 group-hover:text-white transition-colors">
                            {file.fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {file.duration}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {file.uploadDate}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          
                          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-[9px] font-bold text-white">
                            {file.uploadedBy.charAt(0)}
                          </div>
                          {file.uploadedBy}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                       
                        <span
                          className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                            ${
                              file.status === "Completed" ||
                              file.status === "Success"
                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                                : file.status === "Pending" ||
                                  file.status === "Processing"
                                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                                : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                            }
                          `}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              file.status === "Completed"
                                ? "bg-emerald-400"
                                : file.status === "Pending"
                                ? "bg-amber-400 animate-pulse"
                                : "bg-rose-400"
                            }`}
                          ></span>
                          {file.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDetailsClick(file)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white"
                          title="View Details"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
           
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 bg-gray-800/50 rounded-2xl flex items-center justify-center mb-4 ring-1 ring-white/10">
                <Search size={32} className="text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-white">
                No purchase documents
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                No files match your current filters. Try changing the party
                name, date range or status.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDuration("");
                }}
                className="mt-6 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </main>

      {showDetailsModal && selectedInvoice && (
        <InvoiceModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedInvoice(null);
          }}
          invoiceData={selectedInvoice.invoiceData}
          type="purchase"
        />
      )}
    </div>
  );
};

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getRelativeTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);
  const diffMonths = Math.floor(diffMs / 2592000000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return `${diffMonths}m ago`;
}
