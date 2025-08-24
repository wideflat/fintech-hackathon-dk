const Anthropic = require('@anthropic-ai/sdk');
const conversationStore = require('./conversationStore');

class ClaudeAnalyzer {
  constructor() {
    this.client = null;
    this.cache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }
  
  initializeClient() {
    if (!this.client) {
      console.log('🔑 Initializing Claude with API key:', process.env.ANTHROPIC_API_KEY ? 'Found' : 'Missing');
      
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY environment variable is required');
      }
      
      this.client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      });
    }
  }

  async analyzeNegotiationOpportunities(sessionId) {
    try {
      this.initializeClient();
      
      const messages = conversationStore.getConversationContext(sessionId, 20);
      
      if (!messages || messages.length === 0) {
        return { success: false, error: 'No conversation found' };
      }

      const cacheKey = `${sessionId}-${messages.length}`;
      const cached = this.getCachedAnalysis(cacheKey);
      if (cached) {
        return { success: true, analysis: cached, cached: true };
      }

      const prompt = this.buildNegotiationPrompt(messages);
      const response = await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1500,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });

      const analysis = this.parseAnalysisResponse(response.content[0].text);

      this.setCachedAnalysis(cacheKey, analysis);

      return { success: true, analysis, cached: false };
    } catch (error) {
      console.error('Analysis error:', error);
      return { 
        success: false, 
        error: 'Failed to analyze conversation',
        details: error.message 
      };
    }
  }

  getCachedAnalysis(cacheKey) {
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.result;
    }
    if (cached) {
      this.cache.delete(cacheKey);
    }
    return null;
  }

  setCachedAnalysis(cacheKey, result) {
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });
  }

  buildNegotiationPrompt(messages) {
    const conversationText = messages.slice(-20).map(m => 
      `${m.role === 'user' ? 'CUSTOMER' : 'LOAN OFFICER'}: ${m.content}`
    ).join('\n');

    return `You are a loan negotiation expert. Analyze this conversation between a customer and loan officer.

CONVERSATION:
${conversationText}

Provide negotiation analysis in this exact JSON format:
{
  "negotiationPotential": "Low|Medium|High",
  "opportunities": [
    {
      "area": "specific area like Interest Rate",
      "currentTerms": "what's currently offered",
      "suggestion": "specific action to take",
      "leverage": "why this could work"
    }
  ],
  "strategies": [
    "Specific strategy 1",
    "Specific strategy 2"
  ],
  "warningFlags": [
    "Any concerning terms to watch for"
  ],
  "nextSteps": "What the customer should do next"
}

Focus on:
1. Interest rate reduction opportunities
2. Fee waivers (application, origination, processing)
3. Better payment terms
4. Competing offers as leverage
5. Credit score advantages`;
  }

  parseAnalysisResponse(responseText) {
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('No JSON found in response');
    } catch (error) {
      return {
        negotiationPotential: "Medium",
        opportunities: [],
        strategies: ["Continue gathering information about loan terms"],
        warningFlags: [],
        nextSteps: "Ask for specific rate and fee details"
      };
    }
  }
}

module.exports = new ClaudeAnalyzer();