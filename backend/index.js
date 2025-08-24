const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
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

// Terminal conversation display
let conversationBuffer = '';
function logConversationToTerminal(event) {
  const text = extractConversationText(event);
  
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
    } else {
      // Text delta - accumulate and display in real-time
      conversationBuffer += text;
      process.stdout.write(text);
    }
  }
  
  // Also log all event types for debugging voice interactions
  if (event.type?.includes('audio') || event.type?.includes('speech')) {
    console.log(`\n🔧 [DEBUG] Voice Event: ${event.type}`);
    if (event.transcript) console.log(`   Transcript: "${event.transcript}"`);
    if (event.delta) console.log(`   Delta: "${event.delta}"`);
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

server.listen(port, () => {
  console.log(`🚀 Backend server running on port ${port}`);
  console.log(`📡 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🔑 OpenAI API key: ${apiKey ? 'Configured' : '❌ Missing - Set OPENAI_API_KEY env var'}`);
  console.log(`💬 Terminal conversation logging enabled`);
  console.log(`📺 Watch this terminal for real-time conversation text!`);
});