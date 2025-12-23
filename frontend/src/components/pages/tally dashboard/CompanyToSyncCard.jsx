import { CheckCircle } from "lucide-react";
import { useSelector } from "react-redux";

export const CompanyToSyncCard = ({ company, onMap }) => {
  const { activeCompanies } = useSelector((state) => state.tally);

  const isMapped = activeCompanies.some((c) => c.name === company.name);

  return (
    <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600 flex justify-between items-center transition-all hover:bg-gray-700/80 hover:border-fuchsia-400/50">

      <div>
        <p className="text-lg font-semibold text-white">{company.name}</p>
        <div className="flex items-center text-sm text-gray-400 mt-1">
          <CheckCircle size={16} className="text-green-400 mr-2" />
          {isMapped ? "Mapped in system" : `Available (${company.status})`}
        </div>
      </div>

      
      <button
        onClick={() => onMap(company.id)}
        disabled={isMapped}
        className={`font-bold py-2 px-4 rounded-lg text-sm shadow-md transition-all duration-200 ${
          isMapped
            ? "bg-gray-600 text-gray-300 cursor-not-allowed"
            : "bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
        }`}
      >
        {isMapped ? "Already Mapped" : "Map Company"}
      </button>
    </div>
  );
};
