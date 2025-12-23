import { xml2json, json2xml } from "xml-js";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

export async function sendTallyRequest(xmlRequest) {
  try {
    const PROXY_URL = "http://localhost:5000/tally";
    const response = await fetch(PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/xml" },
      body: xmlRequest,
    });

    if (!response.ok) throw new Error(`Proxy error: ${response.statusText}`);
    return await response.text();
  } catch (error) {
    console.error("sendTallyRequest failed:", error.message);
    throw error;
  }
}




export function jsonToXml(jsonObject) {
  try {
    return json2xml(JSON.stringify(jsonObject), {
      compact: true,
      ignoreComment: true,
      spaces: 4,
    });
  } catch (error) {
    console.error("Error converting JSON to XML:", error);
    throw error;
  }
}

export function escapeXml(unsafe) {
  if (typeof unsafe !== "string") return unsafe;
  return unsafe.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      }[c])
  );
}

export function tallyDateToJSDate(tallyDate) {
  if (!tallyDate || tallyDate.length !== 8) return null;
  const year = parseInt(tallyDate.substring(0, 4), 10);
  const month = parseInt(tallyDate.substring(4, 6), 10) - 1;
  const day = parseInt(tallyDate.substring(6, 8), 10);
  return new Date(year, month, day);
}

export function parseCompanyName(jsonResponse) {
  return (
    jsonResponse?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDESC?.STATICVARIABLES
      ?.SVCURRENTCOMPANY?._text || null
  );
}

export async function fetchCompanyPeriod() {
  const requestXml = `<ENVELOPE><HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
        <BODY><EXPORTDATA><REQUESTDESC><REPORTNAME>List of Companies</REPORTNAME>
        <STATICVARIABLES><SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT></STATICVARIABLES>
        </REQUESTDESC></EXPORTDATA></BODY></ENVELOPE>`;

  const xmlResponse = await sendTallyRequest(requestXml);
  const jsonResponse = xmlToJson(xmlResponse);
  const companyData = jsonResponse?.ENVELOPE?.COMPANY;

  return {
    startDate: tallyDateToJSDate(companyData?.BOOKSFROM?._text),
    endDate: tallyDateToJSDate(companyData?.ENDAT?._text),
  };
}

export function jsonToXmlExport(jsonObject) {
  const convert = (obj, nodeName) => {
    if (typeof obj !== "object" || obj === null) {
      return `<${nodeName}>${obj}</${nodeName}>`;
    }
    let xml = nodeName ? `<${nodeName}>` : "";
    for (const key in obj) {
      if (!obj.hasOwnProperty(key)) continue;
      const value = obj[key];
      const tagName = key.replace(/^_/, "");
      if (Array.isArray(value))
        value.forEach((v) => (xml += convert(v, tagName)));
      else if (typeof value === "object") xml += convert(value, tagName);
      else xml += `<${tagName}>${escapeXml(value)}</${tagName}>`;
    }
    xml += nodeName ? `</${nodeName}>` : "";
    return xml;
  };
  return convert(jsonObject, "ENVELOPE");
}


export function exportToJson(jsonData, fileName = "data.json") {
  console.log("exportToJson called with fileName:", fileName);

  const blob = new Blob(
    [
      typeof jsonData === "string"
        ? jsonData
        : JSON.stringify(jsonData, null, 2),
    ],
    { type: "application/json" }
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;

  // Append to body, click, then cleanup
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Delay URL revocation
  setTimeout(() => {
    URL.revokeObjectURL(url);
    console.log("JSON blob URL revoked");
  }, 1000);
}

export function exportToXml(jsonData, fileName = "data.xml") {
  console.log("exportToXml called with fileName:", fileName);

  try {
    const jsonObj =
      typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    const xmlString = jsonToXmlExport(jsonObj);
    const blob = new Blob([xmlString], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(url);
      console.log("XML blob URL revoked");
    }, 1000);
  } catch (e) {
    toast.error("Invalid JSON data for XML export.");
    console.error(e);
    throw e;
  }
}

