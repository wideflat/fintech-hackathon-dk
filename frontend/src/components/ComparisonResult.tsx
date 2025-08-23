import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Info,
} from "lucide-react";
import { ComparisonResult as ComparisonResultType } from "../types";

interface ComparisonResultProps {
  result: ComparisonResultType;
}

const ComparisonResult: React.FC<ComparisonResultProps> = ({ result }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const getRecommendationIcon = () => {
    switch (result.recommendation) {
      case "lenderA":
        return <CheckCircle className="text-green-600" size={24} />;
      case "lenderB":
        return <CheckCircle className="text-green-600" size={24} />;
      case "similar":
        return <AlertTriangle className="text-yellow-600" size={24} />;
      default:
        return <Info className="text-blue-600" size={24} />;
    }
  };

  const getRecommendationText = () => {
    switch (result.recommendation) {
      case "lenderA":
        return "Lender A is recommended";
      case "lenderB":
        return "Lender B is recommended";
      case "similar":
        return "Both offers are similar";
      default:
        return "Analysis complete";
    }
  };

  const getRecommendationColor = () => {
    switch (result.recommendation) {
      case "lenderA":
      case "lenderB":
        return "text-green-700 bg-green-50 border-green-200";
      case "similar":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      default:
        return "text-blue-700 bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Recommendation Header */}
      <div className={`p-4 rounded-lg border ${getRecommendationColor()}`}>
        <div className="flex items-center space-x-3">
          {getRecommendationIcon()}
          <div>
            <h4 className="font-semibold">{getRecommendationText()}</h4>
            <p className="text-sm opacity-80 mt-1">{result.reasoning}</p>
          </div>
        </div>
      </div>

      {/* Savings Summary */}
      <div className="card">
        <h4 className="font-semibold text-secondary-900 mb-3 flex items-center space-x-2">
          <TrendingUp className="text-primary-600" size={20} />
          <span>Potential Savings</span>
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">
              {formatCurrency(result.savings.monthly)}
            </div>
            <div className="text-sm text-green-600">Monthly Savings</div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">
              {formatCurrency(result.savings.total)}
            </div>
            <div className="text-sm text-blue-600">Total Savings</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="card">
        <h4 className="font-semibold text-secondary-900 mb-3 flex items-center space-x-2">
          <DollarSign className="text-primary-600" size={20} />
          <span>Detailed Analysis</span>
        </h4>

        <div className="space-y-4">
          <div className="p-3 bg-secondary-50 rounded-lg">
            <h5 className="font-medium text-secondary-800 mb-1">
              Interest Rate Comparison
            </h5>
            <p className="text-sm text-secondary-600">
              {result.breakdown.interestRateComparison}
            </p>
          </div>

          <div className="p-3 bg-secondary-50 rounded-lg">
            <h5 className="font-medium text-secondary-800 mb-1">
              Points Analysis
            </h5>
            <p className="text-sm text-secondary-600">
              {result.breakdown.pointsComparison}
            </p>
          </div>

          <div className="p-3 bg-secondary-50 rounded-lg">
            <h5 className="font-medium text-secondary-800 mb-1">
              Fees Comparison
            </h5>
            <p className="text-sm text-secondary-600">
              {result.breakdown.feesComparison}
            </p>
          </div>
        </div>
      </div>

      {/* Action Items */}
      <div className="card bg-primary-50 border-primary-200">
        <h4 className="font-semibold text-primary-900 mb-3">Next Steps</h4>
        <ul className="space-y-2 text-sm text-primary-800">
          <li className="flex items-start space-x-2">
            <CheckCircle className="text-primary-600 mt-0.5" size={16} />
            <span>Review the detailed breakdown above</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="text-primary-600 mt-0.5" size={16} />
            <span>Contact the recommended lender to proceed</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle className="text-primary-600 mt-0.5" size={16} />
            <span>Use the chat feature to ask follow-up questions</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ComparisonResult;
