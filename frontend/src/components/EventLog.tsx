import React, { useState } from "react";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { RealtimeEvent } from "../types";

interface EventProps {
  event: RealtimeEvent;
}

const Event: React.FC<EventProps> = ({ event }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isClient = event.event_id && !event.event_id.startsWith("event_");

  return (
    <div className="flex flex-col gap-2 p-3 rounded-lg bg-secondary-50 border border-secondary-200">
      <div
        className="flex items-center gap-2 cursor-pointer hover:text-secondary-700 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isClient ? (
          <ArrowDownCircle className="text-blue-500 flex-shrink-0" size={16} />
        ) : (
          <ArrowUpCircle className="text-green-500 flex-shrink-0" size={16} />
        )}
        <div className="text-sm text-secondary-600 font-mono">
          <span className="font-medium">
            {isClient ? "client" : "server"}:
          </span>{" "}
          <span className="text-secondary-900">{event.type}</span>
          <span className="text-secondary-500 ml-2">| {event.timestamp}</span>
        </div>
      </div>
      <div
        className={`text-secondary-600 bg-secondary-100 p-3 rounded-md overflow-x-auto transition-all duration-200 ${
          isExpanded ? "block" : "hidden"
        }`}
      >
        <pre className="text-xs font-mono whitespace-pre-wrap">
          {JSON.stringify(event, null, 2)}
        </pre>
      </div>
    </div>
  );
};

interface EventLogProps {
  events: RealtimeEvent[];
}

const EventLog: React.FC<EventLogProps> = ({ events }) => {
  const eventsToDisplay: JSX.Element[] = [];
  const deltaEvents: Record<string, RealtimeEvent> = {};

  events.forEach((event) => {
    if (event.type.endsWith("delta")) {
      if (deltaEvents[event.type]) {
        // for now just log a single event per render pass
        return;
      } else {
        deltaEvents[event.type] = event;
      }
    }

    eventsToDisplay.push(<Event key={event.event_id} event={event} />);
  });

  return (
    <div className="flex flex-col gap-3 h-full">
      {events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="text-4xl text-secondary-300 mb-4">📊</div>
            <div className="text-secondary-500 text-lg font-medium mb-2">
              No events yet
            </div>
            <div className="text-secondary-400 text-sm">
              Waiting for realtime API events...
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-3">
          {eventsToDisplay}
        </div>
      )}
    </div>
  );
};

export default EventLog;