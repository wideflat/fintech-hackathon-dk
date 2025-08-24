import React from "react";
import { Scale, TrendingUp, DollarSign, AlertCircle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import LoanEstimateForm from "./LoanEstimateForm";
import ComparisonResult from "./ComparisonResult";

const ComparisonView: React.FC = () => {
  const { loanEstimates, comparisonResult, setLoading, setComparisonResult } =
    useAppStore();

  const handleCompare = async () => {
    if (!loanEstimates.lenderA || !loanEstimates.lenderB) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API call - replace with actual backend call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock comparison result - replace with actual AI analysis
      const mockResult = {
        recommendation: "lenderA" as const,
        reasoning:
          "Lender A offers a better overall deal with lower total closing costs and competitive interest rate.",
        savings: {
          monthly: 45.67,
          total: 16441.2,
        },
        breakdown: {
          interestRateComparison:
            "Lender A has a slightly higher rate but lower fees make it more cost-effective.",
          pointsComparison: "Both lenders offer similar points structure.",
          feesComparison: "Lender A has $2,150 less in total closing costs.",
          overallValue:
            "Based on weighted analysis: Interest Rate (40%), Points (30%), Closing Costs (30%)",
        },
        analysis: {
          lenderAScore: 75,
          lenderBScore: 25,
          criteria: ["Interest Rate", "Points", "Closing Costs"],
          weights: [40, 30, 30],
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

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Scale className="text-primary-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                Loan Estimate Comparison
              </h2>
              <p className="text-sm text-secondary-600">
                Compare loan offers side by side
              </p>
            </div>
          </div>

          {canCompare && (
            <button
              onClick={handleCompare}
              className="btn-primary flex items-center space-x-2"
              disabled={!canCompare}
            >
              <TrendingUp size={20} />
              <span>Generate Analysis</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Forms Section */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-auto">
          <div className="flex-1 p-6 overflow-auto">
            <LoanEstimateForm lender="lenderA" />
          </div>
          <div className="flex-1 p-6 overflow-auto border-l border-secondary-200">
            <LoanEstimateForm lender="lenderB" />
          </div>
        </div>

        {/* Results Section */}
        <div className="w-full lg:w-96 bg-secondary-50 border-l border-secondary-200 overflow-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
              <DollarSign className="text-primary-600" size={20} />
              <span>AI Analysis</span>
            </h3>

            {!canCompare ? (
              <div className="text-center py-8">
                <AlertCircle
                  className="text-secondary-400 mx-auto mb-4"
                  size={48}
                />
                <p className="text-secondary-600">
                  Please complete both loan estimates to generate a comparison
                </p>
              </div>
            ) : comparisonResult ? (
              <ComparisonResult result={comparisonResult} />
            ) : (
              <div className="text-center py-8">
                <TrendingUp
                  className="text-secondary-400 mx-auto mb-4"
                  size={48}
                />
                <p className="text-secondary-600">
                  Click "Generate Analysis" to compare your loan estimates
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComparisonView;
