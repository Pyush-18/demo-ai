import { useState } from "react";
import {
  sendTallyRequest,
  xmlToJson,
  tallyDateToJSDate,
  escapeXml,
  getTallyError,
  parseLedgers,
} from "../utils/tallyUtils";
import toast from "react-hot-toast";
import { setLedgers } from "../redux/features/tallySlice";
import { useDispatch } from "react-redux";

export function useTally() {
  const [company, setCompany] = useState(null);
  const [companyPeriod, setCompanyPeriod] = useState({
    start: null,
    end: null,
  });
  const dispatch = useDispatch();

  const fetchDataFromTally = async () => {
    try {
      const requestXml = `<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
        <BODY><EXPORTDATA><REQUESTDESC><REPORTNAME>List of Accounts</REPORTNAME>
        <STATICVARIABLES><FETCH>*</FETCH></STATICVARIABLES></REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>`;

      const xmlResponse = await sendTallyRequest(requestXml);
      const jsonResponse = xmlToJson(xmlResponse);
      const companyName = parseCompany(jsonResponse);
      parseLedgers(jsonResponse);
      const period = await fetchCompanyPeriod();
      return {
        rawJson: JSON.stringify(jsonResponse, null, 2),
        jsonResponse: jsonResponse,
        companyName,
        companyPeriod: period,
      };
    } catch (err) {
      toast.error("Failed to fetch data from Tally:", err);
    }
  };

  const parseCompany = (jsonResponse) => {
    const companyName =
      jsonResponse?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDESC?.STATICVARIABLES
        ?.SVCURRENTCOMPANY?._text;
    setCompany(companyName || null);
    return companyName;
  };


  const fetchCompanyPeriod = async () => {
    const periodXml = `<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
      <BODY><EXPORTDATA><REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME>
      <STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES></REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>`;
    try {
      const periodResponse = await sendTallyRequest(periodXml);
      const periodJson = xmlToJson(periodResponse);
      const companyData = periodJson?.ENVELOPE?.COMPANY;
      setCompanyPeriod({
        start: tallyDateToJSDate(companyData?.BOOKSFROM?._text),
        end: tallyDateToJSDate(companyData?.ENDAT?._text),
      });
      return companyPeriod;
    } catch (err) {
      toast.error("Failed to fetch company period:", err);
    }
  };

  const createVoucherXML = (tx, bankLedger, targetLedger) => {
    const date = new Date(tx.date);
    const tallyDate = `${date.getFullYear()}${String(
      date.getMonth() + 1
    ).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
    const voucherType = tx.type === "Payment" ? "Payment" : "Receipt";
    const debitLedger = tx.type === "Payment" ? targetLedger : bankLedger;
    const creditLedger = tx.type === "Payment" ? bankLedger : targetLedger;

    return `<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC><REQUESTDATA><TALLYMESSAGE xmlns:UDF="TALLYMESSAGE"><VOUCHER VCHTYPE="${voucherType}" ACTION="Create"><DATE>${tallyDate}</DATE><NARRATION>${escapeXml(
      tx.particulars
    )}</NARRATION><VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME><ALLLEDGERENTRIES.LIST><LEDGERNAME>${escapeXml(
      debitLedger
    )}</LEDGERNAME><ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE><AMOUNT>${-tx.amount}</AMOUNT></ALLLEDGERENTRIES.LIST><ALLLEDGERENTRIES.LIST><LEDGERNAME>${escapeXml(
      creditLedger
    )}</LEDGERNAME><ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE><AMOUNT>${
      tx.amount
    }</AMOUNT></ALLLEDGERENTRIES.LIST></VOUCHER></TALLYMESSAGE></REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`;
  };

  
  const createNewLedger = async ({
    ledgerName,
    parentGroup,
    state,
    gstRegType,
    partyGstin,
  }) => {
    if (!ledgerName || !parentGroup)
      throw new Error("Ledger name and parent group required.");

    let gstFields = "";
    if (state) gstFields += `<STATENAME>${escapeXml(state)}</STATENAME>`;
    if (gstRegType && gstRegType !== "Not Applicable")
      gstFields += `<GSTREGISTRATIONTYPE>${escapeXml(
        gstRegType
      )}</GSTREGISTRATIONTYPE>`;
    if (partyGstin)
      gstFields += `<PARTYGSTIN>${escapeXml(partyGstin)}</PARTYGSTIN>`;

    const ledgerXml = `<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER><BODY><IMPORTDATA><REQUESTDESC><REPORTNAME>All Masters</REPORTNAME></REQUESTDESC><REQUESTDATA><TALLYMESSAGE xmlns:UDF="TallyUDF"><LEDGER NAME="${escapeXml(
      ledgerName
    )}" ACTION="Create"><NAME.LIST><NAME>${escapeXml(
      ledgerName
    )}</NAME></NAME.LIST><PARENT>${escapeXml(
      parentGroup
    )}</PARENT><ISBILLWISEON>Yes</ISBILLWISEON>${gstFields}</LEDGER></TALLYMESSAGE></REQUESTDATA></IMPORTDATA></BODY></ENVELOPE>`;

    const responseXml = await sendTallyRequest(ledgerXml);
    const responseJson = xmlToJson(responseXml);

    if (parseInt(responseJson?.RESPONSE?.CREATED?._text || 0) > 0) {
      dispatch(setLedgers((prev) => [...prev, ledgerName].sort()));
      return true;
    } else {
      throw new Error(getTallyError(responseJson));
    }
  };

  return {
    company,
    companyPeriod,
    fetchDataFromTally,
    parseCompany,
    parseLedgers,
    fetchCompanyPeriod,
    createVoucherXML,
    createNewLedger,
  };
}
