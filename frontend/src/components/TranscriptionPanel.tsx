import React, { useRef, useEffect } from "react";
import { User, Phone, Clock } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const TranscriptionPanel: React.FC = () => {
  const { transcriptionMessages, isRecording } = useAppStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [transcriptionMessages]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getSpeakerIcon = (speaker: "user" | "officer") => {
    return speaker === "user" ? (
      <User className="text-primary-600" size={20} />
    ) : (
      <Phone className="text-secondary-600" size={20} />
    );
  };

  const getSpeakerName = (speaker: "user" | "officer") => {
    return speaker === "user" ? "You" : "Loan Officer";
  };

  const getMessageStyle = (speaker: "user" | "officer") => {
    return speaker === "user"
      ? "bg-primary-50 border-primary-200 ml-8"
      : "bg-secondary-50 border-secondary-200 mr-8";
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">
            Live Transcription
          </h3>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isRecording ? "bg-red-500 animate-pulse" : "bg-secondary-300"
              }`}
            ></div>
            <span className="text-sm text-secondary-600">
              {isRecording ? "Live" : "Paused"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        {transcriptionMessages.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="text-secondary-400 mx-auto mb-4" size={48} />
            <h4 className="text-lg font-medium text-secondary-900 mb-2">
              No transcription yet
            </h4>
            <p className="text-secondary-600">
              Start recording to see the live transcription of your conversation
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transcriptionMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${getMessageStyle(
                  message.speaker
                )}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSpeakerIcon(message.speaker)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-secondary-900">
                        {getSpeakerName(message.speaker)}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-secondary-500">
                        <Clock size={12} />
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-secondary-800 leading-relaxed">
                      {message.text}
                    </p>

                    {message.confidence && (
                      <div className="mt-2 flex items-center space-x-2">
                        <div className="flex-1 bg-secondary-200 rounded-full h-1">
                          <div
                            className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                            style={{ width: `${message.confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-secondary-500">
                          {Math.round(message.confidence)}% confidence
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />

            {/* Live indicator */}
            {isRecording && (
              <div className="text-center py-4">
                <div className="inline-flex items-center space-x-2 text-sm text-secondary-600">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>Listening...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-secondary-200 bg-secondary-50">
        <div className="flex items-center justify-between text-sm text-secondary-600">
          <span>
            {transcriptionMessages.length} message
            {transcriptionMessages.length !== 1 ? "s" : ""}
          </span>
          <span>
            {isRecording ? "Live transcription active" : "Transcription paused"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TranscriptionPanel;
