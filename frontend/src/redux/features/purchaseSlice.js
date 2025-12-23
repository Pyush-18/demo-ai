import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  purchaseFiles: [],
  selectedPurchaseFileId: null,
};

const findPurchasePointers = (state, companyId, fileId) => {
  const purchaseFile = state.purchaseFiles.find(
    (f) => f.id === fileId && f.companyId === companyId
  );
  return { purchaseFile };
};

const purchaseSlice = createSlice({
  name: "purchase",
  initialState,
  reducers: {
    
    addPurchaseFile: (state, action) => {
      const { companyId, file } = action.payload;
      
      const fileExists = state.purchaseFiles.some((f) => f.id === file.id);
      if (!fileExists) {
        state.purchaseFiles.push({
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
          totals: null,
        });
      }
    },

    selectPurchaseFile: (state, action) => {
      state.selectedPurchaseFileId = action.payload;
    },

    removePurchaseFile: (state, action) => {
      const { companyId, fileId } = action.payload;
      state.purchaseFiles = state.purchaseFiles.filter(
        (f) => !(f.id === fileId && f.companyId === companyId)
      );
      if (state.selectedPurchaseFileId === fileId) {
        state.selectedPurchaseFileId = null;
      }
    },

    updatePurchaseFileStatus: (state, action) => {
      const { companyId, fileId, status } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (purchaseFile) {
        purchaseFile.status = status;
      }
    },


    setPurchaseInvoices: (state, action) => {
      const { companyId, fileId, invoices } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      if (purchaseFile) purchaseFile.invoices = invoices;
    },

    addPurchaseInvoice: (state, action) => {
      const { companyId, fileId, invoice } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (purchaseFile) {
        const exists = purchaseFile.invoices.some((inv) => inv.id === invoice.id);
        if (!exists) {
          purchaseFile.invoices.push({
            ...invoice,
            status: invoice.status || "pending",
            createdAt: new Date().toISOString(),
          });
        }
      }
    },

    updatePurchaseInvoice: (state, action) => {
      const { companyId, fileId, invoiceId, updates } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
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
    },

    approvePurchaseInvoice: (state, action) => {
      const { companyId, fileId, invoiceId } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return;

      invoice.status = "Approved";
      invoice.approvedAt = new Date().toISOString();

      if (!purchaseFile.approvedInvoices.some((inv) => inv.id === invoiceId)) {
        purchaseFile.approvedInvoices.push({ ...invoice });
      }
    },

    bulkApprovePurchaseInvoices: (state, action) => {
      const { companyId, fileId, invoiceIds } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const approvedAt = new Date().toISOString();

      invoiceIds.forEach((invoiceId) => {
        const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
        if (invoice && invoice.status !== "Deleted") {
          invoice.status = "Approved";
          invoice.approvedAt = approvedAt;

          if (!purchaseFile.approvedInvoices.some((inv) => inv.id === invoiceId)) {
            purchaseFile.approvedInvoices.push({ ...invoice });
          }
        }
      });
    },

    deletePurchaseInvoice: (state, action) => {
      const { companyId, fileId, invoiceId } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        invoice.status = "Deleted";
        invoice.deletedAt = new Date().toISOString();
      }
    },

    rejectPurchaseInvoice: (state, action) => {
      const { companyId, fileId, invoiceId, reason } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        invoice.status = "Rejected";
        invoice.rejectedAt = new Date().toISOString();
        invoice.rejectionReason = reason || "";

        if (!purchaseFile.rejectedInvoices.some((inv) => inv.id === invoiceId)) {
          purchaseFile.rejectedInvoices.push({ ...invoice });
        }
      }
    },


    addPurchaseInvoiceItem: (state, action) => {
      const { companyId, fileId, invoiceId, item } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        if (!invoice.items) invoice.items = [];
        invoice.items.push({
          ...item,
          id: item.id || `item_${Date.now()}_${Math.random()}`,
        });
      }
    },

    updatePurchaseInvoiceItem: (state, action) => {
      const { companyId, fileId, invoiceId, itemId, updates } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.items) {
        const itemIndex = invoice.items.findIndex((item) => item.id === itemId);
        if (itemIndex !== -1) {
          invoice.items[itemIndex] = {
            ...invoice.items[itemIndex],
            ...updates,
          };
        }
      }
    },

    removePurchaseInvoiceItem: (state, action) => {
      const { companyId, fileId, invoiceId, itemId } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.items) {
        invoice.items = invoice.items.filter((item) => item.id !== itemId);
      }
    },

    bulkAddPurchaseInvoiceItems: (state, action) => {
      const { companyId, fileId, invoiceId, items } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        if (!invoice.items) invoice.items = [];
        const newItems = items.map(item => ({
          ...item,
          id: item.id || `item_${Date.now()}_${Math.random()}`,
        }));
        invoice.items.push(...newItems);
      }
    },


    addPurchaseInvoiceLedger: (state, action) => {
      const { companyId, fileId, invoiceId, ledger } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        if (!invoice.ledgers) invoice.ledgers = [];
        invoice.ledgers.push({
          ...ledger,
          id: ledger.id || `ledger_${Date.now()}_${Math.random()}`,
        });
      }
    },

    updatePurchaseInvoiceLedger: (state, action) => {
      const { companyId, fileId, invoiceId, ledgerId, updates } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.ledgers) {
        const ledgerIndex = invoice.ledgers.findIndex((l) => l.id === ledgerId);
        if (ledgerIndex !== -1) {
          invoice.ledgers[ledgerIndex] = {
            ...invoice.ledgers[ledgerIndex],
            ...updates,
          };
        }
      }
    },

    removePurchaseInvoiceLedger: (state, action) => {
      const { companyId, fileId, invoiceId, ledgerId } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.ledgers) {
        invoice.ledgers = invoice.ledgers.filter((l) => l.id !== ledgerId);
      }
    },


    addPurchaseInvoiceTax: (state, action) => {
      const { companyId, fileId, invoiceId, tax } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        if (!invoice.taxes) invoice.taxes = [];
        invoice.taxes.push({
          ...tax,
          id: tax.id || `tax_${Date.now()}_${Math.random()}`,
        });
      }
    },

    updatePurchaseInvoiceTax: (state, action) => {
      const { companyId, fileId, invoiceId, taxId, updates } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.taxes) {
        const taxIndex = invoice.taxes.findIndex((t) => t.id === taxId);
        if (taxIndex !== -1) {
          invoice.taxes[taxIndex] = {
            ...invoice.taxes[taxIndex],
            ...updates,
          };
        }
      }
    },

    removePurchaseInvoiceTax: (state, action) => {
      const { companyId, fileId, invoiceId, taxId } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.taxes) {
        invoice.taxes = invoice.taxes.filter((t) => t.id !== taxId);
      }
    },

    bulkUpdatePurchaseInvoiceTaxes: (state, action) => {
      const { companyId, fileId, invoiceId, taxUpdates } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.taxes) {
        taxUpdates.forEach(({ taxId, updates }) => {
          const taxIndex = invoice.taxes.findIndex((t) => t.id === taxId);
          if (taxIndex !== -1) {
            invoice.taxes[taxIndex] = {
              ...invoice.taxes[taxIndex],
              ...updates,
            };
          }
        });
      }
    },


    setRejectedPurchaseInvoices: (state, action) => {
      const { companyId, fileId, rejectedInvoices } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      if (Array.isArray(rejectedInvoices)) {
        purchaseFile.rejectedInvoices = rejectedInvoices;
      } else {
        purchaseFile.rejectedInvoices.push(rejectedInvoices);
      }
    },

    clearRejectedPurchaseInvoices: (state, action) => {
      const { companyId, fileId } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (purchaseFile) {
        purchaseFile.rejectedInvoices = [];
      }
    },


    setSelectedPurchaseLedger: (state, action) => {
      const { companyId, fileId, ledger } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (purchaseFile) {
        purchaseFile.selectedPurchaseLedger = ledger;
      }
    },

    setSelectedPurchasePartyLedger: (state, action) => {
      const { companyId, fileId, ledger } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (purchaseFile) {
        purchaseFile.selectedPartyLedger = ledger;
      }
    },


    updatePurchaseFileTotals: (state, action) => {
      const { companyId, fileId, totals } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (purchaseFile) {
        purchaseFile.totals = {
          subtotal: totals.subtotal || 0,
          taxTotal: totals.taxTotal || 0,
          grandTotal: totals.grandTotal || 0,
          invoiceCount: totals.invoiceCount || 0,
          discountTotal: totals.discountTotal || 0,
        };
      }
    },

    calculatePurchaseInvoiceTotals: (state, action) => {
      const { companyId, fileId, invoiceId } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return;

      let itemTotal = 0;
      let discountTotal = 0;

      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(item => {
          const qty = parseFloat(item.quantity) || 0;
          const rate = parseFloat(item.rate) || 0;
          const discPerc = parseFloat(item.discountPercentage) || 0;
          const addDiscPerc = parseFloat(item.additionalDiscountPercentage) || 0;
          
          const gross = qty * rate;
          const disc1 = (gross * discPerc) / 100;
          const remainder = gross - disc1;
          const disc2 = (remainder * addDiscPerc) / 100;
          const net = gross - disc1 - disc2;
          
          itemTotal += net;
          discountTotal += (disc1 + disc2);
        });
      }

      let ledgerTotal = 0;
      if (invoice.ledgers && invoice.ledgers.length > 0) {
        invoice.ledgers.forEach(ledger => {
          ledgerTotal += parseFloat(ledger.amount) || 0;
        });
      }

      let taxTotal = 0;
      if (invoice.taxes && invoice.taxes.length > 0) {
        invoice.taxes.forEach(tax => {
          taxTotal += parseFloat(tax.amount) || 0;
        });
      }

      invoice.totals = {
        subtotal: itemTotal,
        ledgerTotal,
        taxTotal,
        grandTotal: itemTotal + ledgerTotal + taxTotal,
        discountTotal,
      };
    },


    bulkUpdatePurchaseInvoiceStatus: (state, action) => {
      const { companyId, fileId, invoiceIds, status } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      invoiceIds.forEach(invoiceId => {
        const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
        if (invoice) {
          invoice.status = status;
          invoice.updatedAt = new Date().toISOString();
        }
      });
    },

    bulkDeletePurchaseInvoices: (state, action) => {
      const { companyId, fileId, invoiceIds } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      const deletedAt = new Date().toISOString();

      invoiceIds.forEach(invoiceId => {
        const invoice = purchaseFile.invoices.find((inv) => inv.id === invoiceId);
        if (invoice) {
          invoice.status = "Deleted";
          invoice.deletedAt = deletedAt;
        }
      });
    },


    clearPurchaseFileData: (state, action) => {
      const { companyId, fileId } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (purchaseFile) {
        purchaseFile.invoices = [];
        purchaseFile.approvedInvoices = [];
        purchaseFile.rejectedInvoices = [];
        purchaseFile.totals = null;
      }
    },

    clearAllPurchaseFiles: (state) => {
      state.purchaseFiles = [];
      state.selectedPurchaseFileId = null;
    },


    filterPurchaseInvoicesByStatus: (state, action) => {
      const { companyId, fileId, status } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile) return;

      purchaseFile.currentFilter = status;
    },

    sortPurchaseInvoices: (state, action) => {
      const { companyId, fileId, sortBy, sortOrder } = action.payload;
      const { purchaseFile } = findPurchasePointers(state, companyId, fileId);
      
      if (!purchaseFile || !purchaseFile.invoices) return;

      purchaseFile.invoices.sort((a, b) => {
        let aVal = a[sortBy];
        let bVal = b[sortBy];

        if (sortBy === 'voucherDate') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    },
  },
});

