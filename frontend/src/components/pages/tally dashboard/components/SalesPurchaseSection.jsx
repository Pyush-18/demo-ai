import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import ExcelJS from 'exceljs';
import {
  Upload,
  Settings,
  Plus,
  Trash2,
  X,
  Check,
  FileText,
  Calendar,
  User,
  CreditCard,
  Package,
  ChevronDown,
  Search,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Loader,
} from "lucide-react";
import {
  addSalesFile,
  addSalesInvoice,
  addPurchaseFile,
  addPurchaseInvoice,
  clearPrefetchedTallyData,
  setPrefetchedTallyData,
} from "../../../../redux/features/tallySlice";
import {
  selectSelectedCompany,
  selectLedgersByCompany,
  selectSelectedSalesFile,
  selectSelectedPurchaseFile,
  selectPrefetchedTallyData,
} from "../../../../redux/selector/tallySelectors";
import {
  sendTallyRequest,
  generateFetchLedgersXML,
  generateFetchStockItemsXML,
  parseLedgers,
  parseStockItems,
  generateSalesVoucherXML,
  generatePurchaseVoucherXML,
  validateInvoiceData,
  isTallyResponseSuccess,
  xmlToJson,
  getTallyError,
  formatTallyDate,
  calculateInvoiceTotals,
} from "../../../../utils/tallyUtils";
import {
  fetchPurchaseInvoicesFromFirebase,
  fetchSalesInvoicesFromFirebase,
  savePurchaseInvoiceToFirebase,
  saveSalesInvoiceToFirebase,
} from "../../../../config/firebaseService";

