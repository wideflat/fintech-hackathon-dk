import React, { useState } from "react";
import {
  Mic,
  MicOff,
  MessageSquare,
  Lightbulb,
  Play,
  Square,
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import TranscriptionPanel from "./TranscriptionPanel";
import NegotiationSuggestions from "./NegotiationSuggestions";

const LiveAssistantView: React.FC = () => {
  const {
    isRecording,
    setRecording,
    transcriptionMessages,
    addTranscriptionMessage,
    addNegotiationSuggestion,
    clearTranscriptionMessages,
    clearNegotiationSuggestions,
  } = useAppStore();

  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartRecording = () => {
    setRecording(true);
    clearTranscriptionMessages();
    clearNegotiationSuggestions();

    // Simulate real-time transcription
    const mockTranscriptions = [
      {
        text: "Hello, this is John from ABC Mortgage. How can I help you today?",
        speaker: "officer" as const,
        confidence: 0.95,
      },
      {
        text: "Hi John, I'm calling about the loan estimate you sent me.",
        speaker: "user" as const,
        confidence: 0.92,
      },
      {
        text: "Great! I see you're interested in our 30-year fixed rate offer.",
        speaker: "officer" as const,
        confidence: 0.88,
      },
    ];

    mockTranscriptions.forEach((msg, index) => {
      setTimeout(() => {
        addTranscriptionMessage(msg);
      }, index * 2000);
    });

    // Simulate negotiation suggestions
    setTimeout(() => {
      addNegotiationSuggestion({
        type: "suggestion",
        text: "Ask about waiving the application fee - many lenders are flexible on this.",
        priority: "medium",
      });
    }, 3000);

    setTimeout(() => {
      addNegotiationSuggestion({
        type: "clarification",
        text: "Request a detailed breakdown of the 'Processing Fee' - this often includes negotiable items.",
        priority: "high",
      });
    }, 6000);
  };

  const handleStopRecording = () => {
    setRecording(false);
  };

  const handleStartPlayback = () => {
    setIsPlaying(true);
    // Simulate playback functionality
  };

  const handleStopPlayback = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mic className="text-primary-600" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                Live Negotiation Assistant
              </h2>
              <p className="text-sm text-secondary-600">
                Real-time help during your loan officer calls
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Recording Controls */}
            <div className="flex items-center space-x-2">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Mic size={20} />
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <MicOff size={20} />
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            {/* Playback Controls */}
            <div className="flex items-center space-x-2">
              {!isPlaying ? (
                <button
                  onClick={handleStartPlayback}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={transcriptionMessages.length === 0}
                >
                  <Play size={20} />
                  <span>Playback</span>
                </button>
              ) : (
                <button
                  onClick={handleStopPlayback}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <Square size={20} />
                  <span>Stop</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Panel - Recording Status & Metrics */}
        <div className="w-full lg:w-80 bg-white border-r border-secondary-200 overflow-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
              <MessageSquare className="text-primary-600" size={20} />
              <span>Call Status</span>
            </h3>

            {/* Recording Status */}
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-secondary-900">
                  Recording Status
                </h4>
                <div
                  className={`w-3 h-3 rounded-full ${
                    isRecording
                      ? "bg-red-500 animate-pulse"
                      : "bg-secondary-300"
                  }`}
                ></div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Status:</span>
                  <span
                    className={
                      isRecording
                        ? "text-red-600 font-medium"
                        : "text-secondary-600"
                    }
                  >
                    {isRecording ? "Recording" : "Not Recording"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Duration:</span>
                  <span className="text-secondary-900">
                    {isRecording ? "00:02:34" : "00:00:00"}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-secondary-600">Messages:</span>
                  <span className="text-secondary-900">
                    {transcriptionMessages.length}
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
                  <div className="text-2xl font-bold text-blue-700">3</div>
                  <div className="text-sm text-blue-600">
                    Negotiation Opportunities
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">85%</div>
                  <div className="text-sm text-green-600">Confidence Score</div>
                </div>

                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">2</div>
                  <div className="text-sm text-yellow-600">
                    Clarifications Needed
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Transcription */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <TranscriptionPanel />
        </div>

        {/* Right Panel - Negotiation Suggestions */}
        <div className="w-full lg:w-96 bg-secondary-50 border-l border-secondary-200 overflow-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center space-x-2">
              <Lightbulb className="text-primary-600" size={20} />
              <span>AI Suggestions</span>
            </h3>

            <NegotiationSuggestions />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveAssistantView;
