import { useState } from "react";
import { pendingDashboardData } from "../../../data/index.js";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTally } from "../../../hooks/useTally.js";
import { useSelector } from "react-redux";
const rowsPerPage = 7;
export const PendingDashboard = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const rejectedTransactions = useSelector((state) => state.tally.rejectedTransactions);
  const totalPages = Math.ceil(rejectedTransactions.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = rejectedTransactions.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-[#100C23]/80 border border-purple-800/50 rounded-xl shadow-2xl shadow-purple-900/20 p-6 sm:p-8 space-y-6 backdrop-blur-sm animate-fade-in-down">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-wide">
            Pending Transactions Dashboard
          </h2>
          <p className="text-gray-400 mt-1">
            These transactions were rejected or failed to post. Please review
            and take necessary action.
          </p>
        </div>
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-purple-900/60 bg-[#0A071A]">
        <table className="w-full min-w-[800px] text-sm text-left text-gray-300">
          <thead className="text-xs text-purple-300 uppercase bg-[#100C23]/80">
            <tr>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Particulars
              </th>
              <th scope="col" className="px-6 py-3 text-right">
                Amount
              </th>
              <th scope="col" className="px-6 py-3">
                Type
              </th>
              <th scope="col" className="px-6 py-3">
                Reason for Rejection
              </th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-purple-900/50 hover:bg-[#100C23]/60 transition-colors duration-200"
                >
                  <td className="px-6 py-4 font-mono whitespace-nowrap">
                    {transaction.date.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-medium text-white">
                    {transaction.particulars}
                  </td>
                  <td className="px-6 py-4 font-mono text-right whitespace-nowrap">
                    {transaction.amount.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        transaction.type === "Receipt"
                          ? "bg-cyan-900/70 text-cyan-300"
                          : "bg-orange-900/70 text-orange-300"
                      }`}
                    >
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-red-400 font-semibold">
                    {transaction.reason}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-10 text-center text-lg text-gray-500"
                >
                  No pending transactions to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pendingDashboardData.length > 0 && (
        <div className="flex items-center justify-between mt-6 text-sm text-gray-400">
          <span className="text-sm text-purple-300">
            Showing {indexOfFirstRow + 1} to{" "}
            {Math.min(indexOfLastRow, pendingDashboardData.length)} of{" "}
            {pendingDashboardData.length} total transactions
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-md hover:bg-[#19152f] disabled:opacity-50 transition-colors"
              disabled={currentPage === 1}
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={handleNext}
              className="p-2 rounded-md hover:bg-[#19152f] disabled:opacity-50 transition-colors"
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
