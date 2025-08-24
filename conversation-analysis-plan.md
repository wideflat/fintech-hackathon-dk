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

## Detailed Implementation Steps

### Step 1: Create Conversation Storage Service
**File:** `/backend/services/conversationStore.js`
- Implement in-memory conversation buffer with sliding window
- Track active sessions and message history
- Provide methods to add messages and retrieve conversation context
- Handle session lifecycle (start, update, end)

### Step 2: Develop Claude Analyzer Service  
**File:** `/backend/services/claudeAnalyzer.js`
- Integrate with Claude API for negotiation analysis
- Implement analysis prompt templates
- Handle API rate limiting and error handling
- Cache analysis results to avoid duplicate calls

### Step 3: Update Backend Main Server
**File:** `/backend/index.js`
- Integrate conversation store with existing voice logging
- Add analysis trigger logic (keyword detection, message count)
- Create API endpoints for manual analysis requests
- Implement real-time analysis broadcasting

### Step 4: Create Frontend Analysis Display
**File:** `/frontend/src/components/NegotiationInsights.tsx`
- Design UI components for showing negotiation opportunities
- Display analysis results in real-time
- Add visual indicators for leverage points
- Show actionable recommendations

### Step 5: Connect Frontend to Backend Analysis
**File:** `/frontend/src/services/analysisService.ts`

This step creates the bridge between your React frontend and the backend analysis system:

**1. Create service for requesting analysis from backend**
- Build a TypeScript service that sends HTTP requests to your backend's analysis endpoints
- Functions like `analyzeConversation(sessionId)` that call `/api/analyze-conversation`
- Handle the API responses and errors

**2. Handle real-time updates via WebSocket/polling**
- Since negotiation analysis should happen in real-time during conversations, you need live updates
- Either use Socket.IO (WebSocket) for instant updates, or polling (checking every few seconds)
- When the backend finds new negotiation opportunities, instantly show them in the UI

**3. Manage analysis state in frontend store**
- Store the analysis results (negotiation opportunities, leverage points) in your app's state management
- Keep track of loading states, errors, and the latest analysis data
- Make this data available to all components that need it

**4. Integrate with existing WebRTC event flow**
- Connect the analysis system to your current voice conversation system
- Trigger analysis automatically when certain voice events happen
- Ensure analysis requests happen seamlessly alongside the voice chat

**End result:** Your frontend will automatically request negotiation analysis during voice conversations and display the results in real-time, without the user having to manually ask for analysis.

### Step 6: Add Analysis Triggers and Optimization
- Implement smart triggering based on conversation context
- Add debouncing to prevent excessive API calls
- Optimize conversation context sent to Claude API
- Add error handling and fallback mechanisms

### Step 7: Testing and Performance Monitoring
- Test with various conversation scenarios
- Monitor Claude API usage and costs
- Implement logging for analysis performance
- Add configuration for analysis frequency and triggers

This structured approach ensures a complete implementation from data capture to user-facing analysis results.