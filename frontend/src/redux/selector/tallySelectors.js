import { createSelector } from "@reduxjs/toolkit";

const selectTallyState = (state) => state.tally;

export const selectAllCompanies = createSelector(
  [selectTallyState],
  (tally) => tally.files
);

export const selectActiveCompanies = createSelector(
  [selectTallyState],
  (tally) => tally.activeCompanies || []
);

export const selectAvailableCompanies = createSelector(
  [selectTallyState],
  (tally) => tally.availableCompanies || []
);

export const selectSelectedCompany = createSelector(
  [selectTallyState],
  (tally) => tally.selectedCompany
);

export const selectCompanyById = (companyId) =>
  createSelector([selectAllCompanies], (companies) =>
    companies.find((c) => c.id === companyId)
  );

export const selectAllBankingFiles = createSelector(
  [selectAllCompanies],
  (companies) => {
    return companies.flatMap((company) =>
      (company.bankingFiles || []).map((file) => ({
        ...file,
        companyId: company.id,
        companyName: company.name,
      }))
    );
  }
);

export const selectBankingFilesByCompany = (companyId) =>
  createSelector(
    [selectCompanyById(companyId)],
    (company) => company?.bankingFiles || []
  );

export const selectSelectedBankingFileId = createSelector(
  [selectTallyState],
  (tally) => tally.selectedFileId
);

export const selectSelectedBankingFile = createSelector(
  [selectAllBankingFiles, selectSelectedBankingFileId],
  (files, selectedId) => files.find((f) => f.id === selectedId)
);

export const selectBankingFileById = (companyId, fileId) =>
  createSelector([selectBankingFilesByCompany(companyId)], (files) =>
    files.find((f) => f.id === fileId)
  );

export const selectTransactionsByFile = (companyId, fileId) =>
  createSelector(
    [selectBankingFileById(companyId, fileId)],
    (file) => file?.transactions || []
  );

export const selectApprovedTransactions = (companyId, fileId) =>
  createSelector(
    [selectBankingFileById(companyId, fileId)],
    (file) => file?.approved || []
  );

export const selectRejectedTransactions = (companyId, fileId) =>
  createSelector(
    [selectBankingFileById(companyId, fileId)],
    (file) => file?.rejectedTransactions || []
  );

export const selectPendingTransactions = (companyId, fileId) =>
  createSelector(
    [selectTransactionsByFile(companyId, fileId)],
    (transactions) =>
      transactions.filter((t) => t.status === "Pending" || !t.status)
  );

export const selectResolvedTransactions = (companyId, fileId) =>
  createSelector(
    [selectTransactionsByFile(companyId, fileId)],
    (transactions) => transactions.filter((t) => t.status === "Resolved")
  );

export const selectDeletedTransactions = (companyId, fileId) =>
  createSelector(
    [selectTransactionsByFile(companyId, fileId)],
    (transactions) => transactions.filter((t) => t.status === "Deleted")
  );


export const selectPrefetchedTallyData = (companyId) => {
  if (!companyId) {
    return createSelector([(state) => state], () => null);
  }

  return createSelector(
    [(state) => state.tally.currentUserId, (state) => state.tally.userDataMap],
    (currentUserId, userDataMap) => {
      if (!currentUserId) return null;
      const userData = userDataMap?.[currentUserId];
      if (!userData?.prefetchedTallyData) return null;
      return userData.prefetchedTallyData[companyId] || null;
    }
  );
};

export const selectAllLedgers = (companyId) =>
  createSelector(
    [(state) => state.tally.userDataMap?.[state.tally.currentUserId]],
    (userData) => {
      const company = userData?.files?.find((c) => c.id === companyId);
      return company?.ledgers || [];
    }
  );

export const selectStockItems = (companyId) =>
  createSelector(
    [(state) => state.tally.userDataMap?.[state.tally.currentUserId]],
    (userData) => {
      const company = userData?.files?.find((c) => c.id === companyId);
      return company?.stockItems || [];
    }
  );

export const selectAllSalesFiles = createSelector(
  [selectTallyState],
  (tally) => tally.salesFiles || []
);

export const selectSelectedSalesFileId = createSelector(
  [selectTallyState],
  (tally) => tally.selectedSalesFileId
);

export const selectSelectedSalesFile = createSelector(
  [selectAllSalesFiles, selectSelectedSalesFileId],
  (files, selectedId) => files.find((f) => f.id === selectedId)
);

export const selectSalesFileById = (companyId, fileId) =>
  createSelector([selectSalesFilesByCompany(companyId)], (files) =>
    files.find((f) => f.id === fileId)
  );

