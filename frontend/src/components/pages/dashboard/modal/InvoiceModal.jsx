import React from "react";
import {
  X,
  FileText,
  Calendar,
  User,
  Package,
  CheckSquare,
  ArrowDownCircle,
  ArrowUpCircle,
  Hash,
  Download,
  Printer
} from "lucide-react";

export const InvoiceModal = ({ 
  isOpen, 
  onClose, 
  invoiceData, 
  type = "sales" 
}) => {
  if (!isOpen) return null;

  const isSales = type === "sales";
  const themeColor = isSales ? "text-fuchsia-400" : "text-cyan-400";
  const gradient = isSales 
    ? "from-fuchsia-500/20 to-purple-500/5" 
    : "from-cyan-500/20 to-blue-500/5";
  const borderHighlight = isSales ? "border-fuchsia-500/30" : "border-cyan-500/30";


  const formatCurrency = (val) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);

  const formatDate = (date) => 
    date ? new Date(date).toLocaleDateString('en-GB') : "N/A";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">

      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className={`relative w-full max-w-5xl bg-[#0B0D14] border ${borderHighlight} rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200`}>
        
        <div className={`px-8 py-5 border-b border-white/5 bg-gradient-to-r ${gradient} flex items-center justify-between`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-gray-900/50 border border-white/10 ${themeColor}`}>
              {isSales ? <ArrowUpCircle size={24} /> : <ArrowDownCircle size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {isSales ? "Sales Invoice" : "Purchase Voucher"}
                </h2>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  invoiceData.status === "Approved" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
                  invoiceData.status === "Pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                  "bg-red-500/10 border-red-500/20 text-red-400"
                }`}>
                  {invoiceData.status}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                <Hash size={14} />
                <span className="font-mono text-gray-300">{invoiceData.voucherNo || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
   
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Printer size={18} />
            </button>
            <button className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
              <Download size={18} />
            </button>
            <div className="h-6 w-px bg-white/10 mx-1"></div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard 
                label="Party Name" 
                value={invoiceData.partyName} 
                icon={<User size={16} />} 
              />
              <SummaryCard 
                label="Voucher Date" 
                value={formatDate(invoiceData.voucherDate)} 
                icon={<Calendar size={16} />} 
              />
              <SummaryCard 
                label="Voucher Type" 
                value={invoiceData.voucherType} 
                icon={<FileText size={16} />} 
              />
              <SummaryCard 
                label={isSales ? "Sales Ledger" : "Purchase Ledger"} 
                value={invoiceData.mainLedger} 
                icon={<Package size={16} />} 
              />
            </div>

            <div className="space-y-4">
              <h3 className={`text-sm font-semibold uppercase tracking-wider ${themeColor}`}>Line Items</h3>
              <div className="bg-gray-900/40 rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.02]">
                      <th className="px-6 py-4 text-left font-medium text-gray-400">Item Description</th>
                      <th className="px-6 py-4 text-right font-medium text-gray-400">Qty</th>
                      <th className="px-6 py-4 text-right font-medium text-gray-400">Rate</th>
                      <th className="px-6 py-4 text-right font-medium text-gray-400">Disc %</th>
                      <th className="px-6 py-4 text-right font-medium text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {invoiceData.items?.map((item, idx) => {
                       const qty = parseFloat(item.quantity) || 0;
                       const rate = parseFloat(item.rate) || 0;
                       const disc = parseFloat(item.discountPercentage) || 0;
                       const addDisc = parseFloat(item.additionalDiscountPercentage) || 0;
                  
                       const grossAmount = qty * rate;
                       const discAmt1 = (grossAmount * disc) / 100;
                       const remainder = grossAmount - discAmt1;
                       const discAmt2 = (remainder * addDisc) / 100;
                       const amount = grossAmount - discAmt1 - discAmt2;

                       return (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-200">{item.stockItemName}</div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400 tabular-nums">
                            {qty} <span className="text-xs text-gray-600 ml-1">{item.unit}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-gray-400 tabular-nums">
                            {formatCurrency(rate)}
                          </td>
                          <td className="px-6 py-4 text-right text-gray-500 tabular-nums">
                            {(disc > 0 || addDisc > 0) ? (
                                <span className="text-amber-500/80">
                                    {disc > 0 && `${disc}%`}
                                    {addDisc > 0 && ` + ${addDisc}%`}
                                </span>
                            ) : "-"}
                          </td>
                          <td className="px-6 py-4 text-right text-white font-medium tabular-nums">
                            {formatCurrency(amount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
              
              <div className="flex-1 space-y-6">
                {(invoiceData.ledgers?.length > 0 || invoiceData.taxes?.length > 0) && (
                   <div className="space-y-3">
                     <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Additional Charges & Taxes</h3>
                     <div className="bg-gray-900/40 rounded-xl border border-white/5 p-4 space-y-3">
                        {invoiceData.ledgers?.map((ledger, i) => (
                           <div key={`l-${i}`} className="flex justify-between text-sm">
                              <span className="text-gray-400">{ledger.ledgerName}</span>
                              <span className="text-gray-200 tabular-nums font-medium">{formatCurrency(ledger.amount)}</span>
                           </div>
                        ))}
                        {invoiceData.taxes?.map((tax, i) => (
                           <div key={`t-${i}`} className="flex justify-between text-sm">
                              <span className="text-gray-400">{tax.ledgerName} <span className="text-xs text-gray-600">({tax.percentage}%)</span></span>
                              <span className="text-gray-200 tabular-nums font-medium">{formatCurrency(tax.amount)}</span>
                           </div>
                        ))}
                     </div>
                   </div>
                )}
                
                {invoiceData.narration && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">Narration</h3>
                    <div className="p-4 bg-gray-900/40 rounded-xl border border-white/5 text-sm text-gray-400 italic leading-relaxed">
                      "{invoiceData.narration}"
                    </div>
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 shrink-0">
                <div className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 p-6 shadow-xl relative overflow-hidden`}>
            
                   <div className={`absolute -top-10 -right-10 w-32 h-32 ${isSales ? 'bg-fuchsia-500/20' : 'bg-cyan-500/20'} blur-3xl rounded-full pointer-events-none`}></div>

                   <div className="space-y-4 relative z-10">
                      <div className="flex justify-between text-sm text-gray-400">
                         <span>Subtotal</span>
                         <span className="text-white tabular-nums">{formatCurrency(invoiceData.totals?.itemTotal)}</span>
                      </div>
                      
                      {invoiceData.totals?.ledgerTotal > 0 && (
                        <div className="flex justify-between text-sm text-gray-400">
                           <span>Charges</span>
                           <span className="text-white tabular-nums">{formatCurrency(invoiceData.totals.ledgerTotal)}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm text-gray-400">
                         <span>Tax Total</span>
                         <span className="text-white tabular-nums">{formatCurrency(invoiceData.totals?.taxTotal)}</span>
                      </div>

                      <div className="h-px bg-white/10 my-2"></div>

                      <div className="flex justify-between items-end">
                         <span className={`text-sm font-semibold uppercase tracking-wider ${themeColor}`}>Grand Total</span>
                         <span className="text-2xl font-bold text-white tabular-nums leading-none">
                            {formatCurrency(invoiceData.totals?.grandTotal)}
                         </span>
                      </div>
                   </div>
                </div>

                {invoiceData.syncedToTally && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-emerald-400 bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/10">
                    <CheckSquare size={16} />
                    <span className="text-xs font-semibold">Synced to Tally</span>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon }) => (
  <div className="bg-gray-900/40 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
    <div className="flex items-center gap-2 text-gray-500 mb-1.5">
      {icon}
      <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-white font-medium truncate" title={value || "N/A"}>
      {value || "N/A"}
    </div>
  </div>
);