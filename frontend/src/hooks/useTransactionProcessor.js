import { useState, useCallback } from "react";
import {
  sendTallyRequest,
  escapeXml,
  xmlToJson,
  getTallyError,
} from "../utils/tallyUtils";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  setRejectedTransactions,
  setTransactions,
  addToSavedTransactions,
  bulkAddToSavedTransactions,
  addToHistory,
  bulkAddToHistory,
} from "../redux/features/tallySlice";

export const useTransactionProcessor = (
  transactionsState,
  selectedAccount,
  postingMode,
  selectedBulkLedger
) => {
  const [status, setStatus] = useState({ loading: false });
  const dispatch = useDispatch();
  const { selectedCompany, selectedFileId } = useSelector(
    (state) => state.tally
  );

  const convertToTallyDate = useCallback((dateInput) => {
    if (!dateInput) return null;

    if (typeof dateInput === "string" && /^\d{8}$/.test(dateInput)) {
      return dateInput;
    }

    if (dateInput instanceof Date && !isNaN(dateInput)) {
      const year = dateInput.getFullYear();
      const month = String(dateInput.getMonth() + 1).padStart(2, "0");
      const day = String(dateInput.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    }

    if (typeof dateInput === "string") {
      const parts = dateInput.split(/[/-]/);
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        if (!day || !month || !year) return null;
        return `${year}${String(month).padStart(2, "0")}${String(day).padStart(
          2,
          "0"
        )}`;
      }
    }
    const d = new Date(dateInput);
    if (!isNaN(d)) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    }

    return null;
  }, []);

  const normalizeTransactions = useCallback((transactions) => {
    return transactions
      .map((tx) => {
        let parsedDate = null;
        if (tx.Date) {
          const parts = tx.Date.split(/[-/]/);
          if (parts.length === 3) {
            const [day, month, year] = parts.map(Number);
            parsedDate = new Date(year, month - 1, day);
          } else {
            parsedDate = new Date(tx.Date);
          }
        }

        const normalized = {
          ...tx,
          date:
            parsedDate instanceof Date && !isNaN(parsedDate)
              ? parsedDate
              : null,
          particulars: tx.Narration || tx.Particulars || "",
          category: tx.Category || tx.category || "",
        };

        if (tx.Withdrawals !== undefined || tx.Deposits !== undefined) {
          const withdrawal = parseFloat(tx.Withdrawals) || 0;
          const deposit = parseFloat(tx.Deposits) || 0;
          if (withdrawal > 0) {
            normalized.amount = withdrawal;
            normalized.type = "Payment";
          } else {
            normalized.amount = deposit;
            normalized.type = "Receipt";
          }
        } else if (
          tx.Amount !== undefined &&
          tx["Debit/Credit"] !== undefined
        ) {
          normalized.amount = parseFloat(tx.Amount) || 0;
          const typeStr = String(tx["Debit/Credit"]).toUpperCase();
          normalized.type =
            typeStr === "DEBIT" || typeStr === "DR" ? "Payment" : "Receipt";
        }

        return normalized;
      })
      .filter((tx) => tx && tx.amount > 0);
  }, []);

  const transformToTallyFormat = useCallback(
    (tx, bankLedger, partyLedger) => {
      const tallyDate = convertToTallyDate(tx.date);

      if (!tallyDate) {
        throw new Error("Invalid date format");
      }

      return {
        id: tx.id,
        date: tallyDate,
        amount: parseFloat(tx.amount) || 0,
        type: tx.type,
        partyLedger: partyLedger || "N/A",
        bankLedger: bankLedger,
        narration: tx.narration || tx.particulars || "N/A",
      };
    },
    [convertToTallyDate]
  );

  const validateTransaction = useCallback((tx, bankLedger, partyLedger) => {
    const errors = [];

    if (!tx.date) {
      errors.push("Missing or invalid date");
    }

    if (!tx.amount || isNaN(tx.amount) || tx.amount <= 0) {
      errors.push("Invalid amount");
    }

    if (!tx.type || (tx.type !== "Payment" && tx.type !== "Receipt")) {
      errors.push("Invalid transaction type");
    }

    if (!partyLedger || partyLedger === "N/A") {
      errors.push("No party ledger assigned");
    }

    if (!bankLedger) {
      errors.push("No bank ledger assigned");
    }

    if (bankLedger === partyLedger) {
      errors.push("Bank and party ledger cannot be the same");
    }

    if (!tx.narration && !tx.particulars) {
      errors.push("Missing narration");
    }

    return errors.length > 0 ? errors.join(", ") : null;
  }, []);

  const createLedgerIfNotExists = useCallback(async (ledgerName) => {
    try {
      const ledgerXml = `
        <ENVELOPE>
          <HEADER>
            <TALLYREQUEST>Import Data</TALLYREQUEST>
          </HEADER>
          <BODY>
            <IMPORTDATA>
              <REQUESTDESC>
                <REPORTNAME>All Masters</REPORTNAME>
              </REQUESTDESC>
              <REQUESTDATA>
                <TALLYMESSAGE xmlns:UDF="TallyUDF">
                  <LEDGER NAME="${escapeXml(ledgerName)}" ACTION="Create">
                    <NAME.LIST>
                      <NAME>${escapeXml(ledgerName)}</NAME>
                    </NAME.LIST>
                    <PARENT>Suspense A/c</PARENT>
                    <OPENINGBALANCE>0</OPENINGBALANCE>
                  </LEDGER>
                </TALLYMESSAGE>
              </REQUESTDATA>
            </IMPORTDATA>
          </BODY>
        </ENVELOPE>`;

      await sendTallyRequest(ledgerXml);
     
      return true;
    } catch (error) {
     
      return false;
    }
  }, []);

  const postApprovedTransactions = useCallback(async () => {
    if (!transactionsState?.length) {
      return toast.error("No transactions to post");
    }

    setStatus({ loading: true });

    const resolvedTx = transactionsState.filter(
      (tx) => tx.status === "Resolved"
    );

    if (resolvedTx.length === 0) {
      setStatus({ loading: false });
      return toast.error("No resolved transactions found");
    }

    const successfullyPostedTxs = [];
    const newlyRejectedTxs = [];


    for (const tx of resolvedTx) {
      try {
        let partyLedger;
        if (postingMode === "bulk") {
          partyLedger = selectedBulkLedger;
        } else {
          partyLedger = tx.selectedLedger;
        }

        const bankLedger = selectedAccount;

        const validationError = validateTransaction(
          tx,
          bankLedger,
          partyLedger
        );
        if (validationError) {
          const rejectedTx = {
            ...tx,
            reason: `Validation failed: ${validationError}`,
            postedSuccessfully: false,
            companyId: selectedCompany?.id,
            fileId: selectedFileId,
          };
          newlyRejectedTxs.push(rejectedTx);
          
          
          dispatch(addToHistory(rejectedTx));
          
          console.log(`❌ Transaction ${tx.id} rejected: ${validationError}`);
          continue;
        }

        const tallyTx = transformToTallyFormat(tx, bankLedger, partyLedger);

        console.log(`📋 Processing transaction ${tallyTx.id}:`, tallyTx);

        await createLedgerIfNotExists(tallyTx.partyLedger);

        const isPayment = tallyTx.type === "Payment";

        const voucherXml = `
          <ENVELOPE>
            <HEADER>
              <TALLYREQUEST>Import Data</TALLYREQUEST>
            </HEADER>
            <BODY>
              <IMPORTDATA>
                <REQUESTDESC>
                  <REPORTNAME>Vouchers</REPORTNAME>
                </REQUESTDESC>
                <REQUESTDATA>
                  <TALLYMESSAGE xmlns:UDF="TallyUDF">
                    <VOUCHER VCHTYPE="${
                      tallyTx.type
                    }" ACTION="Create" OBJVIEW="Accounting Voucher View">
                      <DATE>${tallyTx.date}</DATE>
                      <NARRATION>${escapeXml(tallyTx.narration)}</NARRATION>
                      <VOUCHERTYPENAME>${tallyTx.type}</VOUCHERTYPENAME>
                      
                      <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(
                          tallyTx.partyLedger
                        )}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>${
                          isPayment ? "Yes" : "No"
                        }</ISDEEMEDPOSITIVE>
                        <AMOUNT>${isPayment ? "-" : ""}${tallyTx.amount}</AMOUNT>
                      </ALLLEDGERENTRIES.LIST>

                      <ALLLEDGERENTRIES.LIST>
                        <LEDGERNAME>${escapeXml(tallyTx.bankLedger)}</LEDGERNAME>
                        <ISDEEMEDPOSITIVE>${
                          isPayment ? "No" : "Yes"
                        }</ISDEEMEDPOSITIVE>
                        <AMOUNT>${isPayment ? "" : "-"}${tallyTx.amount}</AMOUNT>
                      </ALLLEDGERENTRIES.LIST>
                    </VOUCHER>
                  </TALLYMESSAGE>
                </REQUESTDATA>
              </IMPORTDATA>
            </BODY>
          </ENVELOPE>`;

       

        const responseXml = await sendTallyRequest(voucherXml);
        const responseJson = xmlToJson(responseXml);

      

        const createdCount = parseInt(
          responseJson?.RESPONSE?.CREATED?._text || 0
        );

        if (createdCount > 0) {
          const successTx = {
            ...tx,
            postedSuccessfully: true,
            companyId: selectedCompany?.id,
            fileId: selectedFileId,
            partyLedger: tallyTx.partyLedger,
            bankLedger: tallyTx.bankLedger,
          };
          
          successfullyPostedTxs.push(successTx);
        
          dispatch(addToSavedTransactions(successTx));
          
         
          dispatch(addToHistory(successTx));
          
         
        } else {
          const errorMsg = getTallyError(responseJson);
          const failedTx = {
            ...tx,
            reason: `Tally error: ${errorMsg}`,
            postedSuccessfully: false,
            companyId: selectedCompany?.id,
            fileId: selectedFileId,
          };
          
          newlyRejectedTxs.push(failedTx);
         
          dispatch(addToHistory(failedTx));
          
        
        }
      } catch (error) {
       
        const errorTx = {
          ...tx,
          reason: `Processing error: ${error.message}`,
          postedSuccessfully: false,
          companyId: selectedCompany?.id,
          fileId: selectedFileId,
        };
        
        newlyRejectedTxs.push(errorTx);
     
        dispatch(addToHistory(errorTx));
      }
    }

    
    const updatedMainList = transactionsState.filter(
      (tx) => !successfullyPostedTxs.some((sTx) => sTx.id === tx.id)
    );

    dispatch(
      setTransactions({
        companyId: selectedCompany?.id,
        fileId: selectedFileId,
        transactions: updatedMainList,
      })
    );
    
    dispatch(
      setRejectedTransactions({
        companyId: selectedCompany?.id,
        fileId: selectedFileId,
        rejectedTransactions: newlyRejectedTxs,
      })
    );

    setStatus({ loading: false });

  

    if (successfullyPostedTxs.length > 0) {
      toast.success(
        `Successfully posted ${successfullyPostedTxs.length} transaction(s)`,
        {
          duration: 4000,
          style: {
            background: "linear-gradient(to right, #10b981, #059669)",
            color: "#fff",
          },
        }
      );
    }

    if (newlyRejectedTxs.length > 0) {
      toast.error(
        `Failed to post ${newlyRejectedTxs.length} transaction(s). Check history.`,
        {
          duration: 5000,
          style: {
            background: "linear-gradient(to right, #ef4444, #dc2626)",
            color: "#fff",
          },
        }
      );
    }

    return {
      successfulPosts: successfullyPostedTxs.length,
      failedPosts: newlyRejectedTxs.length,
    };
  }, [
    transactionsState,
    dispatch,
    selectedAccount,
    postingMode,
    selectedBulkLedger,
    selectedCompany,
    selectedFileId,
    validateTransaction,
    transformToTallyFormat,
    createLedgerIfNotExists,
  ]);

  return {
    normalizeTransactions,
    postApprovedTransactions,
    transformToTallyFormat,
    convertToTallyDate,
    validateTransaction,
    status,
  };
};