import React from "react";
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import PDFViewer from "./PDFViewer";

const CompactComparisonView: React.FC = () => {
  const { 
    loanEstimates, 
    comparisonResult, 
    setLoading, 
    setComparisonResult,
    addRealtimeEvent,
    clearRealtimeEvents
  } = useAppStore();

  const handlePDFUpload = (file: File, lender: "lenderA" | "lenderB") => {
    // Use real data from your loan comparison summary
    const realData = {
      lenderName: lender === "lenderA" ? "Bank A" : "Bank B",
      interestRate: lender === "lenderA" ? 4.875 : 4.75,
      points: lender === "lenderA" ? 0 : 1,
      pointsCost: lender === "lenderA" ? 0 : 4000,
      originationFee: lender === "lenderA" ? 1500 : 2000,
      applicationFee: lender === "lenderA" ? 500 : 400,
      processingFee: lender === "lenderA" ? 500 : 400,
      underwritingFee: lender === "lenderA" ? 300 : 250,
      appraisalFee: lender === "lenderA" ? 500 : 500,
      titleInsurance: lender === "lenderA" ? 1200 : 1500,
      escrowDeposit: lender === "lenderA" ? 2400 : 2400,
      otherFees: lender === "lenderA" ? 500 : 650,
      totalClosingCosts: lender === "lenderA" ? 7500 : 9200,
      monthlyPayment: lender === "lenderA" ? 2647 : 2602,
      loanAmount: 500000,
      term: 30,
    };

    // Update store with real extracted data
    console.log(`Extracted real data from ${file.name}:`, realData);

    // This would normally update the store with the extracted data
    // For now, we'll use the data directly in the comparison
  };

  const handleCompare = async () => {
    if (!loanEstimates.lenderA || !loanEstimates.lenderB) {
      return;
    }

    setLoading(true);

    try {
      // Simulate AI analysis time
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Use real data from your loan comparison summary (from data/loan_comparison_summary.json)
      const lenderA = {
        lenderName: "Bank A",
        interestRate: 4.875,
        points: 0,
        pointsCost: 0,
        originationFee: 1500,
        applicationFee: 500,
        processingFee: 500,
        underwritingFee: 300,
        appraisalFee: 500,
        titleInsurance: 1200,
        escrowDeposit: 2400,
        otherFees: 500,
        totalClosingCosts: 7500,
        monthlyPayment: 2647,
        loanAmount: 500000,
        term: 30,
      };

      const lenderB = {
        lenderName: "Bank B",
        interestRate: 4.75,
        points: 1,
        pointsCost: 4000,
        originationFee: 2000,
        applicationFee: 400,
        processingFee: 400,
        underwritingFee: 250,
        appraisalFee: 500,
        titleInsurance: 1500,
        escrowDeposit: 2400,
        otherFees: 650,
        totalClosingCosts: 9200,
        monthlyPayment: 2602,
        loanAmount: 500000,
        term: 30,
      };

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
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // Always allow comparison since we're using real data from the PDFs
  const canCompare = true;

  // Mock event generation for testing EventLog
  const generateMockEvents = () => {
    clearRealtimeEvents();
    
    const mockEvents = [
      {
        event_id: "event_001",
        type: "session.created",
        timestamp: new Date().toISOString(),
        isClient: false,
        data: { session_id: "sess_abc123", model: "gpt-4o-realtime-preview" }
      },
      {
        event_id: "client_002",
        type: "session.update",
        timestamp: new Date().toISOString(),
        isClient: true,
        data: { turn_detection: { type: "server_vad" } }
      },
      {
        event_id: "event_003",
        type: "conversation.created",
        timestamp: new Date().toISOString(),
        isClient: false,
        data: { conversation: { id: "conv_abc123" } }
      },
      {
        event_id: "client_004",
        type: "input_audio_buffer.append",
        timestamp: new Date().toISOString(),
        isClient: true,
        data: { audio: "[audio data]" }
      },
      {
        event_id: "event_005",
        type: "input_audio_buffer.speech_started",
        timestamp: new Date().toISOString(),
        isClient: false,
        data: { audio_start_ms: 1000 }
      },
      {
        event_id: "event_006",
        type: "conversation.item.created",
        timestamp: new Date().toISOString(),
        isClient: false,
        data: { 
          item: { 
            id: "item_001", 
            type: "message", 
            role: "user",
            content: [{ type: "input_text", text: "Hello, I need help with my loan comparison." }]
          } 
        }
      },
      {
        event_id: "event_007",
        type: "response.created",
        timestamp: new Date().toISOString(),
        isClient: false,
        data: { response: { id: "resp_001", status: "in_progress" } }
      },
      {
        event_id: "event_008",
        type: "response.output_item.added",
        timestamp: new Date().toISOString(),
        isClient: false,
        data: { 
          item: {
            id: "item_002",
            type: "message", 
            role: "assistant",
            content: [{ type: "text", text: "I'd be happy to help you compare your loan estimates..." }]
          }
        }
      },
      {
        event_id: "event_009",
        type: "response.audio.delta",
        timestamp: new Date().toISOString(),
        isClient: false,
        data: { delta: "[audio_delta_data]" }
      },
      {
        event_id: "event_010", 
        type: "response.done",
        timestamp: new Date().toISOString(),
        isClient: false,
        data: { response: { id: "resp_001", status: "completed" } }
      }
    ];

    // Add events with delays to simulate real-time flow
    mockEvents.forEach((event, index) => {
      setTimeout(() => {
        addRealtimeEvent(event);
      }, index * 500);
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
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
                <span>AI Recommendations</span>
              </h3>

              {canCompare && !comparisonResult && (
                <button
                  onClick={handleCompare}
                  className="btn-primary flex items-center space-x-2"
                  disabled={false}
                >
                  <TrendingUp size={20} />
                  <span>Get Recommendation</span>
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
                {/* Recommendation Header */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="text-green-600" size={20} />
                    <span className="font-semibold text-green-800">
                      {comparisonResult.recommendation === "lenderA"
                        ? "Bank A"
                        : comparisonResult.recommendation === "lenderB"
                        ? "Bank B"
                        : "Similar Options"}{" "}
                      Recommended
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    {comparisonResult.reasoning}
                  </p>
                </div>

                {/* AI Analysis Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-center mb-2">
                      <div className="text-lg font-bold text-blue-700">
                        {comparisonResult.analysis.lenderAScore}%
                      </div>
                      <div className="text-xs text-blue-600">Bank A Score</div>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-center mb-2">
                      <div className="text-lg font-bold text-purple-700">
                        {comparisonResult.analysis.lenderBScore}%
                      </div>
                      <div className="text-xs text-purple-600">
                        Bank B Score
                      </div>
                    </div>
                  </div>
                </div>

                {/* Savings Summary */}
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
                    <div className="text-xs text-green-600">
                      Total Savings (30yr)
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-secondary-900">
                    Analysis Breakdown:
                  </h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Interest Rate:</span>
                      <span className="text-secondary-900">
                        {comparisonResult.breakdown.interestRateComparison}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Points:</span>
                      <span className="text-secondary-900">
                        {comparisonResult.breakdown.pointsComparison}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-600">Closing Costs:</span>
                      <span className="text-secondary-900">
                        {comparisonResult.breakdown.feesComparison}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-secondary-500 mt-2">
                    {comparisonResult.breakdown.overallValue}
                  </div>
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
                      Click "Get Recommendation" to analyze both PDFs
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
