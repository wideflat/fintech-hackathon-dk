import React, { useState } from "react";
import { FileText } from "lucide-react";

interface PDFViewerProps {
  lender: "lenderA" | "lenderB";
  pdfUrl?: string;
  onPDFUpload: (file: File, lender: "lenderA" | "lenderB") => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  lender,
  pdfUrl,
  onPDFUpload,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      onPDFUpload(file, lender);
    }
  };

  const getPDFUrl = () => {
    if (uploadedFile) {
      return URL.createObjectURL(uploadedFile);
    }
    // Show real loan estimate PDFs
    if (lender === "lenderA") {
      return "/loan-estimate-A.pdf";
    } else {
      return "/loan-estimate-B.pdf";
    }
  };

  const currentPDFUrl = getPDFUrl(); // Determine if a PDF is available

  return (
    <div className="card h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">
          {lender === "lenderA" ? "Bank A" : "Bank B"} - Loan Estimate
        </h3>
      </div>

      {/* Upload Section - Only show if no PDF is currently available */}
      {!currentPDFUrl && (
        <div className="border-2 border-dashed border-secondary-300 rounded-lg p-4 text-center mb-4">
          <FileText className="text-secondary-400 mx-auto mb-4" size={48} />
          <p className="text-secondary-600 mb-4">
            Upload {lender === "lenderA" ? "Bank A" : "Bank B"} loan estimate
            PDF
          </p>
          <label className="btn-primary cursor-pointer">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            Choose PDF File
          </label>
        </div>
      )}

      {/* PDF Display */}
      <div className="flex-1 bg-secondary-100 rounded-lg overflow-hidden">
        {currentPDFUrl ? (
          <iframe
            src={currentPDFUrl}
            title={`${lender} Loan Estimate`}
            width="100%"
            height="100%"
            className="border-none"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-secondary-500">
            No PDF available.
          </div>
        )}
      </div>

      {uploadedFile && (
        <div className="mt-4 text-sm text-secondary-700">
          File: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