export async function exportToExcel(jsonData, fileName = "data.xlsx") {
  console.log("exportToExcel called with fileName:", fileName);

  try {
    const jsonObj =
      typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
    const items =
      jsonObj?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE || jsonObj;

    const dataArray = Array.isArray(items) ? items : [items];

    console.log("Creating workbook with", dataArray.length, "rows");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Tally Data");

    if (dataArray.length > 0) {
      const headers = Object.keys(dataArray[0]);
      worksheet.addRow(headers);

      dataArray.forEach((item) => {
        worksheet.addRow(Object.values(item));
      });
    }

    console.log("Generating Excel buffer...");
    const buffer = await workbook.xlsx.writeBuffer();
    console.log("Buffer generated, size:", buffer.byteLength, "bytes");

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    console.log("Blob created, creating download URL...");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none"; 

    console.log("Appending link and triggering download...");
    document.body.appendChild(a);


    void a.offsetHeight;

    a.click();

    console.log("Download triggered, cleaning up...");


    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("Excel cleanup complete - element removed and URL revoked");
    }, 2000);
  } catch (e) {
    console.error("Excel export error:", e);
    console.error("Error stack:", e.stack);
    toast("Could not process JSON for Excel export.");
    throw e;
  }
}

export function exportToPdf(jsonData, fileName = "data.pdf") {
  console.log("exportToPdf called with fileName:", fileName);

  try {
    const doc = new jsPDF();
    const text =
      typeof jsonData === "string"
        ? jsonData
        : JSON.stringify(jsonData, null, 2);
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 10, 10);
    doc.save(fileName);

    console.log("PDF saved successfully");
  } catch (e) {
    toast("Could not export data to PDF.");
    console.error(e);
    throw e;
  }
}

export function getTallyDate(dateInput) {
  if (!dateInput) return null;

  if (dateInput instanceof Date && !isNaN(dateInput)) {
    const year = dateInput.getFullYear();
    const month = String(dateInput.getMonth() + 1).padStart(2, "0");
    const day = String(dateInput.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  const parts = String(dateInput).split(/[/-]/);
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if (!day || !month || !year) return null;
    return `${year}${String(month).padStart(2, "0")}${String(day).padStart(
      2,
      "0"
    )}`;
  }

  const d = new Date(dateInput);
  if (isNaN(d)) return null;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}



function extractMasterList(jsonResponse) {
  const directPath =
    jsonResponse?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE;

  if (directPath) {
    return Array.isArray(directPath) ? directPath : [directPath];
  }
  return findLedgerArrayRecursively(jsonResponse) || [];
}

function unwrapLedgers(masterList) {
  return masterList
    .map((item) => item.LEDGER || item)
    .filter((item) => item && item.PARENT);
}

function categorizeLedgers(ledgers) {
  const allLedgers = [];
  const bankLedgers = new Set();

  const BANK_CASH_GROUPS = ["bank accounts", "bank od a/c", "cash-in-hand"];

  ledgers.forEach((ledger) => {
    const ledgerName = ledger?._attributes?.NAME;
    const parentGroup = ledger?.PARENT?._text;

    if (!ledgerName) return;

    allLedgers.push(ledgerName);

    if (parentGroup && BANK_CASH_GROUPS.includes(parentGroup.toLowerCase())) {
      bankLedgers.add(ledgerName);
    }
  });

  bankLedgers.add("Cash");

  return { allLedgers, bankLedgers };
}

function findLedgerArrayRecursively(obj) {
  if (!obj || typeof obj !== "object") return null;

  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    if (Array.isArray(obj[key])) {
      const firstItem = obj[key][0];
      if (isLedgerItem(firstItem)) {
        return obj[key];
      }
    }

    const found = findLedgerArrayRecursively(obj[key]);
    if (found) return found;
  }

  return null;
}
function isLedgerItem(item) {
  if (!item) return false;

  return !!(
    item._attributes?.NAME ||
    (item.LEDGER && item.LEDGER._attributes?.NAME)
  );
}


