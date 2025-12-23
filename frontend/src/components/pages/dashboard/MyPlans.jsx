import { ArrowUpDown, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { useState } from "react";

const creditHistoryData = [
  {
    no: 1,
    date: "16-10-2025 : 11:49",
    description: "Welcome Rewards",
    category: "Rewards",
    credits: 1000,
  },
  {
    no: 2,
    date: "15-10-2025 : 09:22",
    description: "Initial Plan Purchase",
    category: "Purchase",
    credits: 5000,
  },
  {
    no: 3,
    date: "14-10-2025 : 18:10",
    description: "Referred a friend",
    category: "Rewards",
    credits: 250,
  },
  {
    no: 4,
    date: "13-10-2025 : 12:00",
    description: "Monthly Top-up",
    category: "Purchase",
    credits: 1000,
  },
  {
    no: 5,
    date: "12-10-2025 : 15:30",
    description: "API Usage Overage",
    category: "Usage",
    credits: -150,
  },
  {
    no: 6,
    date: "11-10-2025 : 08:45",
    description: "Welcome Rewards",
    category: "Rewards",
    credits: 1000,
  },
  {
    no: 7,
    date: "10-10-2025 : 22:05",
    description: "Year-end Bonus",
    category: "Rewards",
    credits: 500,
  },
];

const transactionHistoryData = [
  {
    no: 1,
    date: "16-10-2025 : 11:49",
    referenceNo: "VR-20251016-001",
    plan: "Free Trial Activation",
    amount: "₹0.00",
    status: "Success",
  },
  {
    no: 2,
    date: "15-10-2025 : 09:22",
    referenceNo: "VR-20251015-001",
    plan: "Premium Plan (Annual)",
    amount: "₹9,999.00",
    status: "Failed",
  },
  {
    no: 3,
    date: "14-10-2025 : 18:10",
    referenceNo: "VR-20251014-001",
    plan: "Premium Plan (Monthly)",
    amount: "₹999.00",
    status: "Success",
  },
  {
    no: 4,
    date: "13-10-2025 : 12:01",
    referenceNo: "VR-20251013-001",
    plan: "Credits Top-up",
    amount: "₹1,500.00",
    status: "Success",
  },
  {
    no: 5,
    date: "12-10-2025 : 10:00",
    referenceNo: "VR-20251012-001",
    plan: "Enterprise Plan",
    amount: "₹25,000.00",
    status: "Pending",
  },
  {
    no: 6,
    date: "11-10-2025 : 14:00",
    referenceNo: "VR-20251011-001",
    plan: "Premium Plan (Monthly)",
    amount: "₹999.00",
    status: "Success",
  },
  {
    no: 7,
    date: "10-10-2025 : 16:30",
    referenceNo: "VR-20251010-001",
    plan: "Credits Top-up",
    amount: "₹500.00",
    status: "Success",
  },
];

const StatusBadge = ({ status }) => {
  const baseClasses =
    "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap";
  switch (status.toLowerCase()) {
    case "success":
      return (
        <span className={`${baseClasses} bg-green-500/20 text-green-400`}>
          Success
        </span>
      );
    case "failed":
      return (
        <span className={`${baseClasses} bg-red-500/20 text-red-400`}>
          Failed
        </span>
      );
    case "pending":
      return (
        <span className={`${baseClasses} bg-yellow-500/20 text-yellow-400`}>
          Pending
        </span>
      );
    default:
      return (
        <span className={`${baseClasses} bg-gray-500/20 text-gray-400`}>
          {status}
        </span>
      );
  }
};

export const MyPlans = () => {
  const [activeTab, setActiveTab] = useState("Current Plan");
  const tabs = ["Current Plan", "Transaction History", "Credit History"];

  const [creditCurrentPage, setCreditCurrentPage] = useState(1);
  const [transactionCurrentPage, setTransactionCurrentPage] = useState(1);
  const rowsPerPage = 4;

  const renderContent = () => {
    switch (activeTab) {
      case "Current Plan":
        return (
          <div className="bg-v-glass backdrop-blur-lg border border-white/10 p-8 rounded-2xl text-center">
            <p className="text-v-text-secondary">Current Plan</p>
            <h3 className="text-4xl font-bold text-v-accent-green my-4">
              Free Trial
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8 max-w-2xl mx-auto">
              <div className="bg-v-glass-hover p-4 rounded-lg">
                <p className="text-sm text-v-text-secondary">
                  Remaining Entries
                </p>
                <p className="text-2xl font-semibold text-v-text-primary">
                  1000
                </p>
              </div>
              <div className="bg-v-glass-hover p-4 rounded-lg">
                <p className="text-sm text-v-text-secondary">Users Allowed</p>
                <p className="text-2xl font-semibold text-v-text-primary">1</p>
              </div>
              <div className="bg-v-glass-hover p-4 rounded-lg">
                <p className="text-sm text-v-text-secondary">Valid until</p>
                <p className="text-2xl font-semibold text-v-text-primary">
                  23 Oct 2025
                </p>
              </div>
            </div>
            <button onClick={() => navigate('/pricing')} className="bg-v-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-v-accent/80 transition-all duration-300 transform hover:scale-105">
              Upgrade Plan
            </button>
          </div>
        );
      case "Transaction History": {
        const totalPages = Math.ceil(
          transactionHistoryData.length / rowsPerPage
        );
        const indexOfLastRow = transactionCurrentPage * rowsPerPage;
        const indexOfFirstRow = indexOfLastRow - rowsPerPage;
        const currentRows = transactionHistoryData.slice(
          indexOfFirstRow,
          indexOfLastRow
        );

        const handleNext = () => {
          if (transactionCurrentPage < totalPages) {
            setTransactionCurrentPage(transactionCurrentPage + 1);
          }
        };

        const handlePrev = () => {
          if (transactionCurrentPage > 1) {
            setTransactionCurrentPage(transactionCurrentPage - 1);
          }
        };
        return (
          <div className="bg-v-glass backdrop-blur-lg border border-white/10 p-6 md:p-8 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      No
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      <div className="flex items-center cursor-pointer">
                        Date
                        <ArrowUpDown size={14} className="ml-2" />
                      </div>
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      Reference No
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      Plan
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      Amount
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      Transaction Status
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary text-center">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr
                      key={item.no}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="p-4 text-v-text-primary">{item.no}</td>
                      <td className="p-4 text-v-text-primary whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="p-4 text-v-text-primary font-mono">
                        {item.referenceNo}
                      </td>
                      <td className="p-4 text-v-text-primary">{item.plan}</td>
                      <td className="p-4 text-v-text-primary">{item.amount}</td>
                      <td className="p-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="p-4 text-center">
                        <button
                          className="p-2 rounded-full text-v-text-secondary hover:bg-v-glass-hover hover:text-v-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={item.status !== "Success"}
                        >
                          <Download size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-6 text-sm text-v-text-secondary">
              <span>
                Page {transactionCurrentPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-md hover:bg-v-glass-hover disabled:opacity-50"
                  disabled={transactionCurrentPage === 1}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-md hover:bg-v-glass-hover disabled:opacity-50"
                  disabled={transactionCurrentPage === totalPages}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      }
      case "Credit History":
        const totalPages = Math.ceil(creditHistoryData.length / rowsPerPage);
        const indexOfLastRow = creditCurrentPage * rowsPerPage;
        const indexOfFirstRow = indexOfLastRow - rowsPerPage;
        const currentRows = creditHistoryData.slice(
          indexOfFirstRow,
          indexOfLastRow
        );

        const handleNext = () => {
          if (creditCurrentPage < totalPages) {
            setCreditCurrentPage(creditCurrentPage + 1);
          }
        };

        const handlePrev = () => {
          if (creditCurrentPage > 1) {
            setCreditCurrentPage(creditCurrentPage - 1);
          }
        };
        return (
          <div className="bg-v-glass backdrop-blur-lg border border-white/10 p-6 md:p-8 rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      No
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      <div className="flex items-center cursor-pointer">
                        Date
                        <ArrowUpDown size={14} className="ml-2" />
                      </div>
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      Description
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary">
                      Category
                    </th>
                    <th className="p-4 font-semibold text-v-text-secondary text-right">
                      Credits
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.map((item) => (
                    <tr
                      key={item.no}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="p-4 text-v-text-primary">{item.no}</td>
                      <td className="p-4 text-v-text-primary whitespace-nowrap">
                        {item.date}
                      </td>
                      <td className="p-4 text-v-text-primary">
                        {item.description}
                      </td>
                      <td className="p-4 text-v-text-primary">
                        {item.category}
                      </td>
                      <td
                        className={`p-4 font-semibold text-right ${
                          item.credits > 0
                            ? "text-v-accent-green"
                            : "text-red-500"
                        }`}
                      >
                        {item.credits > 0 ? `+${item.credits}` : item.credits}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-6 text-sm text-v-text-secondary">
              <span>
                Page {creditCurrentPage} of {totalPages}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrev}
                  className="p-2 rounded-md hover:bg-v-glass-hover disabled:opacity-50"
                  disabled={creditCurrentPage === 1}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2 rounded-md hover:bg-v-glass-hover disabled:opacity-50"
                  disabled={creditCurrentPage === totalPages}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-v-text-primary">
        My Plans
      </h2>

      <div className="mb-6 inline-block bg-v-glass backdrop-blur-lg border border-white/10 p-1.5 rounded-xl">
        <div className="flex items-center justify-center sm:justify-start">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors duration-300 ${
                activeTab === tab
                  ? "bg-v-accent text-white"
                  : "text-v-text-secondary hover:bg-v-glass-hover"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};