export const {
  addPurchaseFile,
  selectPurchaseFile,
  removePurchaseFile,
  updatePurchaseFileStatus,
  
  setPurchaseInvoices,
  addPurchaseInvoice,
  updatePurchaseInvoice,
  approvePurchaseInvoice,
  bulkApprovePurchaseInvoices,
  deletePurchaseInvoice,
  rejectPurchaseInvoice,
  
  addPurchaseInvoiceItem,
  updatePurchaseInvoiceItem,
  removePurchaseInvoiceItem,
  bulkAddPurchaseInvoiceItems,
  
  addPurchaseInvoiceLedger,
  updatePurchaseInvoiceLedger,
  removePurchaseInvoiceLedger,
  
  addPurchaseInvoiceTax,
  updatePurchaseInvoiceTax,
  removePurchaseInvoiceTax,
  bulkUpdatePurchaseInvoiceTaxes,
  
  setRejectedPurchaseInvoices,
  clearRejectedPurchaseInvoices,
  
  setSelectedPurchaseLedger,
  setSelectedPurchasePartyLedger,
  
  updatePurchaseFileTotals,
  calculatePurchaseInvoiceTotals,
  
  bulkUpdatePurchaseInvoiceStatus,
  bulkDeletePurchaseInvoices,
  
  clearPurchaseFileData,
  clearAllPurchaseFiles,
  
  filterPurchaseInvoicesByStatus,
  sortPurchaseInvoices,
} = purchaseSlice.actions;

export default purchaseSlice.reducer;