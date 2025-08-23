import React, { useState } from "react";
import { Upload, FileText, X, CheckCircle } from "lucide-react";

interface PDFUploadProps {
  lender: "lenderA" | "lenderB";
  onPDFUpload: (file: File, lender: "lenderA" | "lenderB") => void;
}

const PDFUpload: React.FC<PDFUploadProps> = ({ lender, onPDFUpload }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setIsProcessing(true);

      // Simulate PDF processing
      setTimeout(() => {
        setIsProcessing(false);
        onPDFUpload(file, lender);
      }, 2000);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const getLenderName = () => {
    return lender === "lenderA" ? "Bank A" : "Bank B";
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-secondary-900">
          {getLenderName()} Loan Estimate
        </h3>
        {uploadedFile && (
          <div className="flex items-center space-x-2 text-green-600">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Processed</span>
          </div>
        )}
      </div>

      {!uploadedFile ? (
        <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
            id={`pdf-upload-${lender}`}
          />
          <label
            htmlFor={`pdf-upload-${lender}`}
            className="cursor-pointer flex flex-col items-center space-y-3"
          >
            <Upload className="text-secondary-400" size={32} />
            <div>
              <p className="text-sm font-medium text-secondary-900">
                Upload {getLenderName()} PDF
              </p>
              <p className="text-xs text-secondary-500">
                Drag and drop or click to select loan estimate PDF
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="text-primary-600" size={20} />
              <div>
                <p className="text-sm font-medium text-secondary-900">
                  {uploadedFile.name}
                </p>
                <p className="text-xs text-secondary-500">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-secondary-400 hover:text-secondary-600"
            >
              <X size={16} />
            </button>
          </div>

          {isProcessing && (
            <div className="flex items-center space-x-2 text-primary-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span className="text-sm">Processing PDF...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PDFUpload;
