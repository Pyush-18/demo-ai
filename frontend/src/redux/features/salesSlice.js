import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  salesFiles: [],
  selectedSalesFileId: null,
};

const findSalesPointers = (state, companyId, fileId) => {
  const salesFile = state.salesFiles.find(
    (f) => f.id === fileId && f.companyId === companyId
  );
  return { salesFile };
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    addSalesFile: (state, action) => {
      const { companyId, file } = action.payload;
      
      const fileExists = state.salesFiles.some((f) => f.id === file.id);
      if (!fileExists) {
        state.salesFiles.push({
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
    },

    selectSalesFile: (state, action) => {
      state.selectedSalesFileId = action.payload;
    },

    removeSalesFile: (state, action) => {
      const { companyId, fileId } = action.payload;
      state.salesFiles = state.salesFiles.filter(
        (f) => !(f.id === fileId && f.companyId === companyId)
      );
      if (state.selectedSalesFileId === fileId) {
        state.selectedSalesFileId = null;
      }
    },

    setSalesInvoices: (state, action) => {
      const { companyId, fileId, invoices } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      if (salesFile) salesFile.invoices = invoices;
    },

    addSalesInvoice: (state, action) => {
      const { companyId, fileId, invoice } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
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
    },

    updateSalesInvoice: (state, action) => {
      const { companyId, fileId, invoiceId, updates } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
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
    },

    approveSalesInvoice: (state, action) => {
      const { companyId, fileId, invoiceId } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return;

      invoice.status = "Approved";
      invoice.approvedAt = new Date().toISOString();

      if (!salesFile.approvedInvoices.some((inv) => inv.id === invoiceId)) {
        salesFile.approvedInvoices.push({ ...invoice });
      }
    },

    bulkApproveSalesInvoices: (state, action) => {
      const { companyId, fileId, invoiceIds } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
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
    },

    deleteSalesInvoice: (state, action) => {
      const { companyId, fileId, invoiceId } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        invoice.status = "Deleted";
        invoice.deletedAt = new Date().toISOString();
      }
    },

    addSalesInvoiceItem: (state, action) => {
      const { companyId, fileId, invoiceId, item } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        if (!invoice.items) invoice.items = [];
        invoice.items.push({
          ...item,
          id: item.id || `item_${Date.now()}_${Math.random()}`,
        });
      }
    },

    updateSalesInvoiceItem: (state, action) => {
      const { companyId, fileId, invoiceId, itemId, updates } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
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

    removeSalesInvoiceItem: (state, action) => {
      const { companyId, fileId, invoiceId, itemId } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.items) {
        invoice.items = invoice.items.filter((item) => item.id !== itemId);
      }
    },

    addSalesInvoiceLedger: (state, action) => {
      const { companyId, fileId, invoiceId, ledger } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        if (!invoice.ledgers) invoice.ledgers = [];
        invoice.ledgers.push({
          ...ledger,
          id: ledger.id || `ledger_${Date.now()}_${Math.random()}`,
        });
      }
    },

    updateSalesInvoiceLedger: (state, action) => {
      const { companyId, fileId, invoiceId, ledgerId, updates } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
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

    removeSalesInvoiceLedger: (state, action) => {
      const { companyId, fileId, invoiceId, ledgerId } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.ledgers) {
        invoice.ledgers = invoice.ledgers.filter((l) => l.id !== ledgerId);
      }
    },

    addSalesInvoiceTax: (state, action) => {
      const { companyId, fileId, invoiceId, tax } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice) {
        if (!invoice.taxes) invoice.taxes = [];
        invoice.taxes.push({
          ...tax,
          id: tax.id || `tax_${Date.now()}_${Math.random()}`,
        });
      }
    },

    updateSalesInvoiceTax: (state, action) => {
      const { companyId, fileId, invoiceId, taxId, updates } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
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

    removeSalesInvoiceTax: (state, action) => {
      const { companyId, fileId, invoiceId, taxId } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      const invoice = salesFile.invoices.find((inv) => inv.id === invoiceId);
      if (invoice && invoice.taxes) {
        invoice.taxes = invoice.taxes.filter((t) => t.id !== taxId);
      }
    },

    setRejectedSalesInvoices: (state, action) => {
      const { companyId, fileId, rejectedInvoices } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (!salesFile) return;

      if (Array.isArray(rejectedInvoices)) {
        salesFile.rejectedInvoices = rejectedInvoices;
      } else {
        salesFile.rejectedInvoices.push(rejectedInvoices);
      }
    },

    setSelectedSalesLedger: (state, action) => {
      const { companyId, fileId, ledger } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (salesFile) {
        salesFile.selectedSalesLedger = ledger;
      }
    },

    setSelectedPartyLedger: (state, action) => {
      const { companyId, fileId, ledger } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (salesFile) {
        salesFile.selectedPartyLedger = ledger;
      }
    },

    updateSalesFileTotals: (state, action) => {
      const { companyId, fileId, totals } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (salesFile) {
        salesFile.totals = {
          subtotal: totals.subtotal || 0,
          taxTotal: totals.taxTotal || 0,
          grandTotal: totals.grandTotal || 0,
          invoiceCount: totals.invoiceCount || 0,
        };
      }
    },

    clearSalesFileData: (state, action) => {
      const { companyId, fileId } = action.payload;
      const { salesFile } = findSalesPointers(state, companyId, fileId);
      
      if (salesFile) {
        salesFile.invoices = [];
        salesFile.approvedInvoices = [];
        salesFile.rejectedInvoices = [];
        salesFile.totals = null;
      }
    },
  },
});

export const {
  addSalesFile,
  selectSalesFile,
  removeSalesFile,
  setSalesInvoices,
  addSalesInvoice,
  updateSalesInvoice,
  approveSalesInvoice,
  bulkApproveSalesInvoices,
  deleteSalesInvoice,
  addSalesInvoiceItem,
  updateSalesInvoiceItem,
  removeSalesInvoiceItem,
  addSalesInvoiceLedger,
  updateSalesInvoiceLedger,
  removeSalesInvoiceLedger,
  addSalesInvoiceTax,
  updateSalesInvoiceTax,
  removeSalesInvoiceTax,
  setRejectedSalesInvoices,
  setSelectedSalesLedger,
  setSelectedPartyLedger,
  updateSalesFileTotals,
  clearSalesFileData,
} = salesSlice.actions;

export default salesSlice.reducer;