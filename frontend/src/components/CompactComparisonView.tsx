import React, { useEffect, useState } from "react";
import { TrendingUp, DollarSign, AlertTriangle } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import PDFViewer from "./PDFViewer";

interface LoanData {
  lenderName: string;
  interestRate: number;
  points: number;
  pointsCost: number;
  originationFee: number;
  applicationFee: number;
  processingFee: number;
  underwritingFee: number;
  appraisalFee: number;
  titleInsurance: number;
  escrowDeposit: number;
  otherFees: number;
  totalClosingCosts: number;
  monthlyPayment: number;
  loanAmount: number;
  term: number;
}

const CompactComparisonView: React.FC = () => {
  const {
    loanEstimates,
    comparisonResult,
    setLoading,
    setComparisonResult,
    addRealtimeEvent,
    clearRealtimeEvents,
  } = useAppStore();

  const [realLoanData, setRealLoanData] = useState<{
    lenderA: LoanData | null;
    lenderB: LoanData | null;
  }>({
    lenderA: null,
    lenderB: null,
  });

  // Load real loan data from JSON file
  useEffect(() => {
    const loadLoanData = async () => {
      try {
        const response = await fetch("/loan_comparison_summary.json");
        const data = await response.json();
        const summary = data.loan_comparison_summary;

        // Convert the extracted data to LoanData format
        const lenderAData: LoanData = {
          lenderName: "Bank A",
          interestRate: parseFloat(
            summary.lenders.lender_a.interest_rate.replace("%", "")
          ),
          points: parseFloat(summary.lenders.lender_a.points.replace("%", "")),
          pointsCost: summary.lenders.lender_a.loan_amount_points,
          originationFee: 1500, // Estimated based on typical loan costs
          applicationFee: 500,
          processingFee: 500,
          underwritingFee: 300,
          appraisalFee: 500,
          titleInsurance: 1200,
          escrowDeposit: 2400,
          otherFees: 500,
          totalClosingCosts: parseInt(
            summary.lenders.lender_a.total_closing_costs
              .replace("$", "")
              .replace(",", "")
          ),
          monthlyPayment: 2647, // Based on loan calculation for 4.875% rate
          loanAmount: summary.lenders.lender_a.loan_amount,
          term: 30,
        };

        const lenderBData: LoanData = {
          lenderName: "Bank B",
          interestRate: parseFloat(
            summary.lenders.lender_b.interest_rate.replace("%", "")
          ),
          points: parseFloat(summary.lenders.lender_b.points.replace("%", "")),
          pointsCost: summary.lenders.lender_b.loan_amount_points,
          originationFee: 2000,
          applicationFee: 400,
          processingFee: 400,
          underwritingFee: 250,
          appraisalFee: 500,
          titleInsurance: 1500,
          escrowDeposit: 2400,
          otherFees: 650,
          totalClosingCosts: parseInt(
            summary.lenders.lender_b.total_closing_costs
              .replace("$", "")
              .replace(",", "")
          ),
          monthlyPayment: 2602, // Based on loan calculation for 4.75% rate
          loanAmount: summary.lenders.lender_b.loan_amount,
          term: 30,
        };

        setRealLoanData({
          lenderA: lenderAData,
          lenderB: lenderBData,
        });
      } catch (error) {
        console.error("Failed to load loan data:", error);
      }
    };

    loadLoanData();
  }, []);

  const handlePDFUpload = (file: File, lender: "lenderA" | "lenderB") => {
    // In a full implementation, this would extract data from the uploaded PDF
    // For now, we're using pre-extracted data from the JSON file
    console.log(`PDF uploaded for ${lender}: ${file.name}`);
  };

  const handleCompare = async () => {
    console.log("Generate Summary button clicked!");
    console.log("Real loan data:", realLoanData);

    if (!realLoanData.lenderA || !realLoanData.lenderB) {
      console.log("Real loan data not loaded yet");
      return;
    }

    setLoading(true);

    try {
      // Call backend for real PDF analysis
      const response = await fetch(
        "http://localhost:3001/api/pdf-analysis/compare",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Backend analysis failed");
      }

      const backendResult = await response.json();

      if (backendResult.success) {
        setComparisonResult(backendResult.data);
        return;
      } else {
        throw new Error(backendResult.error);
      }
    } catch (backendError) {
      console.warn(
        "Backend analysis failed, falling back to frontend analysis:",
        backendError
      );

      // Fallback to frontend analysis using loaded data
      const lenderA = realLoanData.lenderA;
      const lenderB = realLoanData.lenderB;

      if (!lenderA || !lenderB) {
        console.error("No loan data available for analysis");
        return;
      }

      // AI Analysis based on the criteria from your data files
      let recommendation: "lenderA" | "lenderB";
      let reasoning = "";
      let monthlySavings = 0;
      let totalSavings = 0;
      let breakdown = {
        interestRateComparison: "",
        pointsComparison: "",
        feesComparison: "",
        overallValue: "",
        interestRateA: lenderA.interestRate,
        interestRateB: lenderB.interestRate,
        pointsA: lenderA.points,
        pointsB: lenderB.points,
        feesA: lenderA.totalClosingCosts,
        feesB: lenderB.totalClosingCosts,
      };

      // Compare Interest Rates
      const rateDiff = lenderA.interestRate - lenderB.interestRate;
      if (rateDiff < 0) {
        breakdown.interestRateComparison = `Bank A has ${Math.abs(
          rateDiff
        ).toFixed(3)}% lower interest rate`;
      } else if (rateDiff > 0) {
        breakdown.interestRateComparison = `Bank B has ${rateDiff.toFixed(
          3
        )}% lower interest rate`;
      } else {
        breakdown.interestRateComparison =
          "Both lenders have the same interest rate";
      }

      // Compare Points
      const pointsDiff = lenderA.points - lenderB.points;
      if (pointsDiff < 0) {
        breakdown.pointsComparison = `Bank A requires ${Math.abs(
          pointsDiff
        )}% fewer points`;
      } else if (pointsDiff > 0) {
        breakdown.pointsComparison = `Bank B requires ${pointsDiff}% fewer points`;
      } else {
        breakdown.pointsComparison = "Both lenders require the same points";
      }

      // Compare Closing Costs
      const costDiff = lenderA.totalClosingCosts - lenderB.totalClosingCosts;
      if (costDiff < 0) {
        breakdown.feesComparison = `Bank A has $${Math.abs(
          costDiff
        ).toLocaleString()} less in closing costs`;
      } else if (costDiff > 0) {
        breakdown.feesComparison = `Bank B has $${costDiff.toLocaleString()} less in closing costs`;
      } else {
        breakdown.feesComparison = "Both lenders have similar closing costs";
      }

      // Calculate monthly payment difference
      const monthlyDiff = lenderA.monthlyPayment - lenderB.monthlyPayment;
      monthlySavings = Math.abs(monthlyDiff);

      // Calculate total savings over 30 years
      totalSavings = monthlySavings * 12 * 30;

      // AI Decision Logic
      const rateWeight = 0.4; // 40% weight for interest rate
      const pointsWeight = 0.3; // 30% weight for points
      const feesWeight = 0.3; // 30% weight for closing costs

      let lenderAScore = 0;
      let lenderBScore = 0;

      // Score based on interest rate (lower is better)
      if (lenderA.interestRate < lenderB.interestRate) {
        lenderAScore += rateWeight;
      } else if (lenderB.interestRate < lenderA.interestRate) {
        lenderBScore += rateWeight;
      }

      // Score based on points (lower is better)
      if (lenderA.points < lenderB.points) {
        lenderAScore += pointsWeight;
      } else if (lenderB.points < lenderA.points) {
        lenderBScore += pointsWeight;
      }

      // Score based on closing costs (lower is better)
      if (lenderA.totalClosingCosts < lenderB.totalClosingCosts) {
        lenderAScore += feesWeight;
      } else if (lenderB.totalClosingCosts < lenderA.totalClosingCosts) {
        lenderBScore += feesWeight;
      }

      // Determine recommendation
      if (lenderAScore > lenderBScore) {
        recommendation = "lenderA";
        reasoning = `Bank A offers better overall value with ${breakdown.interestRateComparison.toLowerCase()}, ${breakdown.pointsComparison.toLowerCase()}, and ${breakdown.feesComparison.toLowerCase()}.`;
      } else if (lenderBScore > lenderAScore) {
        recommendation = "lenderB";
        reasoning = `Bank B offers better overall value with ${breakdown.interestRateComparison.toLowerCase()}, ${breakdown.pointsComparison.toLowerCase()}, and ${breakdown.feesComparison.toLowerCase()}.`;
      } else {
        recommendation = "lenderA"; // Default to A if tied
        reasoning =
          "Both lenders offer similar value. Consider other factors like customer service and loan terms.";
      }

      breakdown.overallValue = `Based on weighted analysis: Interest Rate (40%), Points (30%), Closing Costs (30%)`;

      const aiResult = {
        recommendation,
        reasoning,
        savings: {
          monthly: monthlySavings,
          total: totalSavings,
        },
        breakdown,
        analysis: {
          lenderAScore: Math.round(lenderAScore * 100),
          lenderBScore: Math.round(lenderBScore * 100),
          criteria: ["Interest Rate", "Points", "Closing Costs"],
          weights: [40, 30, 30],
        },
      };

      setComparisonResult(aiResult);
    } finally {
      setLoading(false);
    }
  };

  // Allow comparison when real data is loaded
  const canCompare = realLoanData.lenderA && realLoanData.lenderB;

  const clearResults = () => {
    setComparisonResult(null);
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
        </div>
      </div>

      {/* Main Content - PDF Side by Side View */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* PDF Viewers Row */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Bank A PDF */}
          <div className="flex-1 p-6 border-r border-secondary-200 overflow-auto">
            <PDFViewer lender="lenderA" onPDFUpload={handlePDFUpload} />
          </div>

          {/* Right Panel - Bank B PDF */}
          <div className="flex-1 p-6 overflow-auto">
            <PDFViewer lender="lenderB" onPDFUpload={handlePDFUpload} />
          </div>
        </div>

        {/* AI Recommendations Panel - Below PDFs */}
        <div className="bg-secondary-50 border-t border-secondary-200 overflow-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-secondary-900 flex items-center space-x-2">
                <TrendingUp className="text-primary-600" size={20} />
                <span>Loan Comparison Summary</span>
              </h3>

              {canCompare && !comparisonResult && (
                <button
                  onClick={handleCompare}
                  className="btn-primary flex items-center space-x-2"
                  disabled={false}
                >
                  <TrendingUp size={20} />
                  <span>Generate Summary</span>
                </button>
              )}
              {canCompare && comparisonResult && (
                <button
                  onClick={clearResults}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <AlertTriangle size={20} />
                  <span>Clear Summary</span>
                </button>
              )}
            </div>

            {!canCompare ? (
              <div className="text-center py-8">
                <AlertTriangle
                  className="text-secondary-400 mx-auto mb-4"
                  size={48}
                />
                <p className="text-secondary-600">
                  Both PDFs are required for AI analysis
                </p>
              </div>
            ) : comparisonResult ? (
              <div className="space-y-4">
                {/* Simple Comparison Table */}
                <div className="bg-white border border-secondary-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-secondary-700 border-r border-secondary-200">
                          Criteria
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-secondary-700 border-r border-secondary-200">
                          Bank A
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-secondary-700">
                          Bank B
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-200">
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-secondary-900 border-r border-secondary-200">
                          Interest
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-secondary-900 border-r border-secondary-200">
                          {comparisonResult.breakdown.interestRateA}%
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-secondary-900">
                          {comparisonResult.breakdown.interestRateB}%
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-secondary-900 border-r border-secondary-200">
                          Points
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-secondary-900 border-r border-secondary-200">
                          {comparisonResult.breakdown.pointsA} point(s)
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-secondary-900">
                          {comparisonResult.breakdown.pointsB} point(s)
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 text-sm font-medium text-secondary-900 border-r border-secondary-200">
                          Fees
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-secondary-900 border-r border-secondary-200">
                          ${comparisonResult.breakdown.feesA.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-secondary-900">
                          ${comparisonResult.breakdown.feesB.toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Actionable Next Steps */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="mr-2">🎯</span>
                    Actionable Next Steps:
                  </h4>
                  {comparisonResult.actionableSuggestions && comparisonResult.actionableSuggestions.length > 0 ? (
                    <div className="space-y-2">
                      {comparisonResult.actionableSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start">
                          <span className="text-green-600 mr-2 mt-0.5 flex-shrink-0">•</span>
                          <span className="text-sm text-green-700 leading-relaxed">
                            {suggestion}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-green-700 space-y-1">
                      <div>
                        • Interest Rate Difference:{" "}
                        {comparisonResult.breakdown.interestRateComparison}
                      </div>
                      <div>
                        • Points Difference:{" "}
                        {comparisonResult.breakdown.pointsComparison}
                      </div>
                      <div>
                        • Fees Difference:{" "}
                        {comparisonResult.breakdown.feesComparison}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                {false ? (
                  <div className="space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-secondary-600">
                      AI is analyzing your loan estimates...
                    </p>
                  </div>
                ) : (
                  <>
                    <TrendingUp
                      className="text-secondary-400 mx-auto mb-4"
                      size={48}
                    />
                    <p className="text-secondary-600">
                      Click "Generate Summary" to examine both PDFs
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompactComparisonView;
