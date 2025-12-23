import { AlertTriangle, CheckCircle, X } from "lucide-react";

const ErrorCompanyCard = ({ company }) => (
  <div className="bg-red-900/40 p-4 rounded-xl border border-red-500/50 flex justify-between items-center transition-colors hover:bg-red-900/60">
    <div>
      <p className="text-lg font-semibold text-white">{company.name}</p>
      <div className="flex items-center text-sm text-red-300 mt-1">
        <AlertTriangle size={16} className="text-red-400 mr-2" />
        Status: Needs Review
      </div>
      <p className="text-xs text-gray-400 mt-1">Last Sync: {company.syncDate}</p>
    </div>
    <button
      onClick={() => console.log(`Navigating to error details for ${company.name}`)}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-200"
    >
      View Details
    </button>
  </div>
);

export const ReviewErrorsModal = ({ isOpen, onClose, companies }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-red-500/50">
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-white/10">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <AlertTriangle size={24} className="mr-2 text-red-400" /> Companies Needing Review
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {companies.length > 0 ? (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            <p className="text-sm text-red-300 mb-4">
              The following {companies.length} companies require attention due to sync errors or data discrepancies.
            </p>
            {companies.map((company) => (
              <ErrorCompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-700/50 rounded-xl">
            <CheckCircle size={40} className="mx-auto text-green-500 mb-4" />
            <p className="text-xl text-white font-semibold">
              All good! No sync errors detected.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Your active companies are synchronizing smoothly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};