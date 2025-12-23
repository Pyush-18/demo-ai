import XLSX from "xlsx";
import fs from "fs";

export function convertFileToCSV(filePath, originalName) {
  const lower = originalName.toLowerCase();

  if (lower.endsWith(".csv")) {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
    const workbook = XLSX.readFile(filePath); 
    const firstSheetName = workbook.SheetNames[0];
    const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheetName]);
    return csv;
  }

  throw new Error("Unsupported file type. Please upload CSV or Excel files.");
}
