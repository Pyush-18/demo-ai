import { MoreVertical } from "lucide-react";

const FeatureChip = ({ children, onClick, isClickable = false }) => (
  <span
    onClick={isClickable ? onClick : undefined}
    className={`text-xs px-3 py-1 rounded-full font-medium transition-all duration-200 
      ${
        isClickable
          ? "bg-fuchsia-700/50 text-fuchsia-300 hover:bg-fuchsia-600/70 cursor-pointer shadow-md"
          : "bg-fuchsia-700/30 text-fuchsia-300"
      }`}
  >
    {children}
  </span>
);

export const CompanyCard = ({ company, onBankingClick, onPurchaseClick, onSalesClick }) => {
  const isNeedsReview = company.status === "Needs Review";
  return (
    <div
      className={`bg-gray-800/60 p-5 rounded-2xl shadow-xl transition-all duration-300 border ${
        isNeedsReview ? "border-amber-500/50" : "border-indigo-400/20"
      } hover:shadow-fuchsia-500/20`}
    >
      <div className="flex justify-between items-start mb-3">
        <h4 className="text-xl font-bold text-white">{company.name}</h4>
        <span className="text-gray-400 cursor-pointer">...</span>
      </div>

      <p className="text-sm text-gray-400">
        Status:
        <span
          className={`ml-1 font-semibold ${
            isNeedsReview ? "text-amber-400" : "text-green-400"
          }`}
        >
          {isNeedsReview ? "Needs Review" : "Synchronized"}
        </span>
      </p>
      <p className="text-xs text-gray-500 mt-1">
        Last Sync: {company.syncDate}
      </p>

      <div className="mt-4 pt-3 border-t border-white/10">
        <p className="text-xs text-fuchsia-400 mb-2 font-semibold uppercase tracking-wider">
          Features Enabled
        </p>
        <div className="flex flex-wrap gap-2">
          {company.features.includes("Banking") && (
            <FeatureChip
              isClickable={true}
              onClick={() => onBankingClick(company)}
            >
              Banking
            </FeatureChip>
          )}
          {company.features.includes("Sales") && (
            <FeatureChip isClickable={true} onClick={() => onSalesClick(company)}>Sales</FeatureChip>
          )}
          {company.features.includes("Purchase") && (
            <FeatureChip isClickable={true} onClick={() => onPurchaseClick(company)}>Purchase</FeatureChip>
          )}
        </div>
      </div>
    </div>
  );
};
