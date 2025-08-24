import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  MessageSquare,
  Lightbulb,
  Play,
  Square,
  Activity,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import SessionControls from "./SessionControls";
import NegotiationSuggestions from "./NegotiationSuggestions";
import { analysisService } from "../services/analysisService";

const LiveAssistantView: React.FC = () => {
  const {
    realtimeEvents,
    sessionState,
    currentLender,
    addNegotiationSuggestion,
    clearAnalysis,
  } = useAppStore();

  // Connection status based on actual session state
  const isConnected = sessionState === 'connected';

  // Initialize analysis service on component mount
  useEffect(() => {
    analysisService.connect();
    
    return () => {
      analysisService.disconnect();
    };
  }, []);

  // Clear analysis when session state changes
  useEffect(() => {
    if (sessionState === 'idle' || sessionState === 'error') {
      clearAnalysis();
    }
  }, [sessionState, clearAnalysis]);

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="text-primary-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                Live Negotiation Assistant
              </h2>
              <p className="text-sm text-secondary-600">
                Real-time help during your loan officer calls
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Loan Terms Panel - Show when a lender is selected */}
      {currentLender && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-blue-900">
                {currentLender === 'lenderA' ? 'Discussing Loan Estimate from Lender A:' : 'Discussing Loan Estimate from Lender B:'}
              </div>
              <div className="text-xs text-blue-700 mt-1">
                {currentLender === 'lenderA' 
                  ? '$500,000 @ 4.875% with no points - First National Bank'
                  : '$500,000 @ 4.750% with 1% points ($4,000) - Premier Lending'
                }
              </div>
            </div>
            <div className="text-xs text-blue-600">
              {currentLender === 'lenderA' ? 'Sarah' : 'Mike'} is following up on yesterday's estimate
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Session Status & Metrics */}
        <div className="w-80 bg-white border-r border-secondary-200 overflow-auto shrink-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="text-primary-600" size={20} />
              <span>Session Status</span>
            </h3>

            {/* Session Status */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-secondary-900">
                  Connection Status
                </h4>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected
                      ? "bg-green-500 animate-pulse"
                      : "bg-secondary-300"
                  }`}
                ></div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Status:</span>
                  <span
                    className={
                      isConnected
                        ? "text-green-600 font-medium"
                        : "text-secondary-600"
                    }
                  >
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">State:</span>
                  <span className="text-secondary-900 capitalize">
                    {sessionState}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Events:</span>
                  <span className="text-secondary-900">
                    {realtimeEvents.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="card">
              <h4 className="font-medium text-secondary-900 mb-4">
                Key Metrics
              </h4>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-700">
                    {realtimeEvents.filter(e => e.type.includes('conversation')).length}
                  </div>
                  <div className="text-sm text-blue-600">
                    Conversation Events
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {realtimeEvents.filter(e => e.type.includes('response')).length}
                  </div>
                  <div className="text-sm text-green-600">Response Events</div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">
                    {realtimeEvents.filter(e => e.type.includes('error')).length}
                  </div>
                  <div className="text-sm text-yellow-600">
                    Error Events
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Panel - Negotiation Suggestions */}
        <div className="flex-1 bg-secondary-50 overflow-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
              <Lightbulb className="text-primary-600" size={20} />
              <span>AI Suggestions</span>
            </h3>

            <NegotiationSuggestions />
          </div>
        </div>
      </div>

      {/* Session Controls */}
      <div className="h-20 border-t border-secondary-200">
        <SessionControls />
      </div>
    </div>
  );
};

export default LiveAssistantView;