export const formatTallyDate = (date) => {
  if (!date) {

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  }

  if (typeof date === "string" && /^\d{8}$/.test(date)) {
    return date;
  }

  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date.replace(/-/g, "");
  }


  if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [month, day, year] = date.split("/");
    return `${year}${month}${day}`;
  }

  if (typeof date === "string" && /^\d{2}-\d{2}-\d{4}$/.test(date)) {
    const [day, month, year] = date.split("-");
    return `${year}${month}${day}`;
  }

  try {
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}${month}${day}`;
    }
  } catch (e) {
    console.error("Error parsing date:", e);
  }

  console.warn("Unable to parse date, using today:", date);
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};


export const xmlToJson = (xmlString) => {
  try {
    const cleanXml = xmlString.replace(/[\x00-\x1F\x7F-\x9F]/g, "");
    if (typeof xml2json === "undefined") {
      throw new Error("xml2json library not loaded");
    }
    return JSON.parse(xml2json(cleanXml, { compact: true, spaces: 4 }));
  } catch (e) {
    console.error("XML to JSON parsing error:", e);
    throw e;
  }
};


export const getTallyError = (responseJson) => {
  if (!responseJson) return "Unknown error.";

  const errorSources = [
    responseJson.RESPONSE?.LINEERROR?._text,
    responseJson.ENVELOPE?.BODY?.DATA?.LINEERROR?._text,
    responseJson.ENVELOPE?.DESC?._text,
    responseJson.ENVELOPE?.BODY?.DESC?._text,
  ];

  if (responseJson.RESPONSE?.EXCEPTIONS?._text === "1") {
    return "Tally Exception: One or more names (Ledger, Stock Item, Unit, or Voucher Type) do not exist in Tally. Please check all entries.";
  }

  return (
    errorSources.find((msg) => msg) || "Tally reported an unspecified error."
  );
};


export const generateFetchLedgersXML = (companyName = null) => {
  const companyTag = companyName
    ? `<SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>`
    : "";

  return `
    <ENVELOPE>
      <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>List of Accounts</REPORTNAME>
            <STATICVARIABLES>
              ${companyTag}
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              <ACCOUNTTYPE>Ledgers</ACCOUNTTYPE>
            </STATICVARIABLES>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>`;
};

export const generateFetchStockItemsXML = (companyName = null) => {
  const companyTag = companyName
    ? `<SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>`
    : "";

  return `
    <ENVELOPE>
      <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>List of Accounts</REPORTNAME>
            <STATICVARIABLES>
              ${companyTag}
              <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>
              <ACCOUNTTYPE>StockItems</ACCOUNTTYPE>
            </STATICVARIABLES>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>`;
};


export const generateFetchCompaniesXML = () => {
  return `
    <ENVELOPE>
      <HEADER><TALLYREQUEST>Export Data</TALLYREQUEST></HEADER>
      <BODY>
        <EXPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>List of Companies</REPORTNAME>
          </REQUESTDESC>
        </EXPORTDATA>
      </BODY>
    </ENVELOPE>`;
};


export const parseLedgers = (jsonResponse) => {
  let masters =
    jsonResponse?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE;
  if (!masters)
    return {
      allLedgers: [],
      salesLedgers: [],
      purchaseLedgers: [],
      partyLedgers: [],
      taxLedgers: [],
      ledgerTaxRates: {},
    };

  if (!Array.isArray(masters)) masters = [masters];

  const result = {
    allLedgers: [],
    salesLedgers: [],
    purchaseLedgers: [],
    partyLedgers: [],
    taxLedgers: [],
    ledgerTaxRates: {},
  };

  masters.forEach((item) => {
    const ledger = item.LEDGER;
    if (!ledger) return;

    let name = ledger._attributes?.NAME;
    if (!name && ledger.NAME) {
      name = typeof ledger.NAME === "object" ? ledger.NAME._text : ledger.NAME;
    }
    if (!name) return;

    let parent = ledger._attributes?.PARENT;
    if (!parent && ledger.PARENT) {
      parent =
        typeof ledger.PARENT === "object" ? ledger.PARENT._text : ledger.PARENT;
    }
    parent = parent ? parent.toString().toLowerCase() : "";

    result.allLedgers.push(name);

    if (
      parent.includes("sundry debtors") ||
      parent.includes("sundry creditors")
    ) {
      result.partyLedgers.push(name);
    }
    if (parent.includes("sales accounts")) {
      result.salesLedgers.push(name);
    }
    if (parent.includes("purchase accounts")) {
      result.purchaseLedgers.push(name);
    }
    if (parent.includes("duties & taxes")) {
      result.taxLedgers.push(name);
      let rate = 0;
      if (ledger.RATEOFTAXCALCULATION) {
        rate = parseFloat(
          ledger.RATEOFTAXCALCULATION._text || ledger.RATEOFTAXCALCULATION
        );
      }
      if (rate > 0) result.ledgerTaxRates[name] = rate;
    }
  });

  // Sort all arrays
  result.allLedgers.sort();
  result.partyLedgers.sort();
  result.salesLedgers.sort();
  result.purchaseLedgers.sort();
  result.taxLedgers.sort();

  return result;
};


export const parseStockItems = (jsonResponse) => {
  let masters =
    jsonResponse?.ENVELOPE?.BODY?.IMPORTDATA?.REQUESTDATA?.TALLYMESSAGE;
  if (!masters) return [];

  if (!Array.isArray(masters)) masters = [masters];

  const stockItems = [];
  masters.forEach((item) => {
    const masterItem = item.STOCKITEM || item.LEDGER;
    if (masterItem) {
      let name = masterItem._attributes?.NAME;
      if (!name && masterItem.NAME) {
        name =
          typeof masterItem.NAME === "object"
            ? masterItem.NAME._text
            : masterItem.NAME;
      }
      if (name) stockItems.push(name);
    }
  });

  return stockItems.sort();
};


export const parseCompanies = (jsonResponse) => {
  let companies = jsonResponse?.ENVELOPE?.BODY?.DATA?.COLLECTION?.COMPANY;
  if (!companies) return [];

  if (!Array.isArray(companies)) companies = [companies];

  return companies.map((company) => ({
    name: company._attributes?.NAME || company.NAME?._text || "Unknown",
    id:
      company._attributes?.NAME ||
      company.NAME?._text ||
      `company_${Date.now()}`,
  }));
};


export const generateInventoryEntries = (items, mainLedger) => {
  if (!items || items.length === 0) return "";

  return items
    .map((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const discPerc = parseFloat(item.discountPercentage) || 0;
      const addDiscPerc = parseFloat(item.additionalDiscountPercentage) || 0;

  
      const grossAmount = qty * rate;
      const discAmt1 = (grossAmount * discPerc) / 100;
      const remainder = grossAmount - discAmt1;
      const discAmt2 = (remainder * addDiscPerc) / 100;
      const netAmount = grossAmount - discAmt1 - discAmt2;

      const absAmount = Math.abs(netAmount);
      let isDeemedPositive = "No";
      let xmlAmount = absAmount;

      if (netAmount < 0) {
        isDeemedPositive = "Yes";
        xmlAmount = -absAmount;
      }

      const unit = escapeXml(item.unit || "Nos");
      const stockItemName = escapeXml(item.stockItemName);
      const description = escapeXml(item.description || "");

 
      const rateValue = rate.toFixed(2);

      let discountTag = "";
      if (discPerc > 0) {
        discountTag = `<DISCOUNT>${discPerc.toFixed(2)}</DISCOUNT>`;
      }

      return `
      <ALLINVENTORYENTRIES.LIST>
        <STOCKITEMNAME>${stockItemName}</STOCKITEMNAME>
        <ISDEEMEDPOSITIVE>${isDeemedPositive}</ISDEEMEDPOSITIVE>
        <NARRATION>${description}</NARRATION>
        <RATE>${rateValue}</RATE>
        <ACTUALQTY>${qty} ${unit}</ACTUALQTY>
        <BILLEDQTY>${qty} ${unit}</BILLEDQTY>
        ${discountTag}
        <AMOUNT>${xmlAmount.toFixed(2)}</AMOUNT>
        <BATCHALLOCATIONS.LIST>
          <GODOWNNAME>Main Location</GODOWNNAME>
          <BATCHNAME>Primary Batch</BATCHNAME>
          <ACTUALQTY>${qty} ${unit}</ACTUALQTY>
          <BILLEDQTY>${qty} ${unit}</BILLEDQTY>
          <AMOUNT>${xmlAmount.toFixed(2)}</AMOUNT>
        </BATCHALLOCATIONS.LIST>
        <ACCOUNTINGALLOCATIONS.LIST>
          <LEDGERNAME>${escapeXml(mainLedger)}</LEDGERNAME>
          <ISDEEMEDPOSITIVE>${isDeemedPositive}</ISDEEMEDPOSITIVE>
          <AMOUNT>${xmlAmount.toFixed(2)}</AMOUNT>
        </ACCOUNTINGALLOCATIONS.LIST>
      </ALLINVENTORYENTRIES.LIST>`;
    })
    .join("");
};

export const generateLedgerEntries = (ledgers) => {
  if (!ledgers || ledgers.length === 0) return "";

  return ledgers
    .map((ledger) => {
      const amount = parseFloat(ledger.amount) || 0;
      if (amount === 0) return "";

      const isLedgerPos = amount >= 0 ? "No" : "Yes";
      const ledgerXmlAmt = amount >= 0 ? Math.abs(amount) : -Math.abs(amount);
      const ledgerName = escapeXml(ledger.ledgerName);

      return `
      <LEDGERENTRIES.LIST>
        <LEDGERNAME>${ledgerName}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>${isLedgerPos}</ISDEEMEDPOSITIVE>
        <AMOUNT>${ledgerXmlAmt.toFixed(2)}</AMOUNT>
      </LEDGERENTRIES.LIST>`;
    })
    .filter(Boolean)
    .join("");
};


export const generateTaxLedgerEntries = (taxes) => {
  if (!taxes || taxes.length === 0) return "";

  return taxes
    .map((tax) => {
      const amount = parseFloat(tax.amount) || 0;
      if (amount === 0) return "";

      const isTaxPos = amount >= 0 ? "No" : "Yes";
      const taxXmlAmt = amount >= 0 ? Math.abs(amount) : -Math.abs(amount);
      const ledgerName = escapeXml(tax.ledgerName);

      return `
      <LEDGERENTRIES.LIST>
        <LEDGERNAME>${ledgerName}</LEDGERNAME>
        <ISDEEMEDPOSITIVE>${isTaxPos}</ISDEEMEDPOSITIVE>
        <AMOUNT>${taxXmlAmt.toFixed(2)}</AMOUNT>
      </LEDGERENTRIES.LIST>`;
    })
    .filter(Boolean)
    .join("");
};


export const generatePartyLedgerEntry = (
  partyName,
  totalAmount,
  voucherNo,
  voucherDate
) => {
  const partyAmount = -totalAmount;
  const isPartyPos = partyAmount < 0 ? "Yes" : "No";
  const escapedPartyName = escapeXml(partyName);
  const escapedVoucherNo = escapeXml(voucherNo);

  // ✅ FIXED: Accept already formatted date
  const formattedDate =
    voucherDate && voucherDate.length === 8
      ? voucherDate
      : formatTallyDate(voucherDate);

  return `
    <LEDGERENTRIES.LIST>
      <LEDGERNAME>${escapedPartyName}</LEDGERNAME>
      <ISDEEMEDPOSITIVE>${isPartyPos}</ISDEEMEDPOSITIVE>
      <ISPARTYLEDGER>Yes</ISPARTYLEDGER>
      <EFFECTIVEDATE>${formattedDate}</EFFECTIVEDATE>
      <AMOUNT>${partyAmount.toFixed(2)}</AMOUNT>
      <MAILINGNAME.LIST>
        <MAILINGNAME>${escapedPartyName}</MAILINGNAME>
      </MAILINGNAME.LIST>
      <BILLALLOCATIONS.LIST>
        <NAME>${escapedVoucherNo}</NAME>
        <BILLTYPE>New Ref</BILLTYPE>
        <ISDEEMEDPOSITIVE>${isPartyPos}</ISDEEMEDPOSITIVE>
        <AMOUNT>${partyAmount.toFixed(2)}</AMOUNT>
      </BILLALLOCATIONS.LIST>
    </LEDGERENTRIES.LIST>`;
};


export const calculateInvoiceTotals = (items, ledgers, taxes) => {
  let itemTotal = 0;

  // Calculate net amounts from items
  if (items && items.length > 0) {
    items.forEach((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const discPerc = parseFloat(item.discountPercentage) || 0;
      const addDiscPerc = parseFloat(item.additionalDiscountPercentage) || 0;

      const grossAmount = qty * rate;
      const discAmt1 = (grossAmount * discPerc) / 100;
      const remainder = grossAmount - discAmt1;
      const discAmt2 = (remainder * addDiscPerc) / 100;
      const netAmount = grossAmount - discAmt1 - discAmt2;

      itemTotal += netAmount;
    });
  }

  let ledgerTotal = 0;
  if (ledgers && ledgers.length > 0) {
    ledgers.forEach((ledger) => {
      ledgerTotal += parseFloat(ledger.amount) || 0;
    });
  }

  let taxTotal = 0;
  if (taxes && taxes.length > 0) {
    taxes.forEach((tax) => {
      taxTotal += parseFloat(tax.amount) || 0;
    });
  }

  return {
    itemTotal,
    ledgerTotal,
    taxTotal,
    grandTotal: itemTotal + ledgerTotal + taxTotal,
  };
};


export const generateSalesVoucherXML = (invoiceData) => {
  const {
    voucherType = "Sales",
    voucherDate,
    voucherNo,
    partyName,
    mainLedger,
    narration = "",
    items = [],
    ledgers = [],
    taxes = [],
  } = invoiceData;

  let finalDate = "";

  if (!voucherDate) {
   
    const today = new Date();
    finalDate =
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");
  } else if (voucherDate.length === 8 && /^\d{8}$/.test(voucherDate)) {
   
    finalDate = voucherDate;
  } else if (voucherDate.includes("-")) {
    
    finalDate = voucherDate.replace(/-/g, "");
  } else if (voucherDate.includes("/")) {
   
    const parts = voucherDate.split("/");
    finalDate = parts[2] + parts[0] + parts[1];
  } else {
    
    const dateObj = new Date(voucherDate);
    finalDate =
      dateObj.getFullYear() +
      String(dateObj.getMonth() + 1).padStart(2, "0") +
      String(dateObj.getDate()).padStart(2, "0");
  }

  const escapedVoucherNo = escapeXml(voucherNo);
  const escapedPartyName = escapeXml(partyName);
  const escapedMainLedger = escapeXml(mainLedger);
  const escapedNarration = escapeXml(narration);

  const totals = calculateInvoiceTotals(items, ledgers, taxes);
  const inventoryEntries = generateInventoryEntries(items, mainLedger);
  const ledgerEntries = generateLedgerEntries(ledgers);
  const taxEntries = generateTaxLedgerEntries(taxes);

  const partyEntry = generatePartyLedgerEntry(
    partyName,
    totals.grandTotal,
    voucherNo,
    finalDate
  );

  const xml = `<ENVELOPE>
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
<VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
<DATE>${finalDate}</DATE>
<EFFECTIVEDATE>${finalDate}</EFFECTIVEDATE>
<VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
<VOUCHERNUMBER>${escapedVoucherNo}</VOUCHERNUMBER>
<PARTYNAME>${escapedPartyName}</PARTYNAME>
<PARTYLEDGERNAME>${escapedPartyName}</PARTYLEDGERNAME>
<NARRATION>${escapedNarration}</NARRATION>
<ISINVOICE>Yes</ISINVOICE>
<PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
<VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
${inventoryEntries}
${partyEntry}
${ledgerEntries}
${taxEntries}
</VOUCHER>
</TALLYMESSAGE>
</REQUESTDATA>
</IMPORTDATA>
</BODY>
</ENVELOPE>`;

  return xml;
};


export const generatePurchaseVoucherXML = (invoiceData) => {
  const {
    voucherType = "Purchase",
    voucherDate,
    voucherNo,
    partyName,
    mainLedger,
    narration = "",
    items = [],
    ledgers = [],
    taxes = [],
  } = invoiceData;

  let finalDate = "";

  if (!voucherDate) {
    const today = new Date();
    finalDate =
      today.getFullYear() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");
  } else if (voucherDate.length === 8 && /^\d{8}$/.test(voucherDate)) {
    finalDate = voucherDate;
  } else if (voucherDate.includes("-")) {
    finalDate = voucherDate.replace(/-/g, "");
  } else if (voucherDate.includes("/")) {
    const parts = voucherDate.split("/");
    finalDate = parts[2] + parts[0] + parts[1];
  } else {
    const dateObj = new Date(voucherDate);
    finalDate =
      dateObj.getFullYear() +
      String(dateObj.getMonth() + 1).padStart(2, "0") +
      String(dateObj.getDate()).padStart(2, "0");
  }

  const escapedVoucherNo = escapeXml(voucherNo);
  const escapedPartyName = escapeXml(partyName);
  const escapedMainLedger = escapeXml(mainLedger);
  const escapedNarration = escapeXml(narration);

  const totals = calculateInvoiceTotals(items, ledgers, taxes);
  const inventoryEntries = generateInventoryEntries(items, mainLedger);
  const ledgerEntries = generateLedgerEntries(ledgers);
  const taxEntries = generateTaxLedgerEntries(taxes);
  const partyEntry = generatePartyLedgerEntry(
    partyName,
    totals.grandTotal,
    voucherNo,
    finalDate
  );

  const xml = `<ENVELOPE>
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
<VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
<DATE>${finalDate}</DATE>
<EFFECTIVEDATE>${finalDate}</EFFECTIVEDATE>
<VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
<VOUCHERNUMBER>${escapedVoucherNo}</VOUCHERNUMBER>
<PARTYNAME>${escapedPartyName}</PARTYNAME>
<PARTYLEDGERNAME>${escapedPartyName}</PARTYLEDGERNAME>
<NARRATION>${escapedNarration}</NARRATION>
<ISINVOICE>Yes</ISINVOICE>
<PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
<VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
${inventoryEntries}
${partyEntry}
${ledgerEntries}
${taxEntries}
</VOUCHER>
</TALLYMESSAGE>
</REQUESTDATA>
</IMPORTDATA>
</BODY>
</ENVELOPE>`;

  return xml;
};


export const generateBankingVoucherXML = (transactionData) => {
  const {
    voucherType = "Payment", // Payment or Receipt
    voucherDate,
    voucherNo,
    bankLedger,
    partyLedger,
    amount,
    narration = "",
    transactionType = "Debit", // Debit or Credit
  } = transactionData;

  const formattedDate = formatTallyDate(voucherDate);
  const escapedVoucherNo = escapeXml(voucherNo);
  const escapedBankLedger = escapeXml(bankLedger);
  const escapedPartyLedger = escapeXml(partyLedger);
  const escapedNarration = escapeXml(narration);
  const absAmount = Math.abs(parseFloat(amount) || 0);

  // For Payment: Bank Credit, Party Debit
  // For Receipt: Bank Debit, Party Credit
  const bankDeemedPositive = voucherType === "Payment" ? "Yes" : "No";
  const partyDeemedPositive = voucherType === "Payment" ? "No" : "Yes";
  const bankAmount = voucherType === "Payment" ? -absAmount : absAmount;
  const partyAmount = voucherType === "Payment" ? absAmount : -absAmount;

  return `
    <ENVELOPE>
      <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
      <BODY>
        <IMPORTDATA>
          <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
          <REQUESTDATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
              <VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
                <DATE>${formattedDate}</DATE>
                <EFFECTIVEDATE>${formattedDate}</EFFECTIVEDATE>
                <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
                <VOUCHERNUMBER>${escapedVoucherNo}</VOUCHERNUMBER>
                <NARRATION>${escapedNarration}</NARRATION>
                <LEDGERENTRIES.LIST>
                  <LEDGERNAME>${escapedPartyLedger}</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>${partyDeemedPositive}</ISDEEMEDPOSITIVE>
                  <AMOUNT>${partyAmount.toFixed(2)}</AMOUNT>
                </LEDGERENTRIES.LIST>
                <LEDGERENTRIES.LIST>
                  <LEDGERNAME>${escapedBankLedger}</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>${bankDeemedPositive}</ISDEEMEDPOSITIVE>
                  <AMOUNT>${bankAmount.toFixed(2)}</AMOUNT>
                </LEDGERENTRIES.LIST>
              </VOUCHER>
            </TALLYMESSAGE>
          </REQUESTDATA>
        </IMPORTDATA>
      </BODY>
    </ENVELOPE>`;
};


export const generateBatchVouchersXML = (
  vouchersData,
  voucherType = "Sales"
) => {
  const voucherMessages = vouchersData
    .map((invoiceData) => {
      const formattedDate = formatTallyDate(invoiceData.voucherDate);
      const totals = calculateInvoiceTotals(
        invoiceData.items,
        invoiceData.ledgers,
        invoiceData.taxes
      );
      const inventoryEntries = generateInventoryEntries(
        invoiceData.items,
        invoiceData.mainLedger
      );
      const ledgerEntries = generateLedgerEntries(invoiceData.ledgers);
      const taxEntries = generateTaxLedgerEntries(invoiceData.taxes);
      const partyEntry = generatePartyLedgerEntry(
        invoiceData.partyName,
        totals.grandTotal,
        invoiceData.voucherNo,
        invoiceData.voucherDate
      );

      return `
      <TALLYMESSAGE xmlns:UDF="TallyUDF">
        <VOUCHER VCHTYPE="${voucherType}" ACTION="Create">
          <DATE>${formattedDate}</DATE>
          <EFFECTIVEDATE>${formattedDate}</EFFECTIVEDATE>
          <VOUCHERTYPENAME>${voucherType}</VOUCHERTYPENAME>
          <VOUCHERNUMBER>${escapeXml(invoiceData.voucherNo)}</VOUCHERNUMBER>
          <PARTYNAME>${escapeXml(invoiceData.partyName)}</PARTYNAME>
          <PARTYLEDGERNAME>${escapeXml(invoiceData.partyName)}</PARTYLEDGERNAME>
          <NARRATION>${escapeXml(invoiceData.narration || "")}</NARRATION>
          <ISINVOICE>Yes</ISINVOICE>
          <PERSISTEDVIEW>Invoice Voucher View</PERSISTEDVIEW>
          <VCHENTRYMODE>Item Invoice</VCHENTRYMODE>
          ${inventoryEntries}
          ${partyEntry}
          ${ledgerEntries}
          ${taxEntries}
        </VOUCHER>
      </TALLYMESSAGE>`;
    })
    .join("");

  return `
    <ENVELOPE>
      <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>
      <BODY>
        <IMPORTDATA>
          <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
          <REQUESTDATA>
            ${voucherMessages}
          </REQUESTDATA>
        </IMPORTDATA>
      </BODY>
    </ENVELOPE>`;
};


export const validateInvoiceData = (invoiceData, stockItems = []) => {
  const errors = [];
  const normalizeStockItemName = (name = "") => {
    return name
      .trim()
      .replace(/\s+\]/g, "]")
      .replace(/\[\s+/g, "[")
      .replace(/\s+/g, " ")
      .toUpperCase();
  };

  const stockNamesSet = new Set(
    stockItems.map((s) => normalizeStockItemName(s))
  );

  
  if (!invoiceData.items || invoiceData.items.length === 0) {
    errors.push("At least one item is required");
    return { isValid: false, errors };
  }

  invoiceData.items.forEach((item, index) => {
    const normalizedName = normalizeStockItemName(item.stockItemName);

    if (!normalizedName) {
      errors.push(`Item ${index + 1}: Stock item name is required`);
    } else if (!stockNamesSet.has(normalizedName)) {
      errors.push(
        `Item ${index + 1}: Stock item "${
          item.stockItemName
        }" does not exist in Tally`
      );
    }

    if (!item.quantity || parseFloat(item.quantity) <= 0) {
      errors.push(`Item ${index + 1}: Valid quantity is required`);
    }

    if (!item.rate || parseFloat(item.rate) <= 0) {
      errors.push(`Item ${index + 1}: Valid rate is required`);
    }
  });

  if (!invoiceData.partyName) {
    errors.push("Party name is required");
  }

  if (!invoiceData.mainLedger) {
    errors.push("Main ledger is required");
  }

  if (!invoiceData.voucherNo) {
    errors.push("Voucher number is required");
  }

  return { isValid: errors.length === 0, errors };
};


export const isTallyResponseSuccess = (responseJson) => {
  if (!responseJson) return false;

  const created = parseInt(responseJson?.RESPONSE?.CREATED?._text || 0);
  const status = responseJson.RESPONSE?.STATUS?._text;

  return created > 0 || status === "1";
};


export default {

  escapeXml,
  formatTallyDate,
  xmlToJson,
  getTallyError,

  
  generateFetchLedgersXML,
  generateFetchStockItemsXML,
  generateFetchCompaniesXML,


  parseLedgers,
  parseStockItems,
  parseCompanies,

  generateInventoryEntries,
  generateLedgerEntries,
  generateTaxLedgerEntries,
  generatePartyLedgerEntry,
  generateSalesVoucherXML,
  generatePurchaseVoucherXML,
  generateBankingVoucherXML,
  generateBatchVouchersXML,


  calculateInvoiceTotals,
  validateInvoiceData,
  isTallyResponseSuccess,
};
