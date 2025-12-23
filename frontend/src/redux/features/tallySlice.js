import { createSlice } from "@reduxjs/toolkit";
import {
  fetchPurchaseInvoicesFromFirebase,
  fetchSalesInvoicesFromFirebase,
} from "../../config/firebaseService";
const initialState = {
  userDataMap: {},
  currentUserId: null,
  files: [],
  selectedFileId: null,
  activeCompanies: [],
  availableCompanies: [],
  selectedCompany: null,
  postingMode: "individual",
  savedTransactions: [],
  history: [],
  salesFiles: [],
  purchaseFiles: [],
  selectedSalesFileId: null,
  selectedPurchaseFileId: null,
  prefetchedTallyData: {},
};
const getCurrentUserData = (state) => {
  if (!state.currentUserId) return null;

  if (!state.userDataMap[state.currentUserId]) {
    state.userDataMap[state.currentUserId] = {
      files: [],
      selectedFileId: null,
      activeCompanies: [],
      availableCompanies: [],
      selectedCompany: null,
      postingMode: "individual",
      savedTransactions: [],
      history: [],
      salesFiles: [],
      purchaseFiles: [],
      selectedSalesFileId: null,
      selectedPurchaseFileId: null,
      prefetchedTallyData: {}, 
    };
  }

  if (!state.userDataMap[state.currentUserId].prefetchedTallyData) {
    state.userDataMap[state.currentUserId].prefetchedTallyData = {};
  }

  return state.userDataMap[state.currentUserId];
};
const syncLegacyFields = (state) => {
  const userData = getCurrentUserData(state);
  if (userData) {
    state.files = userData.files;
    state.selectedFileId = userData.selectedFileId;
    state.activeCompanies = userData.activeCompanies;
    state.availableCompanies = userData.availableCompanies;
    state.selectedCompany = userData.selectedCompany;
    state.postingMode = userData.postingMode;
    state.savedTransactions = userData.savedTransactions;
    state.history = userData.history;
    state.salesFiles = userData.salesFiles;
    state.purchaseFiles = userData.purchaseFiles;
    state.selectedSalesFileId = userData.selectedSalesFileId;
    state.selectedPurchaseFileId = userData.selectedPurchaseFileId;
    state.prefetchedTallyData = userData.prefetchedTallyData || {};

    console.log(
      "🔄 syncLegacyFields - prefetchedTallyData synced:",
      Object.keys(state.prefetchedTallyData || {}).length,
      "companies"
    );
  }
};
const findPointers = (userData, companyId, fileId) => {
  if (!userData) return { company: null, file: null };
  const company = userData.files.find((c) => c.id === companyId);
  const file =
    company && fileId
      ? company.bankingFiles.find((f) => f.id === fileId)
      : null;
  return { company, file };
};
const findSalesPointers = (userData, companyId, fileId) => {
  if (!userData) return { salesFile: null };
  const salesFile = userData.salesFiles.find(
    (f) => f.id === fileId && f.companyId === companyId
  );
  return { salesFile };
};
const findPurchasePointers = (userData, companyId, fileId) => {
  if (!userData) return { purchaseFile: null };
  const purchaseFile = userData.purchaseFiles.find(
    (f) => f.id === fileId && f.companyId === companyId
  );
  return { purchaseFile };
};
const tallySlice = createSlice({
  name: "tally",
  initialState,
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUserId = action.payload;
      syncLegacyFields(state);
    },
    clearCurrentUser: (state) => {
      state.currentUserId = null;
      state.files = [];
      state.selectedFileId = null;
      state.activeCompanies = [];
      state.availableCompanies = [];
      state.selectedCompany = null;
      state.postingMode = "individual";
      state.savedTransactions = [];
      state.history = [];
      state.salesFiles = [];
      state.purchaseFiles = [];
      state.selectedSalesFileId = null;
      state.selectedPurchaseFileId = null;
    },
    addCompany: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const newCompany = action.payload;
      const exists = userData.files.some((c) => c.id === newCompany.id);
      if (!exists) {
        userData.files.push({
          id: newCompany.id,
          name: newCompany.name,
          ledgers: [],
          bankLedgers: [],
          selectedLedger: null,
          selectedBankLedger: null,
          bankingFiles: [],
        });
      }
      syncLegacyFields(state);
    },
    setAvailableCompanies: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.availableCompanies = action.payload;
      syncLegacyFields(state);
    },
    addActiveCompany: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      if (!Array.isArray(userData.activeCompanies))
        userData.activeCompanies = [];
      const exists = userData.activeCompanies.some(
        (c) => c.name === action.payload.name
      );
      if (!exists) userData.activeCompanies.push(action.payload);
      syncLegacyFields(state);
    },
    removeAvailableCompany: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.availableCompanies = userData.availableCompanies.filter(
        (c) => c.id !== action.payload
      );
      syncLegacyFields(state);
    },
    setSelectedCompany: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.selectedCompany = action.payload;
      syncLegacyFields(state);
    },
    clearSelectedCompany: (state) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.selectedCompany = null;
      syncLegacyFields(state);
    },
    addBankingFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, file } = action.payload;
      const company = userData.files.find((c) => c.id === companyId);
      if (company) {
        const fileExists = company.bankingFiles.some((f) => f.id === file.id);
        if (!fileExists) {
          company.bankingFiles.push({
            companyId: companyId,
            id: file.id,
            name: file.name,
            uploadDate: file.uploadDate || new Date().toISOString(),
            uploadedBy: file.uploadedBy || "",
            status: file.status,
            dateRange: file?.dateRange,
            selectedLedger: file.selectedLedger || null,
            selectedBankLedger: file.selectedBankLedger || null,
            transactions: [],
            rejectedTransactions: [],
            approved: [],
          });
        }
      }
      syncLegacyFields(state);
    },
    selectFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.selectedFileId = action.payload;
      syncLegacyFields(state);
    },
    removeFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId } = action.payload;
      const company = userData.files.find((c) => c.id === companyId);
      if (company) {
        company.bankingFiles = company.bankingFiles.filter(
          (f) => f.id !== fileId
        );
        if (userData.selectedFileId === fileId) userData.selectedFileId = null;
      }
      syncLegacyFields(state);
    },
    setTransactions: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, transactions } = action.payload;
      const { file } = findPointers(userData, companyId, fileId);
      if (file) file.transactions = transactions;
      syncLegacyFields(state);
    },
    approveTransaction: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, transactionId } = action.payload;
      const { file } = findPointers(userData, companyId, fileId);
      if (!file) return;
      const transaction = file.transactions.find((t) => t.id === transactionId);
      if (!transaction) return;
      transaction.status = "Resolved";
      if (!file.approved.some((t) => t.id === transactionId)) {
        file.approved.push({ ...transaction });
      }
      syncLegacyFields(state);
    },
    deleteTransaction: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, transactionId } = action.payload;
      const { file } = findPointers(userData, companyId, fileId);
      if (!file) return;
      const tx = file.transactions.find((t) => t.id === transactionId);
      if (tx) tx.status = "Deleted";
      syncLegacyFields(state);
    },
    updateTransaction: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, id, newStatus, newLedger } = action.payload;
      const { file } = findPointers(userData, companyId, fileId);
      if (!file) return;
      const index = file.transactions.findIndex((tx) => tx.id === id);
      if (index !== -1) {
        if (newStatus) file.transactions[index].currentStatus = newStatus;
        if (newLedger) file.transactions[index].assignedLedger = newLedger;
      }
      syncLegacyFields(state);
    },
    setRejectedTransactions: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, rejectedTransactions } = action.payload;
      const { file } = findPointers(userData, companyId, fileId);
      if (!file) return;
      if (Array.isArray(rejectedTransactions)) {
        file.rejectedTransactions = rejectedTransactions;
      } else {
        file.rejectedTransactions.push(rejectedTransactions);
      }
      syncLegacyFields(state);
    },
    updateTransactionLedger: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, transactionId, selectedLedger, newStatus } =
        action.payload;
      const company = userData.files.find((c) => c.id === companyId);
      if (!company) return;
      const file = company.bankingFiles?.find((f) => f.id === fileId);
      if (!file) return;
      const transaction = file.transactions?.find(
        (t) => t.id === transactionId
      );
      if (!transaction) return;
      transaction.selectedLedger = selectedLedger;
      transaction.partyLedger = selectedLedger;
      transaction.status = newStatus || "Resolved";
      syncLegacyFields(state);
    },
    bulkUpdateLedger: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, transactionIds, newLedger, newStatus } =
        action.payload;
      const company = userData.files.find((c) => c.id === companyId);
      if (!company) return;
      const file = company.bankingFiles?.find((f) => f.id === fileId);
      if (!file || !file.transactions) return;
      transactionIds.forEach((transactionId) => {
        const transaction = file.transactions.find(
          (t) => t.id === transactionId
        );
        if (transaction && transaction.status !== "Deleted") {
          transaction.selectedLedger = newLedger;
          transaction.partyLedger = newLedger;
          transaction.status = newStatus || "Resolved";
        }
      });
      syncLegacyFields(state);
    },
    setLedgers: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, ledgers } = action.payload;
      const company = userData.files.find((c) => c.id === companyId);
      if (company) company.ledgers = ledgers || [];
      syncLegacyFields(state);
    },
    setBankLedgers: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, bankLedgers } = action.payload;
      const company = userData.files.find((c) => c.id === companyId);
      if (company) company.bankLedgers = bankLedgers;
      syncLegacyFields(state);
    },
    setSelectedLedger: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, ledger } = action.payload;
      const company = userData.files.find((c) => c.id === companyId);
      if (company) company.selectedLedger = ledger;
      syncLegacyFields(state);
    },
    setSelectedBankLedger: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, bankLedger } = action.payload;
      const company = userData.files.find((c) => c.id === companyId);
      if (company) company.selectedBankLedger = bankLedger;
      syncLegacyFields(state);
    },
    setPostingMode: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.postingMode = action.payload;
      syncLegacyFields(state);
    },
    setSelectedFileId: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.selectedFileId = action.payload;
      syncLegacyFields(state);
    },
    addToSavedTransactions: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const transaction = {
        ...action.payload,
        savedAt: new Date().toISOString(),
        postedSuccessfully: true,
      };
      userData.savedTransactions.push(transaction);
      syncLegacyFields(state);
    },
    addToHistory: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const transaction = {
        ...action.payload,
        historyDate: new Date().toISOString(),
      };
      userData.history.push(transaction);
      syncLegacyFields(state);
    },
    bulkAddToSavedTransactions: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const transactions = action.payload.map((tx) => ({
        ...tx,
        savedAt: new Date().toISOString(),
        postedSuccessfully: true,
      }));
      userData.savedTransactions.push(...transactions);
      syncLegacyFields(state);
    },
    bulkAddToHistory: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const transactions = action.payload.map((tx) => ({
        ...tx,
        historyDate: new Date().toISOString(),
      }));
      userData.history.push(...transactions);
      syncLegacyFields(state);
    },
    clearHistory: (state) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.history = [];
      syncLegacyFields(state);
    },
    clearSavedTransactions: (state) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.savedTransactions = [];
      syncLegacyFields(state);
    },
    addSalesFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, file } = action.payload;
      const fileExists = userData.salesFiles.some((f) => f.id === file.id);
      if (!fileExists) {
        userData.salesFiles.push({
          companyId: companyId,
          id: file.id,
          name: file.name,
          uploadDate: file.uploadDate || new Date().toISOString(),
          uploadedBy: file.uploadedBy || "",
          status: file.status || "pending",
          dateRange: file?.dateRange,
          selectedSalesLedger: file.selectedSalesLedger || null,
          selectedPartyLedger: file.selectedPartyLedger || null,
          invoices: [],
          rejectedInvoices: [],
          approvedInvoices: [],
        });
      }
      syncLegacyFields(state);
    },
    selectSalesFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.selectedSalesFileId = action.payload;
      syncLegacyFields(state);
    },
    removeSalesFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId } = action.payload;
      userData.salesFiles = userData.salesFiles.filter(
        (f) => !(f.id === fileId && f.companyId === companyId)
      );
      if (userData.selectedSalesFileId === fileId) {
        userData.selectedSalesFileId = null;
      }
      syncLegacyFields(state);
    },
    setSalesInvoices: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoices } = action.payload;
      const { salesFile } = findSalesPointers(userData, companyId, fileId);
      if (salesFile) salesFile.invoices = invoices;
      syncLegacyFields(state);
    },
    addSalesInvoice: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoice } = action.payload;
      const { salesFile } = findSalesPointers(userData, companyId, fileId);
      if (salesFile) {
        const exists = salesFile.invoices.some((inv) => inv.id === invoice.id);
        if (!exists) {
          salesFile.invoices.push({
            ...invoice,
            status: invoice.status || "pending",
            createdAt: new Date().toISOString(),
          });
        }
      }
      syncLegacyFields(state);
    },
    updateSalesInvoice: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoiceId, updates } = action.payload;
      const { salesFile } = findSalesPointers(userData, companyId, fileId);
      if (!salesFile) return;
      const invoiceIndex = salesFile.invoices.findIndex(
        (inv) => inv.id === invoiceId
      );
      if (invoiceIndex !== -1) {
        salesFile.invoices[invoiceIndex] = {
          ...salesFile.invoices[invoiceIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      syncLegacyFields(state);
    },
    approveSalesInvoice: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoiceId } = action.payload;
      const { salesFile } = findSalesPointers(userData, companyId, fileId);
      if (!salesFile) return;
      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return;
      invoice.status = "Approved";
      invoice.approvedAt = new Date().toISOString();
      if (!salesFile.approvedInvoices.some((inv) => inv.id === invoiceId)) {
        salesFile.approvedInvoices.push({ ...invoice });
      }
      syncLegacyFields(state);
    },
    bulkApproveSalesInvoices: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoiceIds } = action.payload;
      const { salesFile } = findSalesPointers(userData, companyId, fileId);
      if (!salesFile) return;
      const approvedAt = new Date().toISOString();
      invoiceIds.forEach((invoiceId) => {
        const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
        if (invoice && invoice.status !== "Deleted") {
          invoice.status = "Approved";
          invoice.approvedAt = approvedAt;
          if (!salesFile.approvedInvoices.some((inv) => inv.id === invoiceId)) {
            salesFile.approvedInvoices.push({ ...invoice });
          }
        }
      });
      syncLegacyFields(state);
    },
    deleteSalesInvoice: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoiceId } = action.payload;
      const { salesFile } = findSalesPointers(userData, companyId, fileId);
      if (!salesFile) return;
      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        invoice.status = "Deleted";
        invoice.deletedAt = new Date().toISOString();
      }
      syncLegacyFields(state);
    },
    addPurchaseFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, file } = action.payload;
      const fileExists = userData.purchaseFiles.some((f) => f.id === file.id);
      if (!fileExists) {
        userData.purchaseFiles.push({
          companyId: companyId,
          id: file.id,
          name: file.name,
          uploadDate: file.uploadDate || new Date().toISOString(),
          uploadedBy: file.uploadedBy || "",
          status: file.status || "pending",
          dateRange: file?.dateRange,
          selectedPurchaseLedger: file.selectedPurchaseLedger || null,
          selectedPartyLedger: file.selectedPartyLedger || null,
          invoices: [],
          rejectedInvoices: [],
          approvedInvoices: [],
        });
      }
      syncLegacyFields(state);
    },
    selectPurchaseFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      userData.selectedPurchaseFileId = action.payload;
      syncLegacyFields(state);
    },
    removePurchaseFile: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId } = action.payload;
      userData.purchaseFiles = userData.purchaseFiles.filter(
        (f) => !(f.id === fileId && f.companyId === companyId)
      );
      if (userData.selectedPurchaseFileId === fileId) {
        userData.selectedPurchaseFileId = null;
      }
      syncLegacyFields(state);
    },
    setPurchaseInvoices: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoices } = action.payload;
      const { purchaseFile } = findPurchasePointers(
        userData,
        companyId,
        fileId
      );
      if (purchaseFile) purchaseFile.invoices = invoices;
      syncLegacyFields(state);
    },
    addPurchaseInvoice: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoice } = action.payload;
      const { purchaseFile } = findPurchasePointers(
        userData,
        companyId,
        fileId
      );
      if (purchaseFile) {
        const exists = purchaseFile.invoices.some(
          (inv) => inv.id === invoice.id
        );
        if (!exists) {
          purchaseFile.invoices.push({
            ...invoice,
            status: invoice.status || "pending",
            createdAt: new Date().toISOString(),
          });
        }
      }
      syncLegacyFields(state);
    },
    updatePurchaseInvoice: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoiceId, updates } = action.payload;
      const { purchaseFile } = findPurchasePointers(
        userData,
        companyId,
        fileId
      );
      if (!purchaseFile) return;
      const invoiceIndex = purchaseFile.invoices.findIndex(
        (inv) => inv.id === invoiceId
      );
      if (invoiceIndex !== -1) {
        purchaseFile.invoices[invoiceIndex] = {
          ...purchaseFile.invoices[invoiceIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
      syncLegacyFields(state);
    },
    approvePurchaseInvoice: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoiceId } = action.payload;
      const { purchaseFile } = findPurchasePointers(
        userData,
        companyId,
        fileId
      );
      if (!purchaseFile) return;
      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return;
      invoice.status = "Approved";
      invoice.approvedAt = new Date().toISOString();
      if (!purchaseFile.approvedInvoices.some((inv) => inv.id === invoiceId)) {
        purchaseFile.approvedInvoices.push({ ...invoice });
      }
      syncLegacyFields(state);
    },
    bulkApprovePurchaseInvoices: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoiceIds } = action.payload;
      const { purchaseFile } = findPurchasePointers(
        userData,
        companyId,
        fileId
      );
      if (!purchaseFile) return;
      const approvedAt = new Date().toISOString();
      invoiceIds.forEach((invoiceId) => {
        const invoice = purchaseFile.invoices.find(
          (inv) => inv.id === invoiceId
        );
        if (invoice && invoice.status !== "Deleted") {
          invoice.status = "Approved";
          invoice.approvedAt = approvedAt;
          if (
            !purchaseFile.approvedInvoices.some((inv) => inv.id === invoiceId)
          ) {
            purchaseFile.approvedInvoices.push({ ...invoice });
          }
        }
      });
      syncLegacyFields(state);
    },
    deletePurchaseInvoice: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;
      const { companyId, fileId, invoiceId } = action.payload;
      const { purchaseFile } = findPurchasePointers(
        userData,
        companyId,
        fileId
      );
      if (!purchaseFile) return;
      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        invoice.status = "Deleted";
        invoice.deletedAt = new Date().toISOString();
      }
      syncLegacyFields(state);
    },
    setPrefetchedTallyData: (state, action) => {

      const userData = getCurrentUserData(state);

      if (!userData) {
        return;
      }

      const { companyId, ledgers, stockItems } = action.payload;

      if (!companyId) {
        
        return;
      }

      if (!ledgers || !stockItems) {
       
        return;
      }


      if (!userData.prefetchedTallyData) {
        userData.prefetchedTallyData = {};
      }

      userData.prefetchedTallyData[companyId] = {
        ledgers,
        stockItems,
        timestamp: Date.now(),
      };

  

      syncLegacyFields(state);

    },
    clearPrefetchedTallyData: (state, action) => {
      const userData = getCurrentUserData(state);
      if (!userData) return;

      const companyId = action.payload;
      if (userData.prefetchedTallyData?.[companyId]) {
        delete userData.prefetchedTallyData[companyId];
      }
      syncLegacyFields(state);
    },
  },
});
export const {
  setCurrentUser,
  clearCurrentUser,
  addCompany,
  setAvailableCompanies,
  addActiveCompany,
  removeAvailableCompany,
  setSelectedCompany,
  clearSelectedCompany,
  addBankingFile,
  selectFile,
  removeFile,
  setTransactions,
  approveTransaction,
  deleteTransaction,
  updateTransaction,
  setRejectedTransactions,
  updateTransactionLedger,
  bulkUpdateLedger,
  setLedgers,
  setBankLedgers,
  setSelectedLedger,
  setSelectedBankLedger,
  setPostingMode,
  setSelectedFileId,
  addToSavedTransactions,
  addToHistory,
  bulkAddToSavedTransactions,
  bulkAddToHistory,
  clearHistory,
  clearSavedTransactions,
  addSalesFile,
  selectSalesFile,
  removeSalesFile,
  setSalesInvoices,
  addSalesInvoice,
  updateSalesInvoice,
  approveSalesInvoice,
  bulkApproveSalesInvoices,
  deleteSalesInvoice,
  addPurchaseFile,
  selectPurchaseFile,
  removePurchaseFile,
  setPurchaseInvoices,
  addPurchaseInvoice,
  updatePurchaseInvoice,
  approvePurchaseInvoice,
  bulkApprovePurchaseInvoices,
  deletePurchaseInvoice,
  setPrefetchedTallyData,
  clearPrefetchedTallyData,
} = tallySlice.actions;
export default tallySlice.reducer;
