import React from "react";
import {
  TrendingUp,
  DollarSign,
  Percent,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import PDFUpload from "./PDFUpload";

const CompactComparisonView: React.FC = () => {
  const { loanEstimates, comparisonResult, setLoading, setComparisonResult } =
    useAppStore();

  const handlePDFUpload = (file: File, lender: "lenderA" | "lenderB") => {
    // Simulate extracting data from PDF
    const mockData = {
      lenderName: lender === "lenderA" ? "Bank A" : "Bank B",
      interestRate: lender === "lenderA" ? 3.25 : 3.45,
      points: lender === "lenderA" ? 0.5 : 0.0,
      totalFees: lender === "lenderA" ? 2500 : 3200,
      monthlyPayment: lender === "lenderA" ? 1850 : 1920,
      loanAmount: 400000,
      term: 30,
    };

    // Update store with extracted data
    // This would normally come from PDF parsing
    console.log(`Extracted data from ${file.name}:`, mockData);
  };

  const handleCompare = async () => {
    if (!loanEstimates.lenderA || !loanEstimates.lenderB) {
      return;
    }

    setLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockResult = {
        recommendation: "lenderA" as const,
        reasoning:
          "Bank A offers better overall value with lower fees and competitive rate.",
        savings: {
          monthly: 70,
          total: 25200,
        },
        breakdown: {
          interestRateComparison: "Bank A has 0.20% lower rate",
          pointsComparison: "Bank A requires 0.5 points vs 0 points",
          feesComparison: "Bank A has $700 less in total fees",
        },
      };

      setComparisonResult(mockResult);
    } catch (error) {
      console.error("Comparison failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const canCompare = loanEstimates.lenderA && loanEstimates.lenderB;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DollarSign className="text-primary-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                € Mortgage Closer
              </h2>
              <p className="text-sm text-secondary-600">
                Compare loan estimates side by side
              </p>
            </div>
          </div>

          {canCompare && (
            <button
              onClick={handleCompare}
              className="btn-primary flex items-center space-x-2"
            >
              <TrendingUp size={20} />
              <span>Generate AI Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - PDF Uploads */}
        <div className="w-full lg:w-1/3 p-6 space-y-6 overflow-auto">
          <PDFUpload lender="lenderA" onPDFUpload={handlePDFUpload} />
          <PDFUpload lender="lenderB" onPDFUpload={handlePDFUpload} />
        </div>

        {/* Center Panel - Compact Comparison */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Bank A */}
          <div className="flex-1 p-6 border-r border-secondary-200">
            <div className="card h-full">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Bank A
              </h3>

              {loanEstimates.lenderA ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">
                      Interest
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {formatPercentage(loanEstimates.lenderA.interestRate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">
                      Points
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {loanEstimates.lenderA.points}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">
                      Fees
                    </span>
                    <span className="text-lg font-bold text-purple-700">
                      {formatCurrency(loanEstimates.lenderA.totalClosingCosts)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">
                      Monthly
                    </span>
                    <span className="text-lg font-bold text-orange-700">
                      {formatCurrency(loanEstimates.lenderA.monthlyPayment)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <p>Upload Bank A PDF to see details</p>
                </div>
              )}
            </div>
          </div>

          {/* Bank B */}
          <div className="flex-1 p-6">
            <div className="card h-full">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Bank B
              </h3>

              {loanEstimates.lenderB ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">
                      Interest
                    </span>
                    <span className="text-lg font-bold text-blue-700">
                      {formatPercentage(loanEstimates.lenderB.interestRate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">
                      Points
                    </span>
                    <span className="text-lg font-bold text-green-700">
                      {loanEstimates.lenderB.points}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">
                      Fees
                    </span>
                    <span className="text-lg font-bold text-purple-700">
                      {formatCurrency(loanEstimates.lenderB.totalClosingCosts)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-sm font-medium text-secondary-700">
                      Monthly
                    </span>
                    <span className="text-lg font-bold text-orange-700">
                      {formatCurrency(loanEstimates.lenderB.monthlyPayment)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-secondary-500">
                  <p>Upload Bank B PDF to see details</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - AI Recommendations */}
        <div className="w-full lg:w-96 bg-secondary-50 border-l border-secondary-200 overflow-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
              <TrendingUp className="text-primary-600" size={20} />
              <span>AI Recommendations</span>
            </h3>

            {!canCompare ? (
              <div className="text-center py-8">
                <AlertTriangle
                  className="text-secondary-400 mx-auto mb-4"
                  size={48}
                />
                <p className="text-secondary-600">
                  Upload both PDFs to get AI recommendations
                </p>
              </div>
            ) : comparisonResult ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold text-green-800">
                      {comparisonResult.recommendation === "lenderA"
                        ? "Bank A"
                        : "Bank B"}{" "}
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    {comparisonResult.reasoning}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-700">
                      {formatCurrency(comparisonResult.savings.monthly)}
                    </div>
                    <div className="text-xs text-blue-600">Monthly Savings</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-700">
                      {formatCurrency(comparisonResult.savings.total)}
                    </div>
                    <div className="text-xs text-green-600">Total Savings</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp
                  className="text-secondary-400 mx-auto mb-4"
                  size={48}
                />
                <p className="text-secondary-600">
                  Click "Generate AI Analysis" to compare
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactComparisonView;
