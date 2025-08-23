import React from "react";
import { Scale, Mic } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const Sidebar: React.FC = () => {
  const { mode, setMode } = useAppStore();

  const navigationItems = [
    {
      id: "comparison" as const,
      label: "Comparison",
      icon: Scale,
      description: "Compare loan estimates",
    },
    {
      id: "live-assistant" as const,
      label: "Live Assistant",
      icon: Mic,
      description: "Real-time negotiation help",
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-secondary-200 h-screen flex flex-col">
      <div className="p-6 border-b border-secondary-200">
        <h1 className="text-xl font-semibold text-secondary-900">
          € Mortgage Closer
        </h1>
        <p className="text-sm text-secondary-600 mt-1">
          Smart loan comparison & negotiation
        </p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = mode === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setMode(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                    isActive
                      ? "bg-primary-50 text-primary-700 border border-primary-200"
                      : "text-secondary-700 hover:bg-secondary-50 hover:text-secondary-900"
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive ? "text-primary-600" : "text-secondary-500"
                    }
                  />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-secondary-500">
                      {item.description}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-secondary-200">
        <div className="text-xs text-secondary-500">Powered by AI</div>
      </div>
    </div>
  );
};

export default Sidebar;