export const selectSalesFilesByCompany = (companyId) =>
  createSelector(
    [
      (state) =>
        state.tally.userDataMap[state.tally.currentUserId]?.salesFiles || [],
    ],
    (salesFiles) => salesFiles.filter((file) => file.companyId === companyId)
  );

export const selectSalesInvoicesByFile = (companyId, fileId) =>
  createSelector(
    [
      (state) =>
        state.tally.userDataMap[state.tally.currentUserId]?.salesFiles || [],
    ],
    (salesFiles) => {
      const file = salesFiles.find(
        (f) => f.companyId === companyId && f.id === fileId
      );
      return file?.invoices || [];
    }
  );

export const selectApprovedSalesInvoices = (companyId, fileId) =>
  createSelector(
    [selectSalesFileById(companyId, fileId)],
    (file) => file?.approvedInvoices || []
  );

export const selectRejectedSalesInvoices = (companyId, fileId) =>
  createSelector(
    [selectSalesFileById(companyId, fileId)],
    (file) => file?.rejectedInvoices || []
  );

export const selectPendingSalesInvoices = (companyId, fileId) =>
  createSelector([selectSalesInvoicesByFile(companyId, fileId)], (invoices) =>
    invoices.filter((inv) => inv.status === "pending" || !inv.status)
  );

export const selectSalesInvoiceById = (companyId, fileId, invoiceId) =>
  createSelector([selectSalesInvoicesByFile(companyId, fileId)], (invoices) =>
    invoices.find((inv) => inv.id === invoiceId)
  );

export const selectSalesFileTotals = (companyId, fileId) =>
  createSelector(
    [selectSalesFileById(companyId, fileId)],
    (file) =>
      file?.totals || {
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        invoiceCount: 0,
      }
  );

export const selectAllPurchaseFiles = createSelector(
  [selectTallyState],
  (tally) => tally.purchaseFiles || []
);

export const selectPurchaseFilesByCompany = (companyId) =>
  createSelector(
    [
      (state) =>
        state.tally.userDataMap[state.tally.currentUserId]?.purchaseFiles || [],
    ],
    (purchaseFiles) =>
      purchaseFiles.filter((file) => file.companyId === companyId)
  );

export const selectSelectedPurchaseFileId = createSelector(
  [selectTallyState],
  (tally) => tally.selectedPurchaseFileId
);

export const selectSelectedPurchaseFile = createSelector(
  [selectAllPurchaseFiles, selectSelectedPurchaseFileId],
  (files, selectedId) => files.find((f) => f.id === selectedId)
);

export const selectPurchaseFileById = (companyId, fileId) =>
  createSelector([selectPurchaseFilesByCompany(companyId)], (files) =>
    files.find((f) => f.id === fileId)
  );


export const selectPurchaseInvoicesByFile = (companyId, fileId) =>
  createSelector(
    [
      (state) =>
        state.tally.userDataMap[state.tally.currentUserId]?.purchaseFiles || [],
    ],
    (purchaseFiles) => {
      const file = purchaseFiles.find(
        (f) => f.companyId === companyId && f.id === fileId
      );
      return file?.invoices || [];
    }
  );

export const selectApprovedPurchaseInvoices = (companyId, fileId) =>
  createSelector(
    [selectPurchaseFileById(companyId, fileId)],
    (file) => file?.approvedInvoices || []
  );

export const selectRejectedPurchaseInvoices = (companyId, fileId) =>
  createSelector(
    [selectPurchaseFileById(companyId, fileId)],
    (file) => file?.rejectedInvoices || []
  );

export const selectPendingPurchaseInvoices = (companyId, fileId) =>
  createSelector(
    [selectPurchaseInvoicesByFile(companyId, fileId)],
    (invoices) =>
      invoices.filter((inv) => inv.status === "pending" || !inv.status)
  );

export const selectPurchaseInvoiceById = (companyId, fileId, invoiceId) =>
  createSelector(
    [selectPurchaseInvoicesByFile(companyId, fileId)],
    (invoices) => invoices.find((inv) => inv.id === invoiceId)
  );

export const selectPurchaseFileTotals = (companyId, fileId) =>
  createSelector(
    [selectPurchaseFileById(companyId, fileId)],
    (file) =>
      file?.totals || {
        subtotal: 0,
        taxTotal: 0,
        grandTotal: 0,
        invoiceCount: 0,
      }
  );

export const selectLedgersByCompany = (companyId) =>
  createSelector(
    [selectCompanyById(companyId)],
    (company) => company?.ledgers || []
  );

