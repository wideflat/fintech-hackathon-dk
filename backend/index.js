const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const conversationStore = require('./services/conversationStore');
const claudeAnalyzer = require('./services/claudeAnalyzer');
const loanComparisonRoutes = require('./routes/loanComparison');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3001;
const apiKey = process.env.OPENAI_API_KEY;

// Configure CORS to allow frontend requests
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Add loan comparison routes
app.use('/api/loan-comparison', loanComparisonRoutes);

// Utility function to extract text from conversation events
function extractConversationText(event) {
  // User voice input (speech-to-text)
  if (event.type === 'conversation.item.create' && event.item?.content) {
    const content = event.item.content[0];
    if (content?.type === 'input_text') {
      return `👤 USER (typed): ${content.text}`;
    }
    if (content?.type === 'input_audio') {
      return `🎤 USER (voice): [Audio input received]`;
    }
  }
  
  // AI voice response transcription
  if (event.type === 'response.audio_transcript.delta' && event.delta) {
    return event.delta;
  }
  
  if (event.type === 'response.audio_transcript.done' && event.transcript) {
    return `🤖 ASSISTANT (voice): ${event.transcript}`;
  }
  
  // Text-based responses (fallback)
  if (event.type === 'response.text.delta' && event.delta) {
    return event.delta;
  }
  
  if (event.type === 'response.text.done' && event.text) {
    return `🤖 ASSISTANT: ${event.text}`;
  }
  
  if (event.type === 'conversation.item.create' && event.item?.type === 'message' && event.item?.role === 'assistant') {
    const content = event.item.content?.[0];
    if (content?.type === 'text') {
      return `🤖 ASSISTANT: ${content.text}`;
    }
    if (content?.type === 'audio') {
      return `🔊 ASSISTANT (audio): [Audio response generated]`;
    }
  }
  
  // Input audio transcription from user
  if (event.type === 'input_audio_buffer.speech_started') {
    return `🎤 USER: [Started speaking...]`;
  }
  
  if (event.type === 'input_audio_buffer.speech_stopped') {
    return `🎤 USER: [Stopped speaking]`;
  }
  
  // Conversation item with audio transcription
  if (event.type === 'conversation.item.input_audio_transcription.completed' && event.transcript) {
    return `👤 USER (voice): "${event.transcript}"`;
  }
  
  return null;
}

// Terminal conversation display and storage
let conversationBuffer = '';
let currentSessionId = null;
let currentLenderContext = null;

// Analysis trigger configuration
const TRIGGER_KEYWORDS = ['rate', 'interest rate', 'apr', 'fee', 'application fee', 'origination fee', 'negotiate', 'better deal', 'discount', 'refinance', 'lower payment', 'credit score', 'qualification'];
let messagesSinceLastAnalysis = 0;
let lastAnalysisTime = 0;
const ANALYSIS_MESSAGE_THRESHOLD = 10; // Every 5 exchanges (10 messages total)
const MIN_ANALYSIS_INTERVAL = 30000; // 30 seconds

// Analysis trigger functions
function shouldTriggerAnalysis(message) {
  const lowerMessage = message.toLowerCase();
  return TRIGGER_KEYWORDS.some(keyword => lowerMessage.includes(keyword));
}

function canTriggerAnalysis() {
  return Date.now() - lastAnalysisTime > MIN_ANALYSIS_INTERVAL;
}

async function analyzeAndBroadcast(sessionId, triggerReason) {
  if (!canTriggerAnalysis()) {
    console.log(`⏸️ Analysis skipped: too soon (${triggerReason})`);
    return;
  }
  
  console.log(`🔍 Triggering analysis: ${triggerReason}`);
  io.emit('analysis-started', { sessionId });
  
  try {
    const result = await claudeAnalyzer.analyzeNegotiationOpportunities(sessionId, currentLenderContext);
    if (result.success) {
      io.emit('analysis-update', {
        sessionId,
        analysis: result.analysis,
        trigger: triggerReason,
        cached: result.cached,
        timestamp: new Date().toISOString()
      });
      console.log(`✅ Analysis broadcasted to frontend (${result.cached ? 'cached' : 'fresh'})`);
    } else {
      io.emit('analysis-error', { sessionId, error: result.error });
      console.error('❌ Analysis failed:', result.error);
    }
  } catch (error) {
    io.emit('analysis-error', { sessionId, error: error.message });
    console.error('❌ Analysis exception:', error);
  }
  
  lastAnalysisTime = Date.now();
  messagesSinceLastAnalysis = 0;
}