const SalesPurchaseSection = () => {
  const dispatch = useDispatch();

 
  const selectedCompany = useSelector(selectSelectedCompany);
  const prefetchedDataSelector = useMemo(
    () => selectPrefetchedTallyData(selectedCompany?.id),
    [selectedCompany?.id]
  );

  const prefetchedData = useSelector(prefetchedDataSelector);
  const allLedgers = useSelector((state) =>
    selectedCompany ? selectLedgersByCompany(selectedCompany.id)(state) : []
  );
  const { currentUserId } = useSelector((state) => state.tally);
  const selectedSalesFile = useSelector(selectSelectedSalesFile);
  const selectedPurchaseFile = useSelector(selectSelectedPurchaseFile);


  const [activeInvoiceType, setActiveInvoiceType] = useState("item");
  const [voucherType, setVoucherType] = useState("Sales");
  const [voucherNo, setVoucherNo] = useState("");
  const [voucherDate, setVoucherDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedParty, setSelectedParty] = useState("");
  const [partyGst, setPartyGst] = useState("");
  const [selectedLedger, setSelectedLedger] = useState("");
  const [narration, setNarration] = useState("");
  const [showConfig, setShowConfig] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [leftWidth, setLeftWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState(null);
  const [isLoadingTallyData, setIsLoadingTallyData] = useState(false);


  const [ledgers, setLedgers] = useState({
    allLedgers: [],
    salesLedgers: [],
    purchaseLedgers: [],
    partyLedgers: [],
    taxLedgers: [],
    ledgerTaxRates: {},
  });
  const [stockItems, setStockItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);


  const [itemRows, setItemRows] = useState([
    {
      id: Date.now(),
      stockItemName: "",
      description: "",
      quantity: "",
      unit: "Nos",
      rate: "",
      discountPercentage: "",
      additionalDiscountPercentage: "",
    },
  ]);

  const normalizeStockItemName = (name = "") => {
    return name
      .trim()
      .replace(/\s+\]/g, "]")
      .replace(/\[\s+/g, "[")
      .replace(/\s+/g, " ");
  };


  const [ledgerRows, setLedgerRows] = useState([]);


  const [taxLedgerRows, setTaxLedgerRows] = useState([]);


  const [config, setConfig] = useState({
    commonLedger: true,
    voucherDate: true,
    refDate: true,
    refNo: true,
    voucherNo: true,
    voucherType: true,
    partyAccount: true,
    costCenter: false,
    nameOfItem: false,
    itemNarration: true,
    salesLedger: true,
    totalAmount: true,
    narration: true,
  });

  const units = ["Nos", "Pcs", "Kgs", "Ltr", "Mtr", "Box", "EA"];

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!selectedCompany) return;

      if (prefetchedData?.ledgers && prefetchedData?.stockItems) {
        setLedgers(prefetchedData.ledgers);
        setStockItems(prefetchedData.stockItems);

        setSuccessMessage("Data loaded successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
        return;
      }
      setIsLoadingTallyData(true);

      try {
        const firebaseResult = await loadPrefetchedDataFromFirebase(
          selectedCompany.id
        );

        if (firebaseResult.success && firebaseResult.data) {

          setLedgers(firebaseResult.data.ledgers);
          setStockItems(firebaseResult.data.stockItems);

          dispatch(
            setPrefetchedTallyData({
              companyId: selectedCompany.id,
              ledgers: firebaseResult.data.ledgers,
              stockItems: firebaseResult.data.stockItems,
            })
          );

          setSuccessMessage("Data loaded from database!");
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError(
            "Please sync the company from the dashboard first to load ledgers and stock items."
          );
        }
      } catch (error) {
        setError("Failed to load company data: " + error.message);
      } finally {
        setIsLoadingTallyData(false);
      }
    };

    loadCompanyData();
  }, [selectedCompany, prefetchedData, dispatch]);

  useEffect(() => {
    if (selectedCompany) {
      fetchInvoicesFromFirebase();
    }
  }, [selectedCompany]);

  useEffect(() => {
    if (voucherType === "Sales") {
      setVoucherNo(`SALES-${Date.now().toString().slice(-6)}`);
    } else {
      setVoucherNo(`PURCH-${Date.now().toString().slice(-6)}`);
    }
  }, [voucherType]);

  const fetchInvoicesFromFirebase = async () => {
    try {
      const salesResult = await fetchSalesInvoicesFromFirebase(
        selectedCompany.id
      );
      const purchaseResult = await fetchPurchaseInvoicesFromFirebase(
        selectedCompany.id
      );

      if (salesResult.success && salesResult.data.length > 0) {
        salesResult.data.forEach((file) => {
          dispatch(
            addSalesFile({
              companyId: selectedCompany.id,
              file: file,
            })
          );

          file.invoices?.forEach((invoice) => {
            dispatch(
              addSalesInvoice({
                companyId: selectedCompany.id,
                fileId: file.id,
                invoice: invoice,
              })
            );
          });
        });
      }

      if (purchaseResult.success && purchaseResult.data.length > 0) {
        purchaseResult.data.forEach((file) => {
          dispatch(
            addPurchaseFile({
              companyId: selectedCompany.id,
              file: file,
            })
          );

          file.invoices?.forEach((invoice) => {
            dispatch(
              addPurchaseInvoice({
                companyId: selectedCompany.id,
                fileId: file.id,
                invoice: invoice,
              })
            );
          });
        });
      }
    } catch (error) {
      console.error("Error fetching from Firebase:", error);
    }
  };

  
  const totals = useMemo(() => {
    return calculateInvoiceTotals(itemRows, ledgerRows, taxLedgerRows);
  }, [itemRows, ledgerRows, taxLedgerRows]);

  const addItemRow = () => {
    setItemRows([
      ...itemRows,
      {
        id: Date.now(),
        stockItemName: "",
        description: "",
        quantity: "",
        unit: "Nos",
        rate: "",
        discountPercentage: "",
        additionalDiscountPercentage: "",
      },
    ]);
  };

  const removeItemRow = (id) => {
    if (itemRows.length > 1) {
      setItemRows(itemRows.filter((row) => row.id !== id));
    }
  };

  const updateItemRow = (id, field, value) => {
    setItemRows(
      itemRows.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  const addLedgerRow = () => {
    setLedgerRows([
      ...ledgerRows,
      { id: Date.now(), ledgerName: "", amount: "" },
    ]);
  };

  const removeLedgerRow = (id) => {
    setLedgerRows(ledgerRows.filter((row) => row.id !== id));
  };

  const updateLedgerRow = (id, field, value) => {
    setLedgerRows(
      ledgerRows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  const addTaxLedgerRow = () => {
    setTaxLedgerRows([
      ...taxLedgerRows,
      {
        id: Date.now(),
        ledgerName: "",
        percentage: "",
      },
    ]);
  };

  const removeTaxLedgerRow = (id) => {
    setTaxLedgerRows(taxLedgerRows.filter((row) => row.id !== id));
  };

  const updateTaxLedgerRow = (id, field, value) => {
    setTaxLedgerRows(
      taxLedgerRows.map((row) => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

      
          if (field === "ledgerName" && value) {
            const taxRate = ledgers.ledgerTaxRates[value];
            if (taxRate) {
              updatedRow.percentage = taxRate.toString();

              const subTotal = totals.itemTotal + totals.ledgerTotal;
              updatedRow.amount = ((subTotal * taxRate) / 100).toFixed(2);
            }
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

  useEffect(() => {
    const subTotal = totals.itemTotal + totals.ledgerTotal;
    setTaxLedgerRows((prevRows) =>
      prevRows.map((row) => {
        const percentage = parseFloat(row.percentage) || 0;
        const amount = (subTotal * percentage) / 100;
        return { ...row, amount: amount.toFixed(2) };
      })
    );
  }, [itemRows, ledgerRows, totals.itemTotal, totals.ledgerTotal]);

  const handleFileUpload = async (type) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type.includes("pdf")
      ? ".pdf"
      : type.includes("excel")
      ? ".xlsx,.xls"
      : "image/*";

    input.onchange = async (e) => {
      const file = e.target.files[0];

      if (file) {
        let excelData = null;
        if (
          file.type.includes("sheet") ||
          file.name.endsWith(".xlsx") ||
          file.name.endsWith(".xls")
        ) {
          const data = await file.arrayBuffer();
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(data);
          const worksheet = workbook.getWorksheet(1); 

          excelData = [];
          worksheet.eachRow((row) => {
            excelData.push(row.values.slice(1)); 
          });
        }

        setPreviewFile({
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          excelData: excelData,
        });

        if (file.type === "application/pdf") {
          setIsExtracting(true);
          setExtractionError(null);

          try {
        
            const formData = new FormData();
            formData.append("file", file);

       
            const response = await fetch(
              `${import.meta.env.VITE_BACKEND_BASE_URL}/llm-call/extract-invoice`,
              {
                method: "POST",
                body: formData,
              }
            );

            const result = await response.json();
            console.log("response from ai ", result);

            if (!result.success) {
              throw new Error(
                result.message || "Failed to extract invoice data"
              );
            }

            const extractedData = result.data;

        
            if (extractedData.voucherNo) {
              setVoucherNo(extractedData.voucherNo);
            }
            if (extractedData.voucherDate) {
              setVoucherDate(extractedData.voucherDate);
            }
            if (extractedData.partyName) {
              setSelectedParty(extractedData.partyName);
            }
            if (extractedData.gstNumber) {
              setPartyGst(extractedData.gstNumber);
            }

           
            if (extractedData.items && extractedData.items.length > 0) {
              const mappedItems = extractedData.items.map((item, index) => ({
                id: Date.now() + index,
              
                stockItemName:
                  item.itemName ||
                  item.stockItemName ||
                  item.name ||
                  item.item ||
                  "",
                description: item.hsnCode
                  ? `HSN: ${item.hsnCode}`
                  : item.description || "",
                quantity: (item.quantity || item.qty)?.toString() || "",
                unit: item.unit || item.uom || "Nos",
                rate:
                  (item.ratePerUnit || item.rate || item.price)?.toString() ||
                  "",
                discountPercentage:
                  item.discount && item.quantity && item.ratePerUnit
                    ? (
                        (item.discount / (item.quantity * item.ratePerUnit)) *
                        100
                      ).toFixed(2)
                    : item.discountPercentage?.toString() || "",
                additionalDiscountPercentage:
                  item.additionalDiscountPercentage?.toString() || "",
              }));
              setItemRows(mappedItems);
            }

            if (extractedData.items && extractedData.items.length > 0) {
              const firstItem = extractedData.items[0];

              const taxRows = [];

              if (firstItem.cgstPercent) {
                taxRows.push({
                  id: Date.now(),
                  ledgerName: "CGST",
                  percentage: firstItem.cgstPercent.toString(),
                  amount: extractedData.totalCGST?.toFixed(2) || "0",
                });
              }

              if (firstItem.sgstPercent) {
                taxRows.push({
                  id: Date.now() + 1,
                  ledgerName: "SGST",
                  percentage: firstItem.sgstPercent.toString(),
                  amount: extractedData.totalSGST?.toFixed(2) || "0",
                });
              }

              if (taxRows.length > 0) {
                setTaxLedgerRows(taxRows);
              }
            }

            setSuccessMessage("Invoice data extracted successfully!");
            setTimeout(() => setSuccessMessage(null), 3000);
          } catch (err) {
            console.error("Extraction error:", err);
            setExtractionError(
              "Failed to extract invoice data. Please fill manually."
            );
            setTimeout(() => setExtractionError(null), 5000);
          } finally {
            setIsExtracting(false);
          }
        }

        const fileEntry = {
          id: `file_${Date.now()}`,
          name: file.name,
          type: file.type,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString(),
        };

        if (type.includes("sales")) {
          dispatch(
            addSalesFile({
              companyId: selectedCompany?.id,
              file: fileEntry,
            })
          );
        } else if (type.includes("purchase")) {
          dispatch(
            addPurchaseFile({
              companyId: selectedCompany?.id,
              file: fileEntry,
            })
          );
        }
      }
    };
    input.click();
  };

  const handleSaveInvoice = async () => {
    if (!selectedCompany) {
      setError("Please select a company first");
      return;
    }

    if (!selectedParty || !selectedLedger) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const invoiceData = {
        voucherType: voucherType,
        voucherDate: voucherDate, 
        voucherNo: voucherNo,
        partyName: selectedParty,
        mainLedger: selectedLedger,
        narration: narration,
        items: itemRows
          .filter((row) => row.stockItemName && row.quantity && row.rate)
          .map((item) => ({
            ...item,
            stockItemName: normalizeStockItemName(item.stockItemName),
          })),
        ledgers: ledgerRows.filter((row) => row.ledgerName && row.amount),
        taxes: taxLedgerRows.filter((row) => row.ledgerName && row.amount),
      };

      const validation = validateInvoiceData(invoiceData, stockItems);

      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        setIsLoading(false);
        return;
      }

      const invoice = {
        id: `inv_${Date.now()}`,
        ...invoiceData,
        status: "pending",
        createdAt: new Date().toISOString(),
        totals: totals,
      };

      if (voucherType === "Sales") {
        const fileId = selectedSalesFile?.id || `file_${Date.now()}`;

        if (!selectedSalesFile) {
      
          dispatch(
            addSalesFile({
              companyId: selectedCompany.id,
              file: {
                id: fileId,
                name: `Sales_${new Date().toISOString().split("T")[0]}`,
                status: "pending",
              },
            })
          );
        }

        dispatch(
          addSalesInvoice({
            companyId: selectedCompany.id,
            fileId: fileId,
            invoice: invoice,
          })
        );
      } else {
        const fileId = selectedPurchaseFile?.id || `file_${Date.now()}`;

        if (!selectedPurchaseFile) {
         
          dispatch(
            addPurchaseFile({
              companyId: selectedCompany.id,
              file: {
                id: fileId,
                name: `Purchase_${new Date().toISOString().split("T")[0]}`,
                status: "pending",
              },
            })
          );
        }

        dispatch(
          addPurchaseInvoice({
            companyId: selectedCompany.id,
            fileId: fileId,
            invoice: invoice,
          })
        );
      }

      setSuccessMessage("Invoice saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);


      resetForm();
    } catch (err) {
      setError(`Failed to save invoice: ${err.message}`);
      console.error("Save invoice error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncToTally = async () => {
    if (!selectedCompany) {
      setError("Please select a company first");
      return;
    }

    if (!selectedParty || !selectedLedger) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const invoiceData = {
        voucherType: voucherType,
        voucherDate: voucherDate,
        voucherNo: voucherNo,
        partyName: selectedParty,
        mainLedger: selectedLedger,
        narration: narration,
        items: itemRows
          .filter((row) => row.stockItemName && row.quantity && row.rate)
          .map((item) => ({
            ...item,
            stockItemName: normalizeStockItemName(item.stockItemName),
          })),
        ledgers: ledgerRows.filter((row) => row.ledgerName && row.amount),
        taxes: taxLedgerRows.filter((row) => row.ledgerName && row.amount),
      };

      const validation = validateInvoiceData(invoiceData, stockItems);

      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        setIsLoading(false);
        return;
      }

    
      const voucherXML =
        voucherType === "Sales"
          ? generateSalesVoucherXML(invoiceData)
          : generatePurchaseVoucherXML(invoiceData);

      const response = await sendTallyRequest(voucherXML);
      const responseJson = xmlToJson(response);


      if (isTallyResponseSuccess(responseJson)) {
        const invoice = {
          id: `inv_${Date.now()}`,
          ...invoiceData,
          status: "Approved",
          syncedToTally: true,
          syncedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          totals: totals,
        };

        const fileId =
          voucherType === "Sales"
            ? selectedSalesFile?.id || `file_${Date.now()}`
            : selectedPurchaseFile?.id || `file_${Date.now()}`;

        if (voucherType === "Sales") {
          if (!selectedSalesFile) {
            dispatch(
              addSalesFile({
                companyId: selectedCompany.id,
                file: {
                  id: fileId,
                  name: `Sales_${new Date().toISOString().split("T")[0]}`,
                  status: "completed",
                },
              })
            );
          }

          dispatch(
            addSalesInvoice({
              companyId: selectedCompany.id,
              fileId: fileId,
              invoice: invoice,
            })
          );

          const firebaseResult = await saveSalesInvoiceToFirebase(
            selectedCompany.id,
            fileId,
            invoice,
            currentUserId 
          );

          if (!firebaseResult.success) {
            console.error("Firebase save failed:", firebaseResult.error);
          }
        } else {
          if (!selectedPurchaseFile) {
            dispatch(
              addPurchaseFile({
                companyId: selectedCompany.id,
                file: {
                  id: fileId,
                  name: `Purchase_${new Date().toISOString().split("T")[0]}`,
                  status: "completed",
                },
              })
            );
          }

          dispatch(
            addPurchaseInvoice({
              companyId: selectedCompany.id,
              fileId: fileId,
              invoice: invoice,
            })
          );

          
          const firebaseResult = await savePurchaseInvoiceToFirebase(
            selectedCompany.id,
            fileId,
            invoice,
            currentUserId
          );

          if (!firebaseResult.success) {
            console.error("Firebase save failed:", firebaseResult.error);
          }
        }

        setSuccessMessage("Invoice synced to Tally and saved successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
        resetForm();
      } else {
        const errorMsg = getTallyError(responseJson);
        setError(`Tally Error: ${errorMsg}`);
      }
    } catch (err) {
      setError(`Failed to sync to Tally: ${err.message}`);
      console.error("Tally sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setVoucherNo(
      voucherType === "Sales"
        ? `SALES-${Date.now().toString().slice(-6)}`
        : `PURCH-${Date.now().toString().slice(-6)}`
    );
    setVoucherDate(new Date().toISOString().split("T")[0]);
    setSelectedParty("");
    setPartyGst("");
    setSelectedLedger("");
    setNarration("");
    setItemRows([
      {
        id: Date.now(),
        stockItemName: "",
        description: "",
        quantity: "",
        unit: "Nos",
        rate: "",
        discountPercentage: "",
        additionalDiscountPercentage: "",
      },
    ]);
    setLedgerRows([]);
    setTaxLedgerRows([]);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const container = document.getElementById("resizable-container");
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const newLeftWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    if (newLeftWidth >= 20 && newLeftWidth <= 80) {
      setLeftWidth(newLeftWidth);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2">
      <LoadingOverlay isLoading={isLoadingTallyData} />
      {/* <ReduxDebugger selectedCompany={selectedCompany} /> */}
      <div className="max-w-[1920px] mx-auto">
     
        <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Sales & Purchase Invoice
              </h1>
              <p className="text-sm text-purple-300/70 mt-1">
                {selectedCompany
                  ? `Company: ${selectedCompany.name}`
                  : "No company selected"}
              </p>
            </div>
          </div>
        </div>

      
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-300">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-300">
            <CheckCircle size={18} />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}
      
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-300">
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </div>
        )}
        {successMessage && (
          <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2 text-green-300">
            <CheckCircle size={18} />
            <span className="text-sm">{successMessage}</span>
          </div>
        )}
        
        {isExtracting && (
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-2 text-blue-300">
            <Loader size={18} className="animate-spin" />
            <span className="text-sm">Extracting invoice data with AI...</span>
          </div>
        )}
        {extractionError && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-center gap-2 text-yellow-300">
            <AlertCircle size={18} />
            <span className="text-sm">{extractionError}</span>
          </div>
        )}
      </div>

      <div
        id="resizable-container"
        className="relative flex gap-1 h-[calc(100vh-125px)]"
      >
       
        <div
          style={{ width: `${leftWidth}%` }}
          className="flex-shrink-0 transition-none"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden h-full flex flex-col">
            <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-purple-200">
                File Preview
              </h2>

              <div className="relative group">
                <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center gap-2 hover:from-purple-600 hover:to-pink-600 transition-all">
                  <Upload size={18} />
                  Upload Bill
                  <ChevronDown size={16} />
                </button>

                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800/95 backdrop-blur-sm border border-purple-500/30 rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                  <div className="py-1">
                    <button
                      onClick={() => handleFileUpload("sales-pdf")}
                      className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                    >
                      Sales PDF
                    </button>
                    <button
                      onClick={() => handleFileUpload("sales-image")}
                      className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                    >
                      Sales Image
                    </button>
                    <button
                      onClick={() => handleFileUpload("sales-excel")}
                      className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                    >
                      Sales Excel
                    </button>
                    <div className="border-t border-purple-500/20 my-1"></div>
                    <button
                      onClick={() => handleFileUpload("purchase-pdf")}
                      className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                    >
                      Purchase PDF
                    </button>
                    <button
                      onClick={() => handleFileUpload("purchase-image")}
                      className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                    >
                      Purchase Image
                    </button>
                    <button
                      onClick={() => handleFileUpload("purchase-excel")}
                      className="w-full px-4 py-2 text-left text-purple-200 hover:bg-purple-500/20 transition-colors"
                    >
                      Purchase Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 overflow-auto">
              {previewFile ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  {previewFile.type.startsWith("image/") && (
                    <img
                      src={previewFile.url}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  )}
                  {previewFile.type === "application/pdf" && (
                    <iframe
                      src={previewFile.url}
                      className="w-full h-full rounded-lg border border-purple-500/30"
                    />
                  )}

                  {previewFile.type.includes("sheet") &&
                    previewFile.excelData && (
                      <table className="min-w-full text-purple-200 border border-purple-500/40 rounded-lg overflow-hidden text-sm">
                        <tbody>
                          {previewFile.excelData.map((row, i) => (
                            <tr
                              key={i}
                              className="border-b border-purple-500/20"
                            >
                              {row.map((cell, j) => (
                                <td key={j} className="px-3 py-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Upload
                      size={64}
                      className="mx-auto text-purple-400/50 mb-4"
                    />
                    <p className="text-purple-300/70">
                      Upload a bill to preview
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

   
        <div
          onMouseDown={handleMouseDown}
          className={`w-1 bg-purple-500/20 hover:bg-purple-500/40 cursor-col-resize transition-colors relative group ${
            isDragging ? "bg-purple-500/60" : ""
          }`}
        >
          <div className="absolute inset-y-0 -left-1 -right-1 flex items-center justify-center">
            <div className="w-1 h-16 bg-purple-500/40 rounded-full group-hover:h-24 group-hover:bg-purple-500/60 transition-all">
              <div className="flex items-center justify-center h-full">
                <div className="w-0.5 h-8 bg-white/40 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        <div
          style={{ width: `${100 - leftWidth}%` }}
          className="flex-shrink-0 transition-none h-[calc(100vh-125px)]"
        >
          <div className="bg-slate-900/50 backdrop-blur-sm border border-purple-500/20 rounded-2xl overflow-hidden h-full flex flex-col">
      
            <div className="p-4 border-b border-purple-500/20">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-purple-200">
                    {activeInvoiceType === "item"
                      ? "Item Invoice"
                      : "Accounting Invoice"}
                  </h2>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={activeInvoiceType === "accounting"}
                          onChange={() => setActiveInvoiceType("accounting")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 transition-all"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="text-sm text-purple-300">
                        Accounting Invoice
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={activeInvoiceType === "item"}
                          onChange={() => setActiveInvoiceType("item")}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 transition-all"></div>
                        <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                      </div>
                      <span className="text-sm text-purple-300">
                        Item Invoice
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => setShowConfig(true)}
                  className="px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 flex items-center gap-2 transition-all"
                >
                  <Settings size={18} />
                  Configuration
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
             
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-purple-300 text-sm mb-2">
                    Voucher Type <span className="text-pink-400">*</span>
                  </label>
                  <select
                    value={voucherType}
                    onChange={(e) => setVoucherType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-purple-100 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="Sales">Sales</option>
                    <option value="Purchase">Purchase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 text-sm mb-2">
                    Voucher No. <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-purple-100 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-purple-300 text-sm mb-2">
                    Voucher Date <span className="text-pink-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={voucherDate}
                    onChange={(e) => {
                      setVoucherDate(e.target.value);
                    }}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-purple-100 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-purple-300 text-sm mb-2">
                    Party Name <span className="text-pink-400">*</span>
                  </label>
                  <select
                    value={selectedParty}
                    onChange={(e) => setSelectedParty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-purple-100 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">-- Select Party --</option>
                    {ledgers.partyLedgers.map((party) => (
                      <option key={party} value={party}>
                        {party}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-purple-300 text-sm mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={partyGst}
                    onChange={(e) => setPartyGst(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-purple-100 focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-purple-300 text-sm mb-2">
                    {voucherType} Ledger{" "}
                    <span className="text-pink-400">*</span>
                  </label>
                  <select
                    value={selectedLedger}
                    onChange={(e) => setSelectedLedger(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-purple-100 focus:border-purple-500 focus:outline-none"
                  >
                    <option value="">-- Select Ledger --</option>
                    {(voucherType === "Sales"
                      ? ledgers.salesLedgers
                      : ledgers.purchaseLedgers
                    ).map((ledger) => (
                      <option key={ledger} value={ledger}>
                        {ledger}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-purple-500/20 my-6"></div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-lg tracking-wide">
                    Item Details
                  </h3>
                  <span className="text-xs text-purple-300/70 uppercase tracking-widest font-medium">
                    Inventory Config
                  </span>
                </div>

                <div className="bg-slate-800/60 backdrop-blur-md border border-purple-500/30 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-900/60 border-b border-purple-500/20">
                          <th className="text-left text-purple-200 font-medium py-4 px-4 text-xs uppercase tracking-wider">
                            Sr.
                          </th>
                          <th className="text-left text-purple-200 font-medium py-4 px-4 text-xs uppercase tracking-wider w-1/4">
                            Item Name / Desc
                          </th>
                          <th className="text-left text-purple-200 font-medium py-4 px-2 text-xs uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="text-left text-purple-200 font-medium py-4 px-2 text-xs uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="text-left text-purple-200 font-medium py-4 px-2 text-xs uppercase tracking-wider">
                            Rate
                          </th>
                          <th className="text-left text-purple-200 font-medium py-4 px-2 text-xs uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="text-left text-purple-200 font-medium py-4 px-2 text-xs uppercase tracking-wider">
                            Disc %
                          </th>
                          <th className="text-left text-purple-200 font-medium py-4 px-2 text-xs uppercase tracking-wider text-nowrap">
                            Add Disc
                          </th>
                          <th className="text-left text-purple-200 font-medium py-4 px-2 text-xs uppercase tracking-wider text-nowrap">
                            Taxable
                          </th>
                          <th className="text-center text-purple-200 font-medium py-4 px-4 text-xs uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-purple-500/20">
                        {itemRows.map((row, index) => {
                          const qty = parseFloat(row.quantity) || 0;
                          const rate = parseFloat(row.rate) || 0;
                          const disc = parseFloat(row.discountPercentage) || 0;
                          const addDisc =
                            parseFloat(row.additionalDiscountPercentage) || 0;

                          let amount = qty * rate;
                          const discAmount = (amount * disc) / 100;
                          amount = amount - discAmount;
                          const addDiscAmount = (amount * addDisc) / 100;
                          const taxableAmt = amount - addDiscAmount;

                          return (
                            <tr
                              key={row.id}
                              className="group hover:bg-purple-500/10 transition-colors duration-300"
                            >
                              <td className="py-3 px-4 text-purple-200/70 font-mono">
                                {index + 1}
                              </td>
                              <td className="py-3 px-4">
                                <div className="space-y-2">
                                
                                  {stockItems.length > 0 &&
                                  !row.stockItemName ? (
                                   
                                    <select
                                      value={row.stockItemName}
                                      onChange={(e) =>
                                        updateItemRow(
                                          row.id,
                                          "stockItemName",
                                          e.target.value
                                        )
                                      }
                                      className="w-full px-3 py-2 bg-slate-700/60 border border-purple-500/20 hover:border-purple-500/40 focus:bg-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg text-white text-sm placeholder-purple-300/30 transition-all duration-300 outline-none"
                                    >
                                      <option value="">Select Item</option>
                                      {stockItems.map((item, index) => (
                                        <option key={index} value={item}>
                                          {item}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                   
                                    <div className="relative">
                                      <input
                                        type="text"
                                        value={row.stockItemName}
                                        onChange={(e) =>
                                          updateItemRow(
                                            row.id,
                                            "stockItemName",
                                            e.target.value
                                          )
                                        }
                                        list={`stock-items-${row.id}`}
                                        className="w-full px-3 py-2 bg-slate-700/60 border border-purple-500/20 hover:border-purple-500/40 focus:bg-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg text-white text-sm placeholder-purple-300/30 transition-all duration-300 outline-none"
                                        placeholder="Enter or select item name"
                                      />
                                      <datalist id={`stock-items-${row.id}`}>
                                        {stockItems.map((item, index) => (
                                          <option key={index} value={item} />
                                        ))}
                                      </datalist>
                                    </div>
                                  )}
                                  <input
                                    type="text"
                                    value={row.description}
                                    onChange={(e) =>
                                      updateItemRow(
                                        row.id,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="w-full px-3 py-1.5 bg-transparent border-b border-purple-500/20 focus:border-purple-500/50 text-purple-200/70 text-xs transition-colors duration-300 outline-none"
                                    placeholder="Add description..."
                                  />
                                </div>
                              </td>
                              <td className="py-3 px-2 align-top pt-4">
                                <input
                                  type="number"
                                  value={row.quantity}
                                  onChange={(e) =>
                                    updateItemRow(
                                      row.id,
                                      "quantity",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-2 bg-slate-700/60 border border-purple-500/20 hover:bg-slate-700 focus:border-purple-500 rounded-lg text-center text-white text-sm font-medium transition-all duration-300 outline-none"
                                />
                              </td>
                              <td className="py-4 px-2 align-top pt-4">
                                <select
                                  value={row.unit}
                                  onChange={(e) =>
                                    updateItemRow(
                                      row.id,
                                      "unit",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-2 bg-slate-700/60 border border-purple-500/20 hover:bg-slate-700 focus:border-purple-500 rounded-lg text-white text-xs transition-all duration-300 outline-none appearance-none cursor-pointer text-center"
                                >
                                  {units.map((unit) => (
                                    <option
                                      key={unit}
                                      value={unit}
                                      className="bg-slate-800"
                                    >
                                      {unit}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-3 px-2 align-top pt-4">
                                <input
                                  type="number"
                                  value={row.rate}
                                  onChange={(e) =>
                                    updateItemRow(
                                      row.id,
                                      "rate",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-2 bg-slate-700/60 border border-purple-500/20 hover:bg-slate-700 focus:border-purple-500 rounded-lg  text-white text-center text-sm transition-all duration-300 outline-none"
                                />
                              </td>
                              <td className="py-3 px-2 align-top pt-5 text-right text-purple-100 text-sm font-mono">
                                {(qty * rate).toFixed(2)}
                              </td>
                              <td className="py-3 px-2 align-top pt-4">
                                <input
                                  type="number"
                                  value={row.discountPercentage}
                                  onChange={(e) =>
                                    updateItemRow(
                                      row.id,
                                      "discountPercentage",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-2 bg-slate-700/60 border border-purple-500/20 hover:bg-slate-700 focus:border-purple-500 rounded-lg text-center text-white text-sm transition-all duration-300 outline-none"
                                />
                              </td>
                              <td className="py-3 px-2 align-top pt-4">
                                <input
                                  type="number"
                                  value={row.additionalDiscountPercentage}
                                  onChange={(e) =>
                                    updateItemRow(
                                      row.id,
                                      "additionalDiscountPercentage",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-2 py-2 bg-slate-700/60 border border-purple-500/20 hover:bg-slate-700 focus:border-purple-500 rounded-lg text-center text-white text-sm transition-all duration-300 outline-none"
                                />
                              </td>
                              <td className="py-3 px-2 align-top pt-5 text-right text-white font-bold text-sm font-mono">
                                {taxableAmt.toFixed(2)}
                              </td>
                              <td className="py-3 px-4 align-top pt-4 text-center">
                                <button
                                  onClick={() => removeItemRow(row.id)}
                                  className="group/btn relative p-2 rounded-lg hover:bg-red-500/20 transition-all duration-300"
                                >
                                  <Trash2
                                    size={16}
                                    className="text-red-400 group-hover/btn:text-red-300 transition-colors"
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-slate-900/40 p-3 border-t border-purple-500/20">
                    <button
                      onClick={addItemRow}
                      className="w-full py-3 rounded-xl border border-dashed border-purple-400/40 text-purple-300 hover:text-purple-200 hover:border-purple-400/60 hover:bg-purple-500/10 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300 group"
                    >
                      <div className="p-1 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                        <Plus size={14} />
                      </div>
                      Add New Item Line
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              
                <div className="flex flex-col h-full">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 font-semibold text-lg tracking-wide mb-4">
                    Ledger Details
                  </h3>
                  <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-lg flex-1 flex flex-col">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                          <th className="text-left text-purple-300/70 font-medium py-3 px-4 text-xs uppercase tracking-wider">
                            Ledger Name
                          </th>
                          <th className="text-left text-purple-300/70 font-medium py-3 px-4 text-xs uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ledgerRows.map((row) => (
                          <tr
                            key={row.id}
                            className="group hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <select
                                value={row.ledgerName}
                                onChange={(e) =>
                                  updateLedgerRow(
                                    row.id,
                                    "ledgerName",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-slate-800/30 border border-transparent hover:border-purple-500/20 focus:bg-slate-800/80 focus:border-purple-500/50 rounded-lg text-purple-100 text-sm transition-all duration-300 outline-none appearance-none cursor-pointer"
                              >
                                <option value="" className="bg-slate-900">
                                  Select Ledger
                                </option>
                                {ledgers.allLedgers.map((ledger) => (
                                  <option
                                    key={ledger}
                                    value={ledger}
                                    className="bg-slate-900"
                                  >
                                    {ledger}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400/40 text-xs">
                                  ₹
                                </span>
                                <input
                                  type="number"
                                  value={row.amount}
                                  onChange={(e) =>
                                    updateLedgerRow(
                                      row.id,
                                      "amount",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-6 pr-3 py-2 bg-slate-800/30 border border-transparent hover:border-purple-500/20 focus:bg-slate-800/80 focus:border-purple-500/50 rounded-lg text-purple-100 text-sm transition-all duration-300 outline-none"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button
                                onClick={() => removeLedgerRow(row.id)}
                                className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-auto p-3 border-t border-white/5">
                      <button
                        onClick={addLedgerRow}
                        className="w-full py-2 rounded-lg bg-purple-500/5 text-purple-300/80 hover:bg-purple-500/10 hover:text-purple-200 text-sm transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Add Ledger
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col h-full">
                  <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 font-semibold text-lg tracking-wide mb-4">
                    Tax Configuration
                  </h3>
                  <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-lg flex-1 flex flex-col">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                          <th className="text-left text-purple-300/70 font-medium py-3 px-4 text-xs uppercase tracking-wider">
                            Ledger
                          </th>
                          <th className="text-left text-purple-300/70 font-medium py-3 px-4 text-xs uppercase tracking-wider">
                            % Rate
                          </th>
                          <th className="text-left text-purple-300/70 font-medium py-3 px-4 text-xs uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {taxLedgerRows.map((row) => (
                          <tr
                            key={row.id}
                            className="group hover:bg-white/[0.02] transition-colors"
                          >
                            <td className="py-3 px-4">
                              <select
                                value={row.ledgerName}
                                onChange={(e) =>
                                  updateTaxLedgerRow(
                                    row.id,
                                    "ledgerName",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 bg-slate-800/30 border border-transparent hover:border-purple-500/20 focus:bg-slate-800/80 focus:border-purple-500/50 rounded-lg text-purple-100 text-sm transition-all duration-300 outline-none appearance-none cursor-pointer"
                              >
                                <option value="" className="bg-slate-900">
                                  Select
                                </option>
                                {ledgers.taxLedgers.map((ledger) => (
                                  <option
                                    key={ledger}
                                    value={ledger}
                                    className="bg-slate-900"
                                  >
                                    {ledger}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <div className="relative">
                                <input
                                  type="number"
                                  value={row.percentage}
                                  onChange={(e) =>
                                    updateTaxLedgerRow(
                                      row.id,
                                      "percentage",
                                      e.target.value
                                    )
                                  }
                                  className="w-full pl-3 pr-6 py-2 bg-slate-800/30 border border-transparent hover:border-purple-500/20 focus:bg-slate-800/80 focus:border-purple-500/50 rounded-lg text-purple-100 text-sm transition-all duration-300 outline-none"
                                  placeholder={
                                    row.ledgerName &&
                                    ledgers.ledgerTaxRates[row.ledgerName]
                                      ? "Auto-filled"
                                      : "Enter %"
                                  }
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400/40 text-xs">
                                  %
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-purple-100 text-sm font-mono">
                                ₹{parseFloat(row.amount || 0).toFixed(2)}
                              </div>
                            </td>
                            <td className="py-3 px-2 text-center">
                              <button
                                onClick={() => removeTaxLedgerRow(row.id)}
                                className="text-red-400/50 hover:text-red-400 hover:bg-red-500/10 p-1.5 rounded-lg transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-auto p-3 border-t border-white/5">
                      <button
                        onClick={addTaxLedgerRow}
                        className="w-full py-2 rounded-lg bg-purple-500/5 text-purple-300/80 hover:bg-purple-500/10 hover:text-purple-200 text-sm transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <Plus size={14} /> Add Tax Ledger
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-purple-500/20 my-6"></div>

              <div>
                <h3 className="text-purple-200 font-semibold mb-3">
                  Narration
                </h3>
                <textarea
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-purple-500/30 rounded-lg text-purple-100 focus:border-purple-500 focus:outline-none resize-none"
                  placeholder="Enter narration or additional notes..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-purple-500/20 bg-slate-900/30">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-purple-300">Sub Total:</span>
                      <span className="ml-2 text-purple-100 font-semibold">
                        ₹{totals.itemTotal.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-purple-300">Tax Amount:</span>
                      <span className="ml-2 text-purple-100 font-semibold">
                        ₹{totals.taxTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="text-lg">
                    <span className="text-purple-200 font-semibold">
                      Total Amount:
                    </span>
                    <span className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 font-bold text-xl">
                      ₹{totals.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveInvoice}
                    disabled={isLoading || !selectedCompany}
                    className="px-6 py-2 rounded-lg bg-slate-700 text-purple-200 hover:bg-slate-600 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={18} />
                    Save & Close
                  </button>
                  <button
                    onClick={handleSyncToTally}
                    disabled={isLoading || !selectedCompany}
                    className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={18} />
                    {isLoading ? "Syncing..." : "Save & Sync"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showConfig && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-purple-500/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Configuration
              </h2>
              <button
                onClick={() => setShowConfig(false)}
                className="p-2 rounded-lg bg-slate-800 text-purple-300 hover:bg-slate-700 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-auto max-h-[60vh]">
              
              <div className="mb-6 p-4 bg-purple-500/5 rounded-lg border border-purple-500/20">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-purple-200 font-medium">
                    Select common ledger account for item allocation
                  </span>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={config.commonLedger}
                      onChange={() =>
                        setConfig({
                          ...config,
                          commonLedger: !config.commonLedger,
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 rounded-full peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500 transition-all"></div>
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5"></div>
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
           
                <div className="space-y-3">
                  {[
                    { key: "voucherDate", label: "Voucher Date" },
                    { key: "refDate", label: "Reference Date" },
                    { key: "refNo", label: "Reference No" },
                    { key: "voucherNo", label: "Voucher No" },
                    { key: "voucherType", label: "Voucher Type" },
                    { key: "partyAccount", label: "Party A/C Name" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={config[item.key]}
                        onChange={() =>
                          setConfig({
                            ...config,
                            [item.key]: !config[item.key],
                          })
                        }
                        className="w-5 h-5 rounded border-2 border-purple-500/30 bg-slate-900 checked:bg-gradient-to-br checked:from-purple-500 checked:to-pink-500 checked:border-transparent"
                      />
                      <span className="text-purple-200 text-sm">
                        {item.label}
                      </span>
                    </label>
                  ))}

                  <button className="w-full p-3 bg-slate-800/50 rounded-lg text-purple-200 text-sm flex items-center justify-between hover:bg-slate-800/70 transition-all">
                    <span>Dispatch Details</span>
                    <ChevronDown size={16} />
                  </button>
                  <button className="w-full p-3 bg-slate-800/50 rounded-lg text-purple-200 text-sm flex items-center justify-between hover:bg-slate-800/70 transition-all">
                    <span>Order Details</span>
                    <ChevronDown size={16} />
                  </button>
                  <button className="w-full p-3 bg-slate-800/50 rounded-lg text-purple-200 text-sm flex items-center justify-between hover:bg-slate-800/70 transition-all">
                    <span>Export Details</span>
                    <ChevronDown size={16} />
                  </button>
                  <button className="w-full p-3 bg-slate-800/50 rounded-lg text-purple-200 text-sm flex items-center justify-between hover:bg-slate-800/70 transition-all">
                    <span>Party Details</span>
                    <ChevronDown size={16} />
                  </button>
                </div>

             
                <div className="space-y-3">
                  {[
                    { key: "costCenter", label: "Cost Center/Classes" },
                    { key: "nameOfItem", label: "Name Of Item" },
                    { key: "itemNarration", label: "Item Narration" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={config[item.key]}
                        onChange={() =>
                          setConfig({
                            ...config,
                            [item.key]: !config[item.key],
                          })
                        }
                        className="w-5 h-5 rounded border-2 border-purple-500/30 bg-slate-900 checked:bg-gradient-to-br checked:from-purple-500 checked:to-pink-500 checked:border-transparent"
                      />
                      <span className="text-purple-200 text-sm">
                        {item.label}
                      </span>
                    </label>
                  ))}

                  <button className="w-full p-3 bg-slate-800/50 rounded-lg text-purple-200 text-sm flex items-center justify-between hover:bg-slate-800/70 transition-all">
                    <span>Item Allocation</span>
                    <ChevronDown size={16} />
                  </button>
                  <button className="w-full p-3 bg-slate-800/50 rounded-lg text-purple-200 text-sm flex items-center justify-between hover:bg-slate-800/70 transition-all">
                    <span>Name Of The Item</span>
                    <ChevronDown size={16} />
                  </button>

                  {[
                    { key: "salesLedger", label: "Sales Ledger" },
                    { key: "totalAmount", label: "Total Amount" },
                    { key: "narration", label: "Narration" },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer hover:bg-slate-800/70 transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={config[item.key]}
                        onChange={() =>
                          setConfig({
                            ...config,
                            [item.key]: !config[item.key],
                          })
                        }
                        className="w-5 h-5 rounded border-2 border-purple-500/30 bg-slate-900 checked:bg-gradient-to-br checked:from-purple-500 checked:to-pink-500 checked:border-transparent"
                      />
                      <span className="text-purple-200 text-sm">
                        {item.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-purple-500/20 flex justify-end gap-3">
              <button
                onClick={() => setShowConfig(false)}
                className="px-6 py-2 rounded-lg bg-slate-700 text-purple-200 hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      )}
      <datalist id="stock-items">
        {stockItems.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
    </div>
  );
};

export default SalesPurchaseSection;

const ReduxDebugger = ({ selectedCompany }) => {
  const { currentUserId, userDataMap } = useSelector((state) => state.tally);
  const userData = userDataMap?.[currentUserId];
  const prefetchedData = userData?.prefetchedTallyData;

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-auto bg-slate-900 border border-purple-500/30 rounded-lg p-4 text-xs text-white z-50">
      <h3 className="font-bold text-purple-400 mb-2">Redux State Debug</h3>

      <div className="space-y-2">
        <div>
          <span className="text-gray-400">Current User ID:</span>
          <div className="text-green-400 font-mono">
            {currentUserId || "null"}
          </div>
        </div>

        <div>
          <span className="text-gray-400">Selected Company ID:</span>
          <div className="text-green-400 font-mono">
            {selectedCompany?.id || "null"}
          </div>
        </div>

        <div>
          <span className="text-gray-400">Selected Company Name:</span>
          <div className="text-green-400 font-mono">
            {selectedCompany?.name || "null"}
          </div>
        </div>

        <div>
          <span className="text-gray-400">User Data Exists:</span>
          <div className="text-green-400 font-mono">
            {userData ? "✅ Yes" : "❌ No"}
          </div>
        </div>

        <div>
          <span className="text-gray-400">Prefetched Data Object:</span>
          <div className="text-green-400 font-mono">
            {prefetchedData ? "✅ Exists" : "❌ null"}
          </div>
        </div>

        {prefetchedData && (
          <div>
            <span className="text-gray-400">Available Company IDs:</span>
            <div className="text-yellow-400 font-mono text-xs">
              {Object.keys(prefetchedData).join(", ") || "None"}
            </div>
          </div>
        )}

        {selectedCompany?.id && prefetchedData?.[selectedCompany.id] && (
          <div className="border-t border-purple-500/30 mt-2 pt-2">
            <div className="text-green-400 font-bold">✅ Data Found!</div>
            <div className="text-gray-400">Ledgers:</div>
            <div className="text-white pl-2">
              <div>
                All:{" "}
                {prefetchedData[selectedCompany.id].ledgers?.allLedgers
                  ?.length || 0}
              </div>
              <div>
                Sales:{" "}
                {prefetchedData[selectedCompany.id].ledgers?.salesLedgers
                  ?.length || 0}
              </div>
              <div>
                Purchase:{" "}
                {prefetchedData[selectedCompany.id].ledgers?.purchaseLedgers
                  ?.length || 0}
              </div>
              <div>
                Party:{" "}
                {prefetchedData[selectedCompany.id].ledgers?.partyLedgers
                  ?.length || 0}
              </div>
              <div>
                Tax:{" "}
                {prefetchedData[selectedCompany.id].ledgers?.taxLedgers
                  ?.length || 0}
              </div>
            </div>
            <div className="text-gray-400 mt-1">Stock Items:</div>
            <div className="text-white pl-2">
              {prefetchedData[selectedCompany.id].stockItems?.length || 0} items
            </div>
          </div>
        )}

        {selectedCompany?.id && !prefetchedData?.[selectedCompany.id] && (
          <div className="border-t border-red-500/30 mt-2 pt-2">
            <div className="text-red-400 font-bold">
              ❌ No Data for this Company
            </div>
            <div className="text-yellow-400 text-xs mt-1">
              Please sync this company from the dashboard
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function LoadingOverlay({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl p-8 flex flex-col items-center gap-4">
        <Loader className="animate-spin text-purple-400" size={48} />
        <p className="text-purple-200 text-lg font-semibold">
          Loading Tally data...
        </p>
        <p className="text-purple-300/70 text-sm">
          This may take a moment for large datasets
        </p>
      </div>
    </div>
  );
}