export const selectBankLedgersByCompany = (companyId) =>
  createSelector(
    [selectCompanyById(companyId)],
    (company) => company?.bankLedgers || []
  );

export const selectSelectedLedger = (companyId) =>
  createSelector(
    [selectCompanyById(companyId)],
    (company) => company?.selectedLedger
  );

export const selectSelectedBankLedger = (companyId) =>
  createSelector(
    [selectCompanyById(companyId)],
    (company) => company?.selectedBankLedger
  );

export const selectSavedTransactions = createSelector(
  [selectTallyState],
  (tally) => tally.savedTransactions || []
);

export const selectHistory = createSelector(
  [selectTallyState],
  (tally) => tally.history || []
);

export const selectPostingMode = createSelector(
  [selectTallyState],
  (tally) => tally.postingMode || "individual"
);

export const selectBankingFileStats = (companyId, fileId) =>
  createSelector(
    [
      selectTransactionsByFile(companyId, fileId),
      selectApprovedTransactions(companyId, fileId),
      selectRejectedTransactions(companyId, fileId),
    ],
    (transactions, approved, rejected) => ({
      total: transactions.length,
      approved: approved.length,
      rejected: rejected.length,
      pending: transactions.filter((t) => !t.status || t.status === "Pending")
        .length,
      resolved: transactions.filter((t) => t.status === "Resolved").length,
      deleted: transactions.filter((t) => t.status === "Deleted").length,
    })
  );

export const selectSalesFileStats = (companyId, fileId) =>
  createSelector(
    [
      selectSalesInvoicesByFile(companyId, fileId),
      selectApprovedSalesInvoices(companyId, fileId),
      selectRejectedSalesInvoices(companyId, fileId),
    ],
    (invoices, approved, rejected) => ({
      total: invoices.length,
      approved: approved.length,
      rejected: rejected.length,
      pending: invoices.filter((inv) => !inv.status || inv.status === "pending")
        .length,
      deleted: invoices.filter((inv) => inv.status === "Deleted").length,
    })
  );

export const selectPurchaseFileStats = (companyId, fileId) =>
  createSelector(
    [
      selectPurchaseInvoicesByFile(companyId, fileId),
      selectApprovedPurchaseInvoices(companyId, fileId),
      selectRejectedPurchaseInvoices(companyId, fileId),
    ],
    (invoices, approved, rejected) => ({
      total: invoices.length,
      approved: approved.length,
      rejected: rejected.length,
      pending: invoices.filter((inv) => !inv.status || inv.status === "pending")
        .length,
      deleted: invoices.filter((inv) => inv.status === "Deleted").length,
    })
  );

export const selectAllFilesAcrossCompanies = createSelector(
  [selectAllBankingFiles, selectAllSalesFiles, selectAllPurchaseFiles],
  (banking, sales, purchase) => ({
    banking,
    sales,
    purchase,
    totalCount: banking.length + sales.length + purchase.length,
  })
);

export const selectCompanyOverview = (companyId) =>
  createSelector(
    [
      selectCompanyById(companyId),
      selectBankingFilesByCompany(companyId),
      selectSalesFilesByCompany(companyId),
      selectPurchaseFilesByCompany(companyId),
    ],
    (company, banking, sales, purchase) => ({
      company,
      files: {
        banking: banking.length,
        sales: sales.length,
        purchase: purchase.length,
        total: banking.length + sales.length + purchase.length,
      },
      ledgers: {
        total: company?.ledgers?.length || 0,
        bank: company?.bankLedgers?.length || 0,
      },
    })
  );

export const selectSearchSalesInvoices = (companyId, fileId, searchTerm) =>
  createSelector([selectSalesInvoicesByFile(companyId, fileId)], (invoices) => {
    if (!searchTerm) return invoices;
    const term = searchTerm.toLowerCase();
    return invoices.filter(
      (inv) =>
        inv.id?.toLowerCase().includes(term) ||
        inv.partyName?.toLowerCase().includes(term) ||
        inv.voucherNo?.toLowerCase().includes(term)
    );
  });

export const selectSearchPurchaseInvoices = (companyId, fileId, searchTerm) =>
  createSelector(
    [selectPurchaseInvoicesByFile(companyId, fileId)],
    (invoices) => {
      if (!searchTerm) return invoices;
      const term = searchTerm.toLowerCase();
      return invoices.filter(
        (inv) =>
          inv.id?.toLowerCase().includes(term) ||
          inv.partyName?.toLowerCase().includes(term) ||
          inv.voucherNo?.toLowerCase().includes(term)
      );
    }
  );
