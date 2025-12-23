import dotenv from "dotenv";
dotenv.config();
import Groq from "groq-sdk";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const baseSystemInstruction = `
You are an expert financial data analyst. Your task is to process raw bank statement data, skipping all header and summary rows, and returning only transactional rows.

---

### Required Output Fields for Each Transaction:
1. Date
2. Mode
3. Particulars
4. Deposits
5. Withdrawals
6. Balance

Group transactions logically based on their type or description (e.g., "UPI Transactions", "NEFT Payments", "Cheque Withdrawals", "Net Banking").

---

### CRITICAL RULES

1. Rejected Transactions
    - Any transaction whose 'Particulars' contain words like:
      REJECT, RETURN, BOUNCE, FAILED, REVERSAL, REFUND
      must go under a top-level category named "Rejected Transactions".
    - For these transactions, do NOT include any 'bankLedger' or 'bankName' fields, even if they match partially.

2. Bank Ledger & Bank Name Assignment (CRITICAL LOGIC)
    - You will be provided one or both of these values: bankLedger and bankName.
    - **A. Generic Ledger Assignment (Based on Flow):**
        - If a generic 'bankLedger' (e.g., "Credit", "Debit", "Income", "Expense") is provided by the user, assign it based on the transaction flow:
            - **For Deposits (money in):** If 'Deposits' > 0, assign the provided 'bankLedger' (e.g., "Credit").
            - **For Withdrawals (money out):** If 'Withdrawals' > 0, assign the provided 'bankLedger' (e.g., "Debit").
    - **B. Specific Ledger Assignment (Based on Particulars):**
        - **This rule OVERRIDES the Generic Assignment (A).**
        - If the narration or mode explicitly matches a *specific* accounting concept, use that specific ledger instead of the generic one (e.g., "Salary" is more specific than "Credit"; "Rent" is more specific than "Debit").
        - **Keywords for Specific Ledgers:** Look for words/abbreviations like: SALARY, RENT, INTEREST, PURCHASE, SALES, BIL/BPAY (for Bills), CMS (for corporate payments).
    - **C. Bank Name Assignment:**
        - Assign the provided 'bankName' only if the narration or mode includes that bank name or abbreviation (e.g., "SBI", "PNB", "ICICI").
    - If uncertain or no match is found — omit the bankLedger and bankName fields.

3. Data Quality Rules
    - Exclude any duplicate or summary rows.
    - Exclude any transactions missing one or more of the 6 required fields.
    - Ensure the output is valid JSON:
      - The top-level keys are the category names.
      - Each value is an array of objects representing transactions.
      - Each object has the 6 required fields, plus optional bankLedger and bankName (only when matched).

---

### Example Output (Demonstrating Ledger Logic)
{
  "UPI Transactions": [
    {
      "Date": "09-04-2025",
      "Mode": "UPI",
      "Particulars": "UPI/50996531625",
      "Deposits": "0",
      "Withdrawals": "500",
      "Balance": "548062.95",
      "bankLedger": "Debit"
    }
  ],
  "Bill Payments": [
    {
      "Date": "05-04-2025",
      "Mode": "BIL/BPAY",
      "Particulars": "BIL/BPAY/000000/Electricity Bill",
      "Deposits": "0",
      "Withdrawals": "1180",
      "Balance": "821844.72",
      "bankLedger": "Utilities/Rent"
    }
  ],
  "Deposits - Specific Income": [
    {
      "Date": "02-04-2025",
      "Mode": "CMS TRANSACTIO",
      "Particulars": "CMS/0016756438/HDFC Salary Credit",
      "Deposits": "10578",
      "Withdrawals": "0",
      "Balance": "2013251.72",
      "bankLedger": "Salary",
      "bankName": "HDFC"
    }
  ],
  "Rejected Transactions": [
    {
      "Date": "18-04-2025",
      "Mode": "CHEQUE",
      "Particulars": "REJECT:292337:REQUIRED INFORMATION NOT LEGIBLE/COR",
      "Deposits": "0",
      "Withdrawals": "14313",
      "Balance": "673820.72"
    }
  ]
}
`;

function extractCSVHeader(csvContent) {
  const lines = csvContent.trim().split("\n");
  if (lines.length === 0) return "";
  return lines[0];
}

function chunkCSVData(csvContent, chunkSize = 4000) {
  const header = extractCSVHeader(csvContent);
  const lines = csvContent.trim().split("\n");

  if (lines.length <= 1) {
    return [csvContent];
  }

  const dataLines = lines.slice(1);
  const chunks = [];
  let currentChunk = [];
  let currentSize = header.length + 1; // Start with header size

  for (const line of dataLines) {
    const lineSize = line.length + 1;

    if (currentSize + lineSize > chunkSize && currentChunk.length > 0) {
      chunks.push(header + "\n" + currentChunk.join("\n"));
      currentChunk = [];
      currentSize = header.length + 1;
    }

    currentChunk.push(line);
    currentSize += lineSize;
  }

  if (currentChunk.length > 0) {
    chunks.push(header + "\n" + currentChunk.join("\n"));
  }

  return chunks;
}

async function processChunk(
  chunkContent,
  bankLedger,
  bankName,
  chunkIndex,
  totalChunks
) {
  try {
    console.log(`  📦 Processing chunk ${chunkIndex + 1}/${totalChunks}...`);

    const completion = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        {
          role: "system",
          content: baseSystemInstruction,
        },
        {
          role: "user",
          content: `Here is the data from an Excel file in CSV format (Chunk ${
            chunkIndex + 1
          }/${totalChunks}). Analyze and segregate it. **Remember to skip any non-transactional data, like headers or summaries, and only use the fields: Date, Mode, Particulars, Deposits, Withdrawals, and Balance.**

          **Additionally, for each transaction, if it matches the following context, append the fields accordingly:**
          - bankLedger: ${bankLedger}
          - bankName: ${bankName}

          CSV Data:\n\n${chunkContent}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const rawText = completion.choices[0]?.message?.content?.trim() || "{}";
    const parsed = JSON.parse(rawText);

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error(`Invalid JSON format in chunk ${chunkIndex + 1}`);
    }

    const txCount = Object.values(parsed).reduce(
      (sum, txs) => sum + (Array.isArray(txs) ? txs.length : 0),
      0
    );
    console.log(
      `  ✓ Chunk ${
        chunkIndex + 1
      }/${totalChunks} processed (${txCount} transactions)`
    );

    return parsed;
  } catch (err) {
    console.error(`  ✗ Error processing chunk ${chunkIndex + 1}:`, err.message);
    throw err;
  }
}

function mergeChunkResults(chunkResults) {
  const merged = {};

  for (const chunkResult of chunkResults) {
    for (const [category, transactions] of Object.entries(chunkResult)) {
      if (!Array.isArray(transactions)) {
        console.warn(`⚠️  Skipping non-array category: ${category}`);
        continue;
      }

      if (!merged[category]) {
        merged[category] = [];
      }

      const existingKeys = new Set(
        merged[category].map(
          (tx) =>
            `${tx.Date}|${tx.Particulars}|${tx.Deposits}|${tx.Withdrawals}`
        )
      );

      for (const transaction of transactions) {
        const key = `${transaction.Date}|${transaction.Particulars}|${transaction.Deposits}|${transaction.Withdrawals}`;

        if (!existingKeys.has(key)) {
          merged[category].push(transaction);
          existingKeys.add(key);
        }
      }
    }
  }

  return merged;
}

async function callGroqAndSegregate(fileContent, bankLedger, bankName) {
  try {
    const fileSize = fileContent.length;
    const CHUNK_THRESHOLD = 4000; 

    if (fileSize <= CHUNK_THRESHOLD) {
      console.log(
        `  📄 File size: ${fileSize} chars (processing without chunking)`
      );

      const completion = await groq.chat.completions.create({
        model: "moonshotai/kimi-k2-instruct-0905",
        messages: [
          {
            role: "system",
            content: baseSystemInstruction,
          },
          {
            role: "user",
            content: `Here is the data from an Excel file in CSV format. Analyze and segregate it. **Remember to skip any non-transactional data, like headers or summaries, and only use the fields: Date, Mode, Particulars, Deposits, Withdrawals, and Balance.**

            **Additionally, for each transaction, if it matches the following context, append the fields accordingly:**
            - bankLedger: ${bankLedger}
            - bankName: ${bankName}

            CSV Data:\n\n${fileContent}`,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.3,
      });

      const rawText = completion.choices[0]?.message?.content?.trim() || "{}";
      const parsed = JSON.parse(rawText);

      if (typeof parsed !== "object" || parsed === null) {
        throw new Error("Invalid JSON format in Groq response");
      }

      return parsed;
    }

    console.log(`  📄 File size: ${fileSize} chars (using chunking strategy)`);

    const chunks = chunkCSVData(fileContent, CHUNK_THRESHOLD);
    console.log(`  🔪 Split into ${chunks.length} chunks\n`);

    const CONCURRENCY_LIMIT = 3;
    const chunkResults = [];

    for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
      const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
      const batchPromises = batch.map((chunk, batchIndex) =>
        processChunk(chunk, bankLedger, bankName, i + batchIndex, chunks.length)
      );

      const batchResults = await Promise.all(batchPromises);
      chunkResults.push(...batchResults);

      if (i + CONCURRENCY_LIMIT < chunks.length) {
        console.log(`  ⏸️  Pausing 1s before next batch...\n`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n  🔄 Merging ${chunkResults.length} chunk results...`);
    const mergedResults = mergeChunkResults(chunkResults);

    const totalTransactions = Object.values(mergedResults).reduce(
      (sum, txs) => sum + (Array.isArray(txs) ? txs.length : 0),
      0
    );
    const categoryCount = Object.keys(mergedResults).length;

    console.log(`  ✓ Merge complete:`);
    console.log(`    - Categories: ${categoryCount}`);
    console.log(`    - Total Transactions: ${totalTransactions}`);

    return mergedResults;
  } catch (err) {
    console.error("  ❌ Groq API error:", err.message);
    throw new Error(`Groq API processing failed: ${err.message}`);
  }
}

