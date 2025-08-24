# Voice Conversation Storage and Analysis Plan

## Overview
Design a system to capture voice conversations, store them efficiently, and feed them to Claude API for real-time negotiation analysis.

## Data Flow Architecture
```
Voice Input → WebRTC → Backend → Storage → Claude API → Negotiation Analysis
                           ↓
                    Terminal Display
```

## Conversation Storage Structure

### In-Memory Buffer (Primary)
```javascript
let activeConversation = {
  sessionId: "session-123",
  messages: [
    {
      role: "user",
      content: "What kind of loan options do you have?"
    },
    {
      role: "assistant", 
      content: "I can help you with several loan options including..."
    }
  ]
}
```

### JSON File (Backup/History)
```json
{
  "sessionId": "session-123",
  "messages": [
    {"role": "user", "content": "What kind of loan options do you have?"},
    {"role": "assistant", "content": "I can help you with several loan options..."}
  ]
}
```

## Claude API Analysis

### Analysis Type: Negotiation Opportunities
**Goal:** Find leverage points and opportunities for better loan terms

**Analysis Triggers:**
- Every 5 message exchanges
- On specific keywords (e.g., "rate", "fee", "negotiate", "better deal")
- At session end for summary
- On-demand via API endpoint

## Implementation Architecture

### Backend Structure
```
/backend/
  ├── index.js                 # Main server
  ├── services/
  │   ├── conversationStore.js # Manage conversation data
  │   └── claudeAnalyzer.js    # Claude API integration
  └── conversations/            # JSON backups (optional)
```

### Key Components

#### 1. Conversation Store Service
- Maintain in-memory conversation buffer
- Track message count and context
- Provide conversation chunks for analysis
- Handle session lifecycle

#### 2. Claude Analyzer Service
- Send conversation context to Claude API
- Analyze for negotiation opportunities
- Cache analysis results
- Return insights to frontend

## API Endpoints

```javascript
// Real-time negotiation analysis
POST /api/analyze-conversation
{
  "analysisType": "negotiation-opportunities",
  "sessionId": "session-123"
}

// Get current conversation
GET /api/conversation/:sessionId

// Trigger manual analysis
POST /api/conversation/:sessionId/analyze
```

## Claude API Integration

### Example Analysis Request
```javascript
const analyzeNegotiationOpportunities = async (messages) => {
  const prompt = `
    You are a loan negotiation expert. Analyze this conversation between a customer and loan officer:
    
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Find negotiation opportunities and leverage points:
    1. Identify areas where the customer could negotiate better terms
    2. Highlight any fees that could be waived or reduced  
    3. Note competitive advantages the customer could use
    4. Suggest specific negotiation strategies
    5. Rate the overall negotiation potential (Low/Medium/High)
    
    Return actionable insights for the customer.
  `;
  
  return await claudeAPI.complete(prompt);
}
```

### Sample Analysis Response
```json
{
  "negotiationPotential": "High",
  "opportunities": [
    {
      "area": "Application Fee",
      "suggestion": "Request waiver - customer has strong credit",
      "leverage": "Multiple competing offers"
    },
    {
      "area": "Interest Rate", 
      "suggestion": "Negotiate 0.25% reduction",
      "leverage": "Excellent payment history"
    }
  ],
  "strategies": [
    "Mention competitor's better rate of 4.2%",
    "Emphasize 15-year relationship with bank"
  ]
}
```

## Performance Optimizations

### Memory Management
- Limit in-memory conversation to last 50 messages
- Use circular buffer for efficiency
- Archive old messages to file if needed

### API Rate Limiting
- Batch messages before sending to Claude
- Implement debouncing (wait 3 seconds after speech ends)
- Cache analysis results for 5 minutes

### Cost Optimization
- Only send relevant loan-related portions to Claude
- Use smart triggers (not every message)
- Implement keyword filtering before analysis

## Frontend Integration

### Display Negotiation Insights
- Show real-time negotiation opportunities in UI
- Highlight leverage points as they emerge
- Display negotiation strategies sidebar
- Show overall negotiation potential score

### Example UI Components
```javascript
// Negotiation Opportunities Panel
<NegotiationPanel 
  opportunities={analysisResult.opportunities}
  potential={analysisResult.negotiationPotential}
  strategies={analysisResult.strategies}
/>
```

## Implementation Phases

### Phase 1: Basic Storage
- Implement in-memory conversation buffer
- Create simple message storage structure
- Add conversation lifecycle management

### Phase 2: Claude Integration  
- Connect to Claude API
- Implement basic negotiation analysis
- Add analysis triggers

### Phase 3: Real-time Analysis
- Add keyword-based triggers
- Implement debounced analysis
- Cache results for performance

### Phase 4: Frontend Display
- Create negotiation insights UI
- Add real-time updates
- Display actionable recommendations

## Benefits

1. **Focused Analysis** - Single analysis type for clear value
2. **Real-time Insights** - Help customers during actual conversations
3. **Cost-effective** - Smart triggering reduces API calls
4. **Actionable Results** - Specific negotiation strategies
5. **Scalable Architecture** - Easy to add more analysis types later

This approach provides immediate value by helping customers identify and act on negotiation opportunities during loan conversations.