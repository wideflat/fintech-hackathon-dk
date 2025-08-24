import React from "react";
import {
  Lightbulb,
  Activity,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const NegotiationSuggestions: React.FC = () => {
  const { claudeAnalysis } = useAppStore();


  const getPotentialColor = (potential: string | null) => {
    switch (potential) {
      case "High":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show empty state if no recommendation and not analyzing
  if (!claudeAnalysis.mainRecommendation && !claudeAnalysis.isAnalyzing) {
    return (
      <div className="space-y-4">
        {/* Negotiation Potential Score */}
        <div className="p-4 bg-white rounded-lg border border-secondary-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-secondary-900">Negotiation Potential</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPotentialColor(claudeAnalysis.negotiationPotential)}`}>
              {claudeAnalysis.negotiationPotential || 'Not analyzed'}
            </span>
          </div>
        </div>

        <div className="text-center py-8">
          <Lightbulb className="text-secondary-400 mx-auto mb-4" size={48} />
          <h4 className="text-lg font-medium text-secondary-900 mb-2">
            No response suggestions yet
          </h4>
          <p className="text-secondary-600">
            Start talking with the loan officer to get real-time response suggestions
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Negotiation Potential Score */}
      <div className="p-4 bg-white rounded-lg border border-secondary-200">
        <div className="flex justify-between items-center">
          <span className="font-medium text-secondary-900">Negotiation Potential</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPotentialColor(claudeAnalysis.negotiationPotential)}`}>
            {claudeAnalysis.negotiationPotential || 'Not analyzed'}
          </span>
        </div>
        
        {claudeAnalysis.lastUpdated && (
          <div className="text-xs text-secondary-500 mt-2">
            Last analyzed: {claudeAnalysis.lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Loading State */}
      {claudeAnalysis.isAnalyzing && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Activity size={16} className="animate-pulse text-blue-600" />
            <span className="text-blue-800 font-medium">Analyzing conversation to suggest your response...</span>
          </div>
        </div>
      )}

      {/* Your Response Suggestion */}
      {claudeAnalysis.mainRecommendation && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                💬
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">Your Response</h4>
              <div className="bg-white p-3 rounded border-l-4 border-blue-400 mb-3">
                <p className="text-gray-800 text-base leading-relaxed italic">
                  "{claudeAnalysis.mainRecommendation}"
                </p>
              </div>
              {claudeAnalysis.quickTip && (
                <div className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                  <strong>💡 Tip:</strong> {claudeAnalysis.quickTip}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationSuggestions;
