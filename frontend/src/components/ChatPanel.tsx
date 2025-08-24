import React from "react";
import { Activity, Wifi, WifiOff } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import EventLog from "./EventLog";
import SessionControls from "./SessionControls";

const ChatPanel: React.FC = () => {
  const { realtimeEvents, sessionState } = useAppStore();

  // Connection status based on actual session state
  const isConnected = sessionState === 'connected';

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Activity className="text-primary-600" size={20} />
            <h3 className="text-lg font-semibold text-secondary-900">
              Conversation with Loan Officer
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="text-green-500" size={16} />
                <span className="text-sm text-green-600 font-medium">
                  Connected
                </span>
              </>
            ) : (
              <>
                <WifiOff className="text-secondary-400" size={16} />
                <span className="text-sm text-secondary-500">
                  Disconnected
                </span>
              </>
            )}
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between">
            <div className="text-xs text-secondary-500">
              {realtimeEvents.length} events logged
            </div>
            <div className="text-xs text-secondary-500 capitalize">
              Status: {sessionState}
            </div>
          </div>
        </div>
      </div>

      {/* Event Log Content */}
      <div className="flex-1 overflow-hidden p-6">
        <EventLog events={realtimeEvents} />
      </div>

      {/* Session Controls */}
      <div className="h-20 border-t border-secondary-200">
        <SessionControls />
      </div>
    </div>
  );
};

export default ChatPanel;
