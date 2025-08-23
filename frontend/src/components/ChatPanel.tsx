import React, { useState, useRef, useEffect } from "react";
import { Send, User, Phone, Clock } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

const ChatPanel: React.FC = () => {
  const { chatMessages, addChatMessage } = useAppStore();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      addChatMessage({
        text: newMessage.trim(),
        sender: "user",
      });
      setNewMessage("");

      // Simulate loan officer response
      setTimeout(() => {
        addChatMessage({
          text: "Thank you for your message. I'll review your loan estimate comparison and get back to you shortly with any questions or clarifications.",
          sender: "officer",
        });
      }, 2000);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSpeakerIcon = (sender: "user" | "officer") => {
    return sender === "user" ? (
      <User className="text-primary-600" size={20} />
    ) : (
      <Phone className="text-secondary-600" size={20} />
    );
  };

  const getSpeakerName = (sender: "user" | "officer") => {
    return sender === "user" ? "You" : "Loan Officer";
  };

  const getMessageStyle = (sender: "user" | "officer") => {
    return sender === "user"
      ? "bg-primary-50 border-primary-200 ml-8"
      : "bg-secondary-50 border-secondary-200 mr-8";
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-secondary-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-secondary-900">
            Chat with Loan Officer
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-secondary-600">Online</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-6">
        {chatMessages.length === 0 ? (
          <div className="text-center py-12">
            <Phone className="text-secondary-400 mx-auto mb-4" size={48} />
            <h4 className="text-lg font-medium text-secondary-900 mb-2">
              No messages yet
            </h4>
            <p className="text-secondary-600">
              Start a conversation with your loan officer about your loan
              estimates
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg border ${getMessageStyle(
                  message.sender
                )}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getSpeakerIcon(message.sender)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-secondary-900">
                        {getSpeakerName(message.sender)}
                      </span>
                      <div className="flex items-center space-x-1 text-xs text-secondary-500">
                        <Clock size={12} />
                        <span>{formatTime(message.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-secondary-800 leading-relaxed">
                      {message.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="px-6 py-4 border-t border-secondary-200">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 input-field"
            disabled={chatMessages.length === 0}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPanel;
