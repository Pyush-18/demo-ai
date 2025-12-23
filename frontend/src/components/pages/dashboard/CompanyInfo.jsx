import React, { useState, useEffect } from "react";
import { 
  Pencil, 
  X, 
  ChevronDown, 
  Building2, 
  Briefcase, 
  Users, 
  MapPin, 
  CheckCircle2,
  Globe,
  Wallet
} from "lucide-react";
import { useSelector } from "react-redux";
import {CompanyInfoModal} from "../dashboard/modal/CompanyInfoModal"


const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-start gap-4 transition-all hover:bg-white/10 hover:border-white/10 group">
    <div className="p-2.5 rounded-lg bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="font-semibold text-zinc-100 text-lg">{value || "-"}</p>
    </div>
  </div>
);




export const CompanyInfo = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { companyInfo } = useSelector((state) => state.auth);

  console.log(companyInfo)
  
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Company Profile</h2>
          <p className="text-zinc-400 mt-1">Manage your organization details and public information.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 transition-all hover:scale-105 active:scale-95 text-sm font-medium group"
        >
          <Pencil size={16} className="group-hover:text-violet-400 transition-colors" />
          <span>Edit Details</span>
        </button>
      </div>

      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-1 overflow-hidden">

        <div className="bg-zinc-950/80 rounded-[22px] p-6 sm:p-8 space-y-10">
  
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
              Organization Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard 
                icon={Building2} 
                label="Company Name" 
                value={companyInfo?.companyName} 
              />
              <InfoCard 
                icon={Briefcase} 
                label="Profession" 
                value={companyInfo?.profession} 
              />
              <InfoCard 
                icon={Users} 
                label="Team Size" 
                value={companyInfo?.employees ? `${companyInfo.employees} Employees` : '-'} 
              />
              <InfoCard 
                icon={Wallet} 
                label="GST Number" 
                value={companyInfo?.noGst ? "Not Applicable" : (companyInfo?.gstNumber || "-")} 
              />
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          <div>
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-6 bg-violet-500 rounded-full"></span>
              Location Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <InfoCard 
                icon={MapPin} 
                label="Address" 
                value={companyInfo?.address} 
              />
              <InfoCard 
                icon={MapPin} 
                label="City" 
                value={companyInfo?.city} 
              />
              <InfoCard 
                icon={MapPin} 
                label="State" 
                value={companyInfo?.state} 
              />
              <InfoCard 
                icon={MapPin} 
                label="Pincode" 
                value={companyInfo?.pincode} 
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              <InfoCard 
                icon={Globe} 
                label="Country" 
                value={companyInfo?.country} 
              />
              <InfoCard 
                icon={Building2} 
                label="Represents" 
                value={companyInfo?.represents} 
              />
            </div>
          </div>

        </div>
      </div>
      
      <CompanyInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};