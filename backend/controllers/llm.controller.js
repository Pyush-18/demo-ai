import fs from "fs";
import path from "path";
import { convertFileToCSV } from "../utils/fileConvertion.js";
import {callGroqAndSegregate, extractInvoiceData} from "../utils/callLLM.js";
import { parseDate } from "../utils/parseDate.js";

export const callLLM = async (req, res) => {
  const file = req.file;
  const { dateRange, bankLedger, bankName } = req.body;
  
  console.log("📋 Request Details:");
  console.log("  - Date Range:", dateRange);
  console.log("  - Bank Ledger:", bankLedger);
  console.log("  - Bank Name:", bankName);
  console.log("  - File:", file?.originalname);

  if (!file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const __dirname = path.resolve();
  const filePath = path.join(__dirname, "/uploads", file.filename);
  console.log("  - File Path:", filePath);

  try {
    console.log("\n🔄 Converting file to CSV...");
    const csvContent = convertFileToCSV(filePath, file.originalname);
    
    if (!csvContent || csvContent.trim().length === 0) {
      throw new Error("CSV conversion resulted in empty content");
    }

    const csvSize = csvContent.length;
    console.log(`✓ CSV generated (${csvSize} characters)`);

    console.log("\n🤖 Processing with Groq AI...");
    const aiResponse = await callGroqAndSegregate(
      csvContent, 
      bankLedger || "Not provided", 
      bankName || "Not provided"
    );

    if (!aiResponse || typeof aiResponse !== "object") {
      throw new Error("Invalid AI response format");
    }

    const totalTransactionsBefore = Object.values(aiResponse).reduce(
      (sum, txs) => sum + (Array.isArray(txs) ? txs.length : 0),
      0
    );
    console.log(`✓ AI processing complete - ${totalTransactionsBefore} transactions found`);

    let finalResponse = aiResponse;

    if (dateRange && dateRange.trim() !== "") {
      console.log("\n📅 Applying date range filter...");
      
      const [startStr, endStr] = dateRange.split("-").map((d) => d.trim());
      const startDate = parseDate(startStr);
      const endDate = parseDate(endStr);

      if (!isNaN(startDate) && !isNaN(endDate)) {
        console.log(`  - Start Date: ${new Date(startDate).toLocaleDateString()}`);
        console.log(`  - End Date: ${new Date(endDate).toLocaleDateString()}`);

        const filteredResponse = {};
        let filteredCount = 0;

        for (const [category, transactions] of Object.entries(aiResponse)) {
          if (!Array.isArray(transactions)) {
            console.warn(`⚠️  Category "${category}" does not contain an array, skipping`);
            continue;
          }

          const filteredTxns = transactions.filter((txn) => {
            const txnDate = parseDate(txn.Date);
            if (isNaN(txnDate)) {
              console.warn(`⚠️  Invalid date format: ${txn.Date}`);
              return false;
            }
            return txnDate >= startDate && txnDate <= endDate;
          });

          if (filteredTxns.length > 0) {
            filteredResponse[category] = filteredTxns;
            filteredCount += filteredTxns.length;
          }
        }

        if (Object.keys(filteredResponse).length > 0) {
          finalResponse = filteredResponse;
          console.log(`✓ Filtered to ${filteredCount} transactions within date range`);
        } else {
          console.warn("⚠️  No transactions found in date range, returning all data");
        }
      } else {
        console.warn("⚠️  Invalid date range format, returning full data");
      }
    }

    const categoriesCount = Object.keys(finalResponse).length;
    const totalTransactionsAfter = Object.values(finalResponse).reduce(
      (sum, txs) => sum + (Array.isArray(txs) ? txs.length : 0),
      0
    );

    console.log("\n✅ Processing Complete!");
    console.log(`  - Categories: ${categoriesCount}`);
    console.log(`  - Total Transactions: ${totalTransactionsAfter}`);
    console.log(`  - Response Size: ${JSON.stringify(finalResponse).length} bytes\n`);


    res.status(200).json({
      success: true,
      data: finalResponse,
      metadata: {
        totalCategories: categoriesCount,
        totalTransactions: totalTransactionsAfter,
        dateRangeApplied: !!dateRange,
        bankLedger: bankLedger || null,
        bankName: bankName || null,
      }
    });

  } catch (error) {
    console.error("\n❌ Error during processing:", error.message);
    console.error("Stack:", error.stack);

    const errorResponse = {
      success: false,
      error: "Processing failed",
      message: error.message,
    };

    if (error.message.includes("Groq API")) {
      errorResponse.error = "AI processing failed";
      errorResponse.details = "The AI service encountered an error. Please try again.";
      res.status(500).json(errorResponse);
    } else if (error.message.includes("CSV")) {
      errorResponse.error = "File conversion failed";
      errorResponse.details = "Unable to convert file to CSV format.";
      res.status(400).json(errorResponse);
    } else {
      errorResponse.details = "An unexpected error occurred during processing.";
      res.status(500).json(errorResponse);
    }

  } finally {
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error("❌ Error deleting file:", err);
      } else {
        console.log("🗑️  Uploaded file deleted:", file.filename);
      }
    });
  }
};




export const extractInvoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (req.file.mimetype !== "application/pdf") {
   
      fs.unlinkSync(req.file.path);
      return res.status(400).json({
        success: false,
        message: "Only PDF files are supported for invoice extraction",
      });
    }

    console.log("📄 Processing invoice extraction...");

b
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileBlob = new Blob([fileBuffer], { type: "application/pdf" });

    const extractedData = await extractInvoiceData(fileBlob);

 
    fs.unlinkSync(req.file.path);

    console.log("✅ Invoice extraction successful");

    return res.status(200).json({
      success: true,
      message: "Invoice extracted successfully",
      data: extractedData,
    });

  } catch (error) {
    console.error("❌ Invoice extraction error:", error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to extract invoice data",
      error: error.message,
    });
  }
};