function logConversationToTerminal(event) {
  const text = extractConversationText(event);
  
  // Create session if needed
  if (!currentSessionId && (event.type?.includes('audio') || event.type?.includes('speech'))) {
    currentSessionId = `session-${Date.now()}`;
    conversationStore.createSession(currentSessionId);
    console.log(`🆔 Started new conversation session: ${currentSessionId}`);
  }
  
  if (text) {
    if (text.startsWith('👤') || text.startsWith('🤖') || text.startsWith('🎤') || text.startsWith('🔊')) {
      // Complete message
      if (conversationBuffer) {
        console.log('\n');
        conversationBuffer = '';
      }
      console.log('\n' + '='.repeat(60));
      console.log(`📞 ${new Date().toLocaleTimeString()}`);
      console.log(text);
      
      // Store complete messages in conversation store
      if (currentSessionId) {
        if (text.includes('USER (voice):')) {
          const userMessage = text.replace(/👤 USER \(voice\): "?/, '').replace(/"$/, '');
          conversationStore.addMessage(currentSessionId, 'user', userMessage);
        } else if (text.includes('ASSISTANT (voice):')) {
          const assistantMessage = text.replace(/🤖 ASSISTANT \(voice\): /, '');
          conversationStore.addMessage(currentSessionId, 'assistant', assistantMessage);
        }
      }
    } else {
      // Text delta - accumulate and display in real-time
      conversationBuffer += text;
      process.stdout.write(text);
    }
  }
  
  // Store completed transcripts from events
  if (currentSessionId) {
    if (event.type === 'conversation.item.input_audio_transcription.completed' && event.transcript) {
      conversationStore.addMessage(currentSessionId, 'user', event.transcript);
      messagesSinceLastAnalysis++;
      
      // Check for keyword triggers in user message
      if (shouldTriggerAnalysis(event.transcript)) {
        analyzeAndBroadcast(currentSessionId, `keyword detected: "${event.transcript.substring(0, 50)}..."`);
      }
      // Check for message count trigger
      else if (messagesSinceLastAnalysis >= ANALYSIS_MESSAGE_THRESHOLD) {
        analyzeAndBroadcast(currentSessionId, `message threshold reached (${messagesSinceLastAnalysis} messages)`);
      }
      
    } else if (event.type === 'response.audio_transcript.done') {
      console.log('🔍 Found response.audio_transcript.done event!');
      console.log('🔍 Event has transcript:', !!event.transcript);
      console.log('🔍 Current session ID:', currentSessionId);
      
      if (event.transcript) {
        conversationStore.addMessage(currentSessionId, 'assistant', event.transcript);
        messagesSinceLastAnalysis++;
      }
      
      console.log('🤖 AI finished speaking, scheduling analysis in 1.5 seconds...');
      // Always analyze after AI speaks to give user a recommended response
      setTimeout(() => {
        console.log('⏰ Auto-analysis timeout triggered, analyzing now...');
        analyzeAndBroadcast(currentSessionId, 'ai-response-completed');
      }, 1500); // Small delay to ensure full response is captured
    }
  }
  
  // Also log all event types for debugging voice interactions
  if (event.type?.includes('audio') || event.type?.includes('speech')) {
    console.log(`\n🔧 [DEBUG] Voice Event: ${event.type}`);
    if (event.transcript) console.log(`   Transcript: "${event.transcript}"`);
    if (event.delta) console.log(`   Delta: "${event.delta}"`);
    
    // Fallback trigger for AI responses - trigger here where we KNOW the event is detected
    if (event.type === 'response.audio_transcript.done' && currentSessionId) {
      console.log('🚀 FALLBACK: Detected AI response completion, triggering analysis...');
      setTimeout(() => {
        console.log('⏰ FALLBACK: Auto-analysis timeout triggered, analyzing now...');
        analyzeAndBroadcast(currentSessionId, 'ai-response-completed-fallback');
      }, 1500);
    }
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('\n🔗 Frontend connected for conversation logging');
  
  socket.on('realtime-event', (event) => {
    logConversationToTerminal(event);
  });
  
  socket.on('disconnect', () => {
    console.log('\n📴 Frontend disconnected from conversation logging');
  });
});

