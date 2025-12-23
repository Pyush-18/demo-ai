import { useCallback } from "react";
import {
  exportToExcel,
  exportToJson,
  exportToPdf,
  exportToXml,
} from "../utils/tallyUtils";

export const useExport = () => {
  const handleExport = useCallback(async (format, data, fileName) => {
    try {
      const timestamp = new Date().toISOString().split("T")[0];
      const baseFileName = `${fileName}_${timestamp}`;

      await new Promise((resolve) => setTimeout(resolve, 300));

      switch (format) {
        case "excel":
          await exportToExcel(data, `${baseFileName}.xlsx`);

          break;
        case "pdf":
          exportToPdf(data, `${baseFileName}.pdf`);

          break;
        case "json":
          exportToJson(data, `${baseFileName}.json`);

          break;
        case "xml":
          exportToXml(data, `${baseFileName}.xml`);

          break;
        default:
          return;
      }
    } catch (error) {
      throw error;
    }
  }, []);

  return { handleExport };
};
