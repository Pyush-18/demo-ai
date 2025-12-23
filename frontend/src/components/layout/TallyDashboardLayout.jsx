import { useState } from "react";
import { TallyHeader } from "../index.js";
import DashboardContent from "../pages/tally dashboard/DashboardContent.jsx";
export function TallyDashboardLayout() {
    const [currentView, setCurrentView] = useState('importer');
  return (
    <div className="min-h-screen bg-[#060313] text-gray-200 font-sans bg-gradient-to-br from-[#060313] via-[#09041a] to-[#12072c]">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        <TallyHeader currentView={currentView} setCurrentView={setCurrentView} />
        <main className="space-y-8">
          <DashboardContent />
          {/* {currentView === 'importer' ? (
            <>
              <DataViewer />
              <TransactionProcessor />
            </>
          ) : (
            <PendingDashboard />
          )} */}
        </main>
      </div>
    </div>
  );
}