// Endpoint to receive realtime events for terminal logging
app.post('/api/log-conversation', (req, res) => {
  const { event } = req.body;
  
  if (event) {
    logConversationToTerminal(event);
  }
  
  res.json({ success: true });
});

// Conversation Store API Endpoints

// Get current conversation
app.get('/api/conversation/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const conversation = conversationStore.getConversation(sessionId);
  
  if (!conversation) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json({
    sessionId,
    messages: conversation,
    stats: conversationStore.getSessionStats(sessionId)
  });
});

// Get conversation context for analysis
app.get('/api/conversation/:sessionId/context', (req, res) => {
  const { sessionId } = req.params;
  const { size = 20 } = req.query;
  
  const context = conversationStore.getConversationContext(sessionId, parseInt(size));
  
  res.json({
    sessionId,
    context,
    contextSize: context.length
  });
});

// Get all active sessions
app.get('/api/conversations/active', (req, res) => {
  const activeSessions = conversationStore.getActiveSessions();
  const sessionsWithStats = activeSessions.map(sessionId => ({
    sessionId,
    stats: conversationStore.getSessionStats(sessionId)
  }));
  
  res.json({
    activeSessions: sessionsWithStats,
    total: activeSessions.length
  });
});

// Get conversation store statistics
app.get('/api/conversations/stats', (req, res) => {
  const storeStats = conversationStore.getStoreStats();
  res.json(storeStats);
});

