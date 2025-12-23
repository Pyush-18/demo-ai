import { useDispatch, useSelector } from "react-redux";
import { setBankLedgers, setLedgers } from "../redux/features/tallySlice";
import { useCallback, useMemo, useState } from "react";
import {
  sendTallyRequest,
  xmlToJson,
  getTallyError,
} from "../utils/tallyUtils";
import { BookOpen, Landmark } from "lucide-react";
import toast from "react-hot-toast";

export function useTallyData(companyId, selectedFileId = null) {
  const dispatch = useDispatch();
  const { files } = useSelector((state) => state.tally);

  const currentCompany = files?.find((c) => c.id === companyId);
  const currentFile = currentCompany?.bankingFiles?.find((f) => f.id === selectedFileId);

  const ledgers = currentCompany?.ledgers || [];
  const bankLedgers = currentCompany?.bankLedgers || [];

  const [tallyLoading, setTallyLoading] = useState(false);

  const bankGroups = useMemo(
    () => [
      "bank accounts",
      "bank account",
      "cash-in-hand",
      "bank od a/c",
      "bank cc a/c",
      "current assets",
    ],
    []
  );

  const parseLedgers = useCallback(
    (jsonResponse) => {
      const masterList =
        jsonResponse?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE;

      const ledgerMessages = masterList
        ? Array.isArray(masterList)
          ? masterList
          : [masterList]
        : [];

      const allLedgersArr = [];
      const bankLedgerSet = new Set();

      ledgerMessages.forEach((item) => {
        const ledger = item.LEDGER || item;
        const name = ledger?._attributes?.NAME;
        const parent = ledger?.PARENT?._text?.toLowerCase();

        if (name) {
          allLedgersArr.push(name);
          if (parent && bankGroups.includes(parent)) {
            bankLedgerSet.add(name);
          }
        }
      });

      if (companyId) {
        dispatch(
          setLedgers({
            companyId,
            ledgers: allLedgersArr.sort(),
          })
        );

        dispatch(
          setBankLedgers({
            companyId,
            bankLedgers: Array.from(bankLedgerSet).sort(),
          })
        );
      }
    },
    [bankGroups, dispatch, companyId]
  );

  const fetchAllAccounts = useCallback(async (showToast = true) => {
    if (ledgers.length > 0 && bankLedgers.length > 0) {
    
      return;
    }

    setTallyLoading(true);
    try {
      const requestXml = `
        <ENVELOPE>
          <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
          <BODY>
            <EXPORTDATA>
              <REQUESTDESC>
                <REPORTNAME>List of Accounts</REPORTNAME>
                <STATICVARIABLES>
                  <FETCH>NAME,PARENT</FETCH>
                </STATICVARIABLES>
              </REQUESTDESC>
            </EXPORTDATA>
          </BODY>
        </ENVELOPE>`;

      const xmlResponse = await sendTallyRequest(requestXml);
      const jsonResponse = xmlToJson(xmlResponse);

      parseLedgers(jsonResponse);
      
      if (showToast) {
        toast.success("Tally ledgers fetched successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(
        `Failed to fetch Tally data: ${err.message || getTallyError(err)}`
      );
    } finally {
      setTallyLoading(false);
    }
  }, [parseLedgers, ledgers.length, bankLedgers.length]);

  const bankLedgerOptions = useMemo(
    () =>
      bankLedgers.map((ledger) => ({
        value: ledger,
        label: ledger,
        icon: Landmark,
      })),
    [bankLedgers]
  );

  const generalLedgerOptions = useMemo(
    () =>
      ledgers
        .filter((ledger) => !bankLedgers.includes(ledger))
        .map((ledger) => ({
          value: ledger,
          label: ledger,
          icon: BookOpen,
        })),
    [ledgers, bankLedgers]
  );

  return {
    ledgers,
    bankLedgers,
    tallyLoading,
    fetchAllAccounts,
    bankLedgerOptions,
    generalLedgerOptions,
    hasLedgers: ledgers.length > 0,
  };
}