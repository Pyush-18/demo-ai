import { RefreshCw, Search, X } from "lucide-react";
import { CompanyToSyncCard } from "./CompanyToSyncCard";

export const SyncCompanyModal = ({ isOpen, onClose, companies = [], onMap }) => {
  if (!isOpen) return null;

  const handleMap = (companyId) => {
    onMap(companyId);
  };

  return (
    <div className="fixed inset-0 bg-black/70 bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-gray-800 w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-fuchsia-500/30">
 
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-white/10">
          <h3 className="text-2xl font-bold text-white flex items-center">
            <RefreshCw size={24} className="mr-2 text-fuchsia-400" /> Map New Tally Company
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
            <p className="text-sm text-fuchsia-300 mb-4">
              Below are the companies detected on your connected Tally instance.
              Select one to map and begin synchronization.
            </p>

            {companies.map((company) => (
              <CompanyToSyncCard
                key={company.id}
                company={company}
                onMap={() => handleMap(company.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-700/50 rounded-xl">
            <Search size={40} className="mx-auto text-gray-500 mb-4" />
            <p className="text-xl text-white font-semibold">
              No new Tally companies found.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Ensure the company file is open in your Tally Prime instance.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
