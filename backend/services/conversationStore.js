const fs = require('fs').promises;
const path = require('path');

class ConversationStore {
  constructor() {
    this.sessions = new Map();
    this.maxMessages = 50; // Sliding window size
    this.sessionTimeoutMs = 30 * 60 * 1000; // 30 minutes
    this.conversationsDir = path.join(__dirname, '..', 'conversations');
    this.autoSave = true; // Enable automatic file saving
    
    // Ensure conversations directory exists
    this.ensureConversationsDir();
  }

  /**
   * Ensure conversations directory exists
   */
  async ensureConversationsDir() {
    try {
      await fs.access(this.conversationsDir);
    } catch (error) {
      console.log('📁 Creating conversations directory...');
      await fs.mkdir(this.conversationsDir, { recursive: true });
    }
  }

  /**
   * Initialize a new conversation session
   * @param {string} sessionId - Unique session identifier
   * @returns {Object} - Created session object
   */
  createSession(sessionId) {
    const session = {
      id: sessionId,
      messages: [],
      startTime: Date.now(),
      lastActivity: Date.now(),
      isActive: true,
      messageCount: 0
    };

    this.sessions.set(sessionId, session);
    console.log(`📝 Created conversation session: ${sessionId}`);
    return session;
  }

  /**
   * Add a message to the conversation
   * @param {string} sessionId - Session identifier
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   * @returns {boolean} - Success status
   */
  addMessage(sessionId, role, content) {
    let session = this.sessions.get(sessionId);
    
    // Create session if it doesn't exist
    if (!session) {
      session = this.createSession(sessionId);
    }

    // Skip empty content
    if (!content || content.trim() === '') {
      return false;
    }

    const message = {
      role: role,
      content: content.trim(),
      timestamp: Date.now()
    };

    session.messages.push(message);
    session.messageCount++;
    session.lastActivity = Date.now();

    // Maintain sliding window
    if (session.messages.length > this.maxMessages) {
      session.messages = session.messages.slice(-this.maxMessages);
    }

    console.log(`💬 Added message to ${sessionId}: ${role} - "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    return true;
  }

  /**
   * Get the full conversation for a session
   * @param {string} sessionId - Session identifier
   * @returns {Array|null} - Array of messages or null if session not found
   */
  getConversation(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.log(`❌ Session not found: ${sessionId}`);
      return null;
    }

    return session.messages;
  }

  /**
   * Get recent messages from a session
   * @param {string} sessionId - Session identifier
   * @param {number} count - Number of recent messages to return
   * @returns {Array} - Array of recent messages
   */
  getRecentMessages(sessionId, count = 10) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    return session.messages.slice(-count);
  }

  /**
   * Get conversation context for Claude API
   * @param {string} sessionId - Session identifier
   * @param {number} contextSize - Number of messages for context (default: 20)
   * @returns {Array} - Messages formatted for Claude API
   */
  getConversationContext(sessionId, contextSize = 20) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return [];
    }

    const recentMessages = session.messages.slice(-contextSize);
    
    // Format for Claude API (simple role/content structure)
    return recentMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
  }

  /**
   * Mark session as ended
   * @param {string} sessionId - Session identifier
   * @returns {boolean} - Success status
   */
  async endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    session.isActive = false;
    session.endTime = Date.now();
    
    console.log(`🏁 Ended conversation session: ${sessionId} (${session.messageCount} messages)`);
    
    // Auto-save to file when session ends
    if (this.autoSave && session.messages.length > 0) {
      await this.saveSessionToFile(sessionId);
    }
    
    return true;
  }

  /**
   * Save session to JSON file
   * @param {string} sessionId - Session identifier
   * @returns {boolean} - Success status
   */
  async saveSessionToFile(sessionId) {
    try {
      const session = this.sessions.get(sessionId);
      if (!session) {
        console.warn(`⚠️ Cannot save session ${sessionId}: not found`);
        return false;
      }

      await this.ensureConversationsDir();
      
      const exportData = this.exportSessionToJSON(sessionId);
      const filename = `conversation-${sessionId}.json`;
      const filepath = path.join(this.conversationsDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(exportData, null, 2));
      console.log(`💾 Saved conversation to file: ${filename}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Error saving session ${sessionId}:`, error);
      return false;
    }
  }

  /**
   * Save all active sessions to files
   * @returns {number} - Number of sessions saved
   */
  async saveAllSessions() {
    let savedCount = 0;
    
    for (const [sessionId, session] of this.sessions) {
      if (session.messages.length > 0) {
        const success = await this.saveSessionToFile(sessionId);
        if (success) {
          savedCount++;
        }
      }
    }
    
    if (savedCount > 0) {
      console.log(`💾 Saved ${savedCount} conversation sessions to files`);
    }
    
    return savedCount;
  }

  /**
   * Remove session from memory
   * @param {string} sessionId - Session identifier
   * @returns {boolean} - Success status
   */
  clearSession(sessionId) {
    const deleted = this.sessions.delete(sessionId);
    if (deleted) {
      console.log(`🗑️ Cleared conversation session: ${sessionId}`);
    }
    return deleted;
  }

  /**
   * Get all active session IDs
   * @returns {Array} - Array of active session IDs
   */
  getActiveSessions() {
    const activeSessions = [];
    for (const [sessionId, session] of this.sessions) {
      if (session.isActive) {
        activeSessions.push(sessionId);
      }
    }
    return activeSessions;
  }

  /**
   * Get session statistics
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} - Session stats or null if not found
   */
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    const userMessages = session.messages.filter(msg => msg.role === 'user').length;
    const assistantMessages = session.messages.filter(msg => msg.role === 'assistant').length;
    const duration = session.endTime ? session.endTime - session.startTime : Date.now() - session.startTime;

    return {
      sessionId: sessionId,
      totalMessages: session.messages.length,
      userMessages: userMessages,
      assistantMessages: assistantMessages,
      duration: Math.round(duration / 1000), // in seconds
      isActive: session.isActive,
      startTime: session.startTime,
      endTime: session.endTime || null
    };
  }

  /**
   * Export session to JSON format
   * @param {string} sessionId - Session identifier
   * @returns {Object|null} - Session data in JSON format
   */
  exportSessionToJSON(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return null;
    }

    return {
      sessionId: sessionId,
      messages: session.messages,
      metadata: this.getSessionStats(sessionId)
    };
  }

  /**
   * Clean up expired sessions
   * @returns {number} - Number of sessions cleaned up
   */
  cleanupExpiredSessions() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity > this.sessionTimeoutMs) {
        this.clearSession(sessionId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} expired conversation sessions`);
    }

    return cleanedCount;
  }

  /**
   * Get overall store statistics
   * @returns {Object} - Store statistics
   */
  getStoreStats() {
    const totalSessions = this.sessions.size;
    const activeSessions = this.getActiveSessions().length;
    let totalMessages = 0;

    for (const session of this.sessions.values()) {
      totalMessages += session.messages.length;
    }

    return {
      totalSessions: totalSessions,
      activeSessions: activeSessions,
      inactiveSessions: totalSessions - activeSessions,
      totalMessages: totalMessages,
      maxMessagesPerSession: this.maxMessages
    };
  }
}

// Create singleton instance
const conversationStore = new ConversationStore();

// Cleanup expired sessions every 10 minutes
setInterval(() => {
  conversationStore.cleanupExpiredSessions();
}, 10 * 60 * 1000);

module.exports = conversationStore;