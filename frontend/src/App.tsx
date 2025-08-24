import React from "react";
import Sidebar from "./components/Sidebar";
import ComparisonView from "./components/ComparisonView";
import CompactComparisonView from "./components/CompactComparisonView";
import LiveAssistantView from "./components/LiveAssistantView";
import { useAppStore } from "./store/useAppStore";

const App: React.FC = () => {
  const { mode, isLoading, error } = useAppStore();

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {mode === "comparison" ? (
          <CompactComparisonView />
        ) : (
          <LiveAssistantView />
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="text-secondary-900">Analyzing...</span>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