function chunkPDFText(pdfText, chunkSize = 8000) {
  if (pdfText.length <= chunkSize) {
    return [pdfText];
  }

  const chunks = [];
  const lines = pdfText.split("\n");
  let currentChunk = "";

  for (const line of lines) {
    if (
      currentChunk.length + line.length > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push(currentChunk.trim());
      currentChunk = "";
    }

    currentChunk += line + "\n";
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function processPDFChunk(chunkContent, chunkIndex, totalChunks) {
  try {
    console.log(
      `  📦 Processing PDF chunk ${chunkIndex + 1}/${totalChunks}...`
    );

    const systemPrompt = `
You are an expert AI Invoice Parser specialized in Indian Tax Invoices.
Your goal is to extract structured data from the provided invoice text.

### EXTRACTION RULES:
1. **Document Details**: Extract Document No, Document Date
2. **Party Details**: Extract Bill to Name & Address, Party's GSTIN
3. **Items Table**: Extract ALL line items with complete details

### JSON OUTPUT FORMAT (Strict):
{
  "voucherNo": "string",
  "voucherDate": "YYYY-MM-DD",
  "partyName": "string",
  "partyAddress": "string",
  "gstNumber": "string",
  "items": [
    {
      "itemName": "string (Full description, e.g., FEVICOL SH CONT[6 X 2KG ])",
      "hsnCode": "string",
      "quantity": number,
      "unit": "string (Case/Drum/EA)",
      "ratePerUnit": number,
      "totalValue": number,
      "discount": number,
      "taxableValue": number,
      "cgstPercent": number,
      "sgstPercent": number,
      "cgstAmount": number,
      "sgstAmount": number,
      "totalAmount": number
    }
  ],
  "subTotal": number,
  "totalCGST": number,
  "totalSGST": number,
  "grandTotal": number
}

${
  totalChunks > 1
    ? `This is chunk ${
        chunkIndex + 1
      } of ${totalChunks}. Extract whatever invoice data you can find.`
    : ""
}

### CRITICAL: All numeric fields must be final calculated numbers, not expressions.

Return ONLY valid JSON.
`;

    const completion = await groq.chat.completions.create({
      model: "moonshotai/kimi-k2-instruct-0905",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Extract data from this Indian Tax Invoice chunk:\n\n${chunkContent}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim() || "{}";
    const parsedData = JSON.parse(rawResponse);

    console.log(`  ✓ PDF Chunk ${chunkIndex + 1}/${totalChunks} processed`);
    return parsedData;
  } catch (err) {
    console.error(
      `  ✗ Error processing PDF chunk ${chunkIndex + 1}:`,
      err.message
    );
    throw err;
  }
}

function mergeInvoiceChunks(chunkResults) {
  const merged = {
    voucherNo: "",
    voucherDate: "",
    partyName: "",
    partyAddress: "",
    gstNumber: "",
    items: [],
    subTotal: 0,
    totalCGST: 0,
    totalSGST: 0,
    grandTotal: 0,
  };

  const itemsMap = new Map();

  for (const chunk of chunkResults) {
    // Merge header fields (use first non-empty value)
    if (chunk.voucherNo && !merged.voucherNo)
      merged.voucherNo = chunk.voucherNo;
    if (chunk.voucherDate && !merged.voucherDate)
      merged.voucherDate = chunk.voucherDate;
    if (chunk.partyName && !merged.partyName)
      merged.partyName = chunk.partyName;
    if (chunk.partyAddress && !merged.partyAddress)
      merged.partyAddress = chunk.partyAddress;
    if (chunk.gstNumber && !merged.gstNumber)
      merged.gstNumber = chunk.gstNumber;

    // Merge items (avoid duplicates)
    if (chunk.items && Array.isArray(chunk.items)) {
      for (const item of chunk.items) {
        if (item.itemName) {
          const key = `${item.itemName}_${item.quantity}_${item.ratePerUnit}`;
          if (!itemsMap.has(key)) {
            itemsMap.set(key, item);
          }
        }
      }
    }

    // Use the highest values for totals
    if (chunk.subTotal > merged.subTotal) merged.subTotal = chunk.subTotal;
    if (chunk.totalCGST > merged.totalCGST) merged.totalCGST = chunk.totalCGST;
    if (chunk.totalSGST > merged.totalSGST) merged.totalSGST = chunk.totalSGST;
    if (chunk.grandTotal > merged.grandTotal)
      merged.grandTotal = chunk.grandTotal;
  }

  merged.items = Array.from(itemsMap.values());

  return merged;
}
async function extractInvoiceData(fileBlob) {
  try {
    console.log(" 📄 Loading PDF...");

    const loader = new PDFLoader(fileBlob, {
      splitPages: false,
    });

    const docs = await loader.load();
    const pdfText = docs[0].pageContent;

    console.log(`  ✓ Extracted ${pdfText.length} characters of text.`);

    const CHUNK_THRESHOLD = 8000;

    if (pdfText.length <= CHUNK_THRESHOLD) {
      console.log(
        `  📄 PDF size: ${pdfText.length} chars (processing without chunking)`
      );

      const systemPrompt = `
You are an expert AI Invoice Parser specialized in Indian Tax Invoices.
Your goal is to extract structured data from the provided invoice text.

### EXTRACTION RULES:
1. **Document Details**: Extract Document No, Document Date
2. **Party Details**: Extract Bill to Name & Address, Party's GSTIN
3. **Items Table**: Extract ALL line items with complete details including:
   - Full item description (e.g., "FEVICOL SH CONT[6 X 2KG ]")
   - Base unit (e.g., "Case", "Drum", "EA")
   - Quantity with proper unit
   - Rate per unit
   - Total Value
   - Discount amount
   - Taxable Value
   - CGST percentage (e.g., 9%)
   - SGST percentage (e.g., 9%)
   - Tax amounts

### JSON OUTPUT FORMAT (Strict):
{
  "voucherNo": "string (Document No)",
  "voucherDate": "YYYY-MM-DD (Document Date)",
  "partyName": "string (Bill to Name)",
  "partyAddress": "string (Full address)",
  "gstNumber": "string (Party's GSTIN)",
  "items": [
    {
      "itemName": "string (Full description with codes, e.g., FEVICOL SH CONT[6 X 2KG ])",
      "hsnCode": "string (HSN/SAC Code)",
      "quantity": number,
      "unit": "string (Case/Drum/EA/Ltrs etc.)",
      "ratePerUnit": number,
      "totalValue": number,
      "discount": number,
      "taxableValue": number,
      "cgstPercent": number (e.g., 9 for 9%),
      "sgstPercent": number (e.g., 9 for 9%),
      "cgstAmount": number,
      "sgstAmount": number,
      "totalAmount": number
    }
  ],
  "subTotal": number (sum of all taxable values),
  "totalCGST": number (sum of all CGST),
  "totalSGST": number (sum of all SGST),
  "grandTotal": number (subTotal + totalCGST + totalSGST)
}

### CRITICAL REQUIREMENTS:
- Extract COMPLETE item names including brackets and specifications (e.g., "[6 X 2KG]", "[50 KG OPEN TOP]")
- Extract exact unit types (Case, Drum, EA, Ltrs, etc.)
- CGST and SGST percentages as numbers (9, not "9%" or 0.09)
- All numeric fields MUST be calculated final numbers, NOT expressions
- Do NOT use mathematical operators like "+", "-", "*" in JSON values
- Calculate all totals and provide only the final result
- If CGST/SGST is mentioned as "9%", store as number 9

Return ONLY valid JSON. No markdown, no explanations, no calculations in the output.
`;

      console.log("  🧠 Analyzing with AI...");

      let attempts = 0;
      const maxAttempts = 3;
      let lastError = null;

      while (attempts < maxAttempts) {
        try {
          const completion = await groq.chat.completions.create({
            model: "moonshotai/kimi-k2-instruct-0905",
            messages: [
              { role: "system", content: systemPrompt },
              {
                role: "user",
                content: `Extract data from this Indian Tax Invoice. Pay special attention to item descriptions, units, and GST details:\n\n${pdfText}`,
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0.1,
          });

          const rawResponse =
            completion.choices[0]?.message?.content?.trim() || "{}";
          const parsedData = JSON.parse(rawResponse);

          if (
            typeof parsedData.subTotal === "string" ||
            typeof parsedData.grandTotal === "string"
          ) {
            throw new Error("Totals contain expressions instead of numbers");
          }

          console.log("  ✓ Extraction Complete");
          return parsedData;
        } catch (err) {
          attempts++;
          lastError = err;
          console.log(`  ⚠️  Attempt ${attempts} failed: ${err.message}`);

          if (attempts < maxAttempts) {
            console.log(`  🔄 Retrying (${attempts}/${maxAttempts})...`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      throw lastError;
    }

    console.log(
      `  📄 PDF size: ${pdfText.length} chars (using chunking strategy)`
    );

    const chunks = chunkPDFText(pdfText, CHUNK_THRESHOLD);
    console.log(`  🔪 Split into ${chunks.length} chunks\n`);

    const CONCURRENCY_LIMIT = 2;
    const chunkResults = [];

    for (let i = 0; i < chunks.length; i += CONCURRENCY_LIMIT) {
      const batch = chunks.slice(i, i + CONCURRENCY_LIMIT);
      const batchPromises = batch.map((chunk, batchIndex) =>
        processPDFChunk(chunk, i + batchIndex, chunks.length)
      );

      const batchResults = await Promise.all(batchPromises);
      chunkResults.push(...batchResults);

      if (i + CONCURRENCY_LIMIT < chunks.length) {
        console.log(`  ⏸️  Pausing 1s before next batch...\n`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n  🔄 Merging ${chunkResults.length} chunk results...`);
    const mergedResults = mergeInvoiceChunks(chunkResults);

    console.log(`  ✓ Merge complete:`);
    console.log(`    - Items extracted: ${mergedResults.items.length}`);
    console.log(`    - Grand Total: ${mergedResults.grandTotal}`);

    return mergedResults;
  } catch (err) {
    console.error("  ❌ PDF Extraction Error:", err);
    throw new Error("Failed to extract invoice data");
  }
}

export { callGroqAndSegregate, extractInvoiceData };