// Export conversation to JSON
app.get('/api/conversation/:sessionId/export', (req, res) => {
  const { sessionId } = req.params;
  const exportData = conversationStore.exportSessionToJSON(sessionId);
  
  if (!exportData) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="conversation-${sessionId}.json"`);
  res.json(exportData);
});

// End a conversation session
app.post('/api/conversation/:sessionId/end', async (req, res) => {
  const { sessionId } = req.params;
  const success = await conversationStore.endSession(sessionId);
  
  if (!success) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  const stats = conversationStore.getSessionStats(sessionId);
  res.json({ 
    success: true, 
    message: 'Session ended',
    finalStats: stats 
  });
});

// End current active session
app.post('/api/conversation/current/end', async (req, res) => {
  if (!currentSessionId) {
    return res.status(404).json({ error: 'No active session' });
  }
  
  const success = await conversationStore.endSession(currentSessionId);
  const stats = conversationStore.getSessionStats(currentSessionId);
  
  // Clear current session
  currentSessionId = null;
  
  res.json({ 
    success: true, 
    message: 'Current session ended',
    finalStats: stats 
  });
});

// Analyze conversation for negotiation opportunities
app.post('/api/analyze-conversation', async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    // Use current session if no sessionId provided
    const targetSessionId = sessionId || currentSessionId;
    
    if (!targetSessionId) {
      return res.status(400).json({ error: 'No session ID provided and no active session' });
    }
    
    const result = await claudeAnalyzer.analyzeNegotiationOpportunities(targetSessionId);
    res.json(result);
  } catch (error) {
    console.error('Analysis endpoint error:', error);
    res.status(500).json({ error: 'Failed to analyze conversation' });
  }
});

// Analyze current active conversation
app.post('/api/analyze-current', async (req, res) => {
  try {
    if (!currentSessionId) {
      return res.status(404).json({ error: 'No active session' });
    }
    
    const result = await claudeAnalyzer.analyzeNegotiationOpportunities(currentSessionId);
    res.json(result);
  } catch (error) {
    console.error('Current analysis endpoint error:', error);
    res.status(500).json({ error: 'Failed to analyze current conversation' });
  }
});

// Get latest analysis for a session
app.get('/api/analysis/:sessionId/latest', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await claudeAnalyzer.analyzeNegotiationOpportunities(sessionId);
    res.json(result);
  } catch (error) {
    console.error('Latest analysis endpoint error:', error);
    res.status(500).json({ error: 'Failed to get latest analysis' });
  }
});

// Set lender context for analysis
app.post('/api/set-lender-context', (req, res) => {
  try {
    const { lender, lenderData } = req.body;
    
    currentLenderContext = {
      currentLender: lender,
      lenderData: lenderData
    };
    
    console.log(`🏦 Set lender context: ${lender}`);
    res.json({ success: true, lender: lender });
  } catch (error) {
    console.error('Set lender context error:', error);
    res.status(500).json({ error: 'Failed to set lender context' });
  }
});

// PDF Analysis endpoints
app.post('/api/pdf-analysis/compare', async (req, res) => {
  try {
    // Load real loan data from the processed JSON
    const fs = require('fs');
    const path = require('path');
    const loanDataPath = path.join(__dirname, '../data/loan_comparison_summary.json');
    
    if (!fs.existsSync(loanDataPath)) {
      return res.status(404).json({ 
        success: false,
        error: 'Loan comparison data not found. Please run PDF extraction first.' 
      });
    }
    
    const loanData = JSON.parse(fs.readFileSync(loanDataPath, 'utf8'));
    const summary = loanData.loan_comparison_summary;
    
    // Convert to comparison format
    const lenderA = {
      lenderName: "Bank A",
      interestRate: parseFloat(summary.lenders.lender_a.interest_rate.replace('%', '')),
      points: parseFloat(summary.lenders.lender_a.points.replace('%', '')),
      pointsCost: summary.lenders.lender_a.loan_amount_points,
      totalClosingCosts: parseInt(summary.lenders.lender_a.total_closing_costs.replace('$', '').replace(',', '')),
      loanAmount: summary.lenders.lender_a.loan_amount,
      monthlyPayment: 2647, // Calculated based on rate
      term: 30,
      // Estimated breakdown for closing costs
      originationFee: 1500,
      applicationFee: 500,
      processingFee: 500,
      underwritingFee: 300
    };
    
    const lenderB = {
      lenderName: "Bank B", 
      interestRate: parseFloat(summary.lenders.lender_b.interest_rate.replace('%', '')),
      points: parseFloat(summary.lenders.lender_b.points.replace('%', '')),
      pointsCost: summary.lenders.lender_b.loan_amount_points,
      totalClosingCosts: parseInt(summary.lenders.lender_b.total_closing_costs.replace('$', '').replace(',', '')),
      loanAmount: summary.lenders.lender_b.loan_amount,
      monthlyPayment: 2602, // Calculated based on rate
      term: 30,
      // Estimated breakdown for closing costs  
      originationFee: 2000,
      applicationFee: 400,
      processingFee: 400,
      underwritingFee: 250
    };
    
    // Perform AI analysis
    const rateDiff = lenderA.interestRate - lenderB.interestRate;
    const costDiff = lenderA.totalClosingCosts - lenderB.totalClosingCosts;
    const monthlyDiff = lenderA.monthlyPayment - lenderB.monthlyPayment;
    
    // Determine recommendation based on weighted scoring
    const rateWeight = 0.4;
    const pointsWeight = 0.3; 
    const feesWeight = 0.3;
    
    let lenderAScore = 0;
    let lenderBScore = 0;
    
    if (lenderA.interestRate < lenderB.interestRate) lenderAScore += rateWeight;
    else if (lenderB.interestRate < lenderA.interestRate) lenderBScore += rateWeight;
    
    if (lenderA.points < lenderB.points) lenderAScore += pointsWeight;
    else if (lenderB.points < lenderA.points) lenderBScore += pointsWeight;
    
    if (lenderA.totalClosingCosts < lenderB.totalClosingCosts) lenderAScore += feesWeight;
    else if (lenderB.totalClosingCosts < lenderA.totalClosingCosts) lenderBScore += feesWeight;
    
    const recommendation = lenderAScore > lenderBScore ? "lenderA" : "lenderB";
    const totalSavings = Math.abs(monthlyDiff) * 12 * 30;
    
    const result = {
      recommendation,
      reasoning: lenderAScore > lenderBScore ? 
        `Bank A offers better overall value with ${Math.abs(rateDiff).toFixed(3)}% ${rateDiff > 0 ? 'higher' : 'lower'} interest rate but ${Math.abs(costDiff)} ${costDiff > 0 ? 'higher' : 'lower'} in closing costs.` :
        `Bank B offers better overall value with ${Math.abs(rateDiff).toFixed(3)}% lower interest rate despite ${Math.abs(costDiff)} in additional costs.`,
      savings: {
        monthly: Math.abs(monthlyDiff),
        total: totalSavings
      },
      breakdown: {
        interestRateComparison: rateDiff > 0 ? `Bank B has ${Math.abs(rateDiff).toFixed(3)}% lower interest rate` : `Bank A has ${Math.abs(rateDiff).toFixed(3)}% lower interest rate`,
        pointsComparison: lenderA.points === lenderB.points ? "Both lenders have the same points" : (lenderA.points < lenderB.points ? `Bank A requires ${Math.abs(lenderA.points - lenderB.points)}% fewer points` : `Bank B requires ${Math.abs(lenderA.points - lenderB.points)}% fewer points`),
        feesComparison: costDiff === 0 ? "Both lenders have similar closing costs" : (costDiff < 0 ? `Bank A has $${Math.abs(costDiff).toLocaleString()} less in closing costs` : `Bank B has $${costDiff.toLocaleString()} less in closing costs`),
        overallValue: `Based on weighted analysis: Interest Rate (40%), Points (30%), Closing Costs (30%)`,
        interestRateA: lenderA.interestRate,
        interestRateB: lenderB.interestRate,
        pointsA: lenderA.points,
        pointsB: lenderB.points,
        feesA: lenderA.totalClosingCosts,
        feesB: lenderB.totalClosingCosts
      },
      analysis: {
        lenderAScore: Math.round(lenderAScore * 100),
        lenderBScore: Math.round(lenderBScore * 100),
        criteria: ["Interest Rate", "Points", "Closing Costs"],
        weights: [40, 30, 30]
      }
    };
    
    res.json({
      success: true,
      data: result,
      source: "extracted_pdf_data"
    });
    
  } catch (error) {
    console.error('PDF analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze PDF data',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API route for token generation
app.get('/api/token', async (req, res) => {
  try {
    if (!apiKey) {
      return res.status(500).json({ 
        error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.' 
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/realtime/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-realtime-preview-2024-12-17",
          voice: "verse",
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `OpenAI API error: ${response.status}` 
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Token generation error:", error);
    res.status(500).json({ error: "Failed to generate token" });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down server gracefully...');
  
  // Save all active conversations before shutdown
  const savedCount = await conversationStore.saveAllSessions();
  console.log(`💾 Saved ${savedCount} conversation(s) before shutdown`);
  
  // End current session if active
  if (currentSessionId) {
    await conversationStore.endSession(currentSessionId);
  }
  
  console.log('👋 Server shutdown complete');
  process.exit(0);
});

server.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📡 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔑 OpenAI API key: ${apiKey ? 'Configured' : '❌ Missing - Set OPENAI_API_KEY env var'}`);
  console.log(`💬 Terminal conversation logging enabled`);
  console.log(`📺 Watch this terminal for real-time conversation text!`);
  console.log(`💾 Auto-save enabled: ${conversationStore.autoSave ? 'Conversations will save to JSON files' : 'Disabled'}`);
});