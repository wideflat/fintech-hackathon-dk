import React from "react";
import {
  Lightbulb,
  AlertTriangle,
  HelpCircle,
  TrendingUp,
  Clock,
  RefreshCw,
  Activity,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { analysisService } from "../services/analysisService";

const NegotiationSuggestions: React.FC = () => {
  const { negotiationSuggestions, claudeAnalysis } = useAppStore();

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case "suggestion":
        return <Lightbulb className="text-blue-600" size={20} />;
      case "clarification":
        return <HelpCircle className="text-yellow-600" size={20} />;
      case "warning":
        return <AlertTriangle className="text-red-600" size={20} />;
      case "opportunity":
        return <TrendingUp className="text-green-600" size={20} />;
      default:
        return <Lightbulb className="text-blue-600" size={20} />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case "suggestion":
        return "border-blue-200 bg-blue-50";
      case "clarification":
        return "border-yellow-200 bg-yellow-50";
      case "warning":
        return "border-red-200 bg-red-50";
      case "opportunity":
        return "border-green-200 bg-green-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-secondary-100 text-secondary-800";
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleForceAnalysis = () => {
    analysisService.forceAnalysis();
  };

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

  if (negotiationSuggestions.length === 0 && !claudeAnalysis.isAnalyzing) {
    return (
      <div className="space-y-4">
        {/* Negotiation Potential Score */}
        <div className="p-4 bg-white rounded-lg border border-secondary-200">
          <div className="flex justify-between items-center mb-3">
            <span className="font-medium text-secondary-900">Negotiation Potential</span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPotentialColor(claudeAnalysis.negotiationPotential)}`}>
              {claudeAnalysis.negotiationPotential || 'Not analyzed'}
            </span>
          </div>
          
          {/* Force Analysis Button */}
          <button
            onClick={handleForceAnalysis}
            disabled={claudeAnalysis.isAnalyzing}
            className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <RefreshCw size={16} className={claudeAnalysis.isAnalyzing ? 'animate-spin' : ''} />
            <span>{claudeAnalysis.isAnalyzing ? 'Analyzing...' : 'Analyze Now'}</span>
          </button>
        </div>

        <div className="text-center py-8">
          <Lightbulb className="text-secondary-400 mx-auto mb-4" size={48} />
          <h4 className="text-lg font-medium text-secondary-900 mb-2">
            No suggestions yet
          </h4>
          <p className="text-secondary-600">
            Start a conversation to receive real-time negotiation insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Negotiation Potential Score */}
      <div className="p-4 bg-white rounded-lg border border-secondary-200">
        <div className="flex justify-between items-center mb-3">
          <span className="font-medium text-secondary-900">Negotiation Potential</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPotentialColor(claudeAnalysis.negotiationPotential)}`}>
            {claudeAnalysis.negotiationPotential || 'Not analyzed'}
          </span>
        </div>
        
        {claudeAnalysis.lastUpdated && (
          <div className="text-xs text-secondary-500 mb-2">
            Last analyzed: {claudeAnalysis.lastUpdated.toLocaleTimeString()}
          </div>
        )}
        
        {/* Force Analysis Button */}
        <button
          onClick={handleForceAnalysis}
          disabled={claudeAnalysis.isAnalyzing}
          className="w-full mt-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <RefreshCw size={16} className={claudeAnalysis.isAnalyzing ? 'animate-spin' : ''} />
          <span>{claudeAnalysis.isAnalyzing ? 'Analyzing...' : 'Analyze Now'}</span>
        </button>
      </div>

      {/* Loading State */}
      {claudeAnalysis.isAnalyzing && (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Activity size={16} className="animate-pulse text-blue-600" />
            <span className="text-blue-800 font-medium">Analyzing conversation for negotiation opportunities...</span>
          </div>
        </div>
      )}

      {negotiationSuggestions.map((suggestion) => (
        <div
          key={suggestion.id}
          className={`p-4 rounded-lg border ${getSuggestionColor(
            suggestion.type
          )}`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getSuggestionIcon(suggestion.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-secondary-900 capitalize">
                    {suggestion.type}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      suggestion.priority
                    )}`}
                  >
                    {suggestion.priority} priority
                  </span>
                </div>

                <div className="flex items-center space-x-1 text-xs text-secondary-500">
                  <Clock size={12} />
                  <span>{formatTime(suggestion.timestamp)}</span>
                </div>
              </div>

              <p className="text-secondary-800 leading-relaxed">
                {suggestion.text}
              </p>
            </div>
          </div>
        </div>
      ))}

      {/* Next Steps */}
      {claudeAnalysis.nextSteps && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-900 mb-2 flex items-center space-x-2">
            <TrendingUp size={16} />
            <span>Recommended Next Step</span>
          </h4>
          <p className="text-green-800">{claudeAnalysis.nextSteps}</p>
        </div>
      )}

      {/* Quick Actions - Dynamic based on opportunities */}
      {claudeAnalysis.opportunities.length > 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-secondary-200">
          <h4 className="font-medium text-secondary-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            {claudeAnalysis.opportunities.slice(0, 4).map((opp, idx) => (
              <button 
                key={idx} 
                className="w-full text-left p-2 rounded hover:bg-secondary-50 text-sm text-secondary-700"
                onClick={() => console.log(`Action: Ask about ${opp.area}`)}
              >
                • Ask about {opp.area.toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Default Quick Actions if no analysis */}
      {claudeAnalysis.opportunities.length === 0 && (
        <div className="mt-6 p-4 bg-white rounded-lg border border-secondary-200">
          <h4 className="font-medium text-secondary-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button className="w-full text-left p-2 rounded hover:bg-secondary-50 text-sm text-secondary-700">
              • Ask about fee waivers
            </button>
            <button className="w-full text-left p-2 rounded hover:bg-secondary-50 text-sm text-secondary-700">
              • Request rate matching
            </button>
            <button className="w-full text-left p-2 rounded hover:bg-secondary-50 text-sm text-secondary-700">
              • Negotiate closing costs
            </button>
            <button className="w-full text-left p-2 rounded hover:bg-secondary-50 text-sm text-secondary-700">
              • Ask for better terms
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NegotiationSuggestions;
