import React, { useState, useEffect } from "react";
import { X, FileDown, FileJson, FileSpreadsheet, FileText } from "lucide-react";

const ExportModal = ({ isOpen, onClose, data, dataType = "transactions", onExport }) => {
  const [selectedFormat, setSelectedFormat] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      console.log("Modal closed - resetting state");
      setSelectedFormat("");
      setSelectedFile(null);
    } else {
      console.log("Modal opened with data:", data?.length, "items");
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const exportFormats = [
    { id: "json", label: "JSON", icon: FileJson, color: "blue" },
    { id: "excel", label: "Excel", icon: FileSpreadsheet, color: "green" },
    { id: "pdf", label: "PDF", icon: FileText, color: "red" },
    { id: "xml", label: "XML", icon: FileDown, color: "purple" },
  ];

  const handleFormatSelect = (formatId) => {
    console.log("Format selected:", formatId);
    setSelectedFormat(formatId);
    setSelectedFile(null);
  };

  const handleFileSelect = (file) => {
    console.log("File selected:", file.narration || "Untitled");
    setSelectedFile(file);
  };

  const handleExport = async () => {
    if (!selectedFile || !selectedFormat) {
      console.warn("Export attempted without file or format selected");
      return;
    }

    console.log("Starting export:", {
      format: selectedFormat,
      file: selectedFile.narration || "Untitled",
    });

    const fileName = `${selectedFile.narration || "transaction"}_${
      selectedFile.date || "unknown"
    }`;

    try {
      if (onExport) {
        await onExport(selectedFormat, selectedFile, fileName);
        console.log("Export completed successfully");
      } else {
        console.error("onExport prop is not provided");
      }

      setSelectedFormat("");
      setSelectedFile(null);
      
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const handleExportAll = async () => {
    if (!selectedFormat) {
      console.warn("Export All attempted without format selected");
      return;
    }

    console.log("Starting Export All:", {
      format: selectedFormat,
      itemCount: data?.length || 0,
    });

    const fileName = `all_${dataType}_${Date.now()}`;

    try {
      if (onExport) {
        await onExport(selectedFormat, data, fileName);
        console.log("Export All completed successfully");
      } else {
        console.error("onExport prop is not provided");
      }

      setSelectedFormat("");
      setSelectedFile(null);

      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      console.error("Export All failed:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />


      <div className="relative bg-slate-900 border border-purple-500/20 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
   
        <div className="flex items-center justify-between p-6 border-b border-purple-500/20">
          <div>
            <h2 className="text-2xl font-bold text-white">Export Data</h2>
            <p className="text-sm text-purple-300 mt-1">
              Select format and file to export
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

     
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
    
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              1. Select Export Format
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => handleFormatSelect(format.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedFormat === format.id
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-purple-500/20 bg-slate-800/50 hover:border-purple-500/40"
                    }`}
                  >
                    <Icon
                      size={32}
                      className={`mx-auto mb-2 ${
                        selectedFormat === format.id
                          ? "text-purple-400"
                          : "text-purple-300"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        selectedFormat === format.id
                          ? "text-purple-300"
                          : "text-purple-200"
                      }`}
                    >
                      {format.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {selectedFormat && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  2. Select File to Export
                </h3>
                <button
                  onClick={handleExportAll}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
                >
                  Export All ({data?.length || 0})
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {data?.length === 0 ? (
                  <div className="text-center py-8 text-purple-300/70">
                    No files available to export
                  </div>
                ) : (
                  data?.map((file, index) => (
                    <button
                      key={`${file.id}-${index}`}
                      onClick={() => handleFileSelect(file)}
                      className={`w-full p-4 rounded-xl border transition-all text-left ${
                        selectedFile === file
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-purple-500/20 bg-slate-800/50 hover:border-purple-500/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium truncate">
                            {file.narration || "Untitled Transaction"}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-sm text-purple-300">
                            <span>{file.date || "N/A"}</span>
                            <span>₹{file.amount?.toLocaleString("en-IN") || 0}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                file.type === "Payment"
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-green-500/20 text-green-300"
                              }`}
                            >
                              {file.type}
                            </span>
                          </div>
                        </div>
                        {selectedFile === file && (
                          <div className="ml-4 w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-purple-500/20 bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 text-purple-300 font-medium hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={!selectedFormat || !selectedFile}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Export Selected
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;