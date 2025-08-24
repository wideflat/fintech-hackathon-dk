import React, { useState } from 'react';
import { Zap, ZapOff, Phone, PhoneOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { webrtcService } from '../services/webrtcService';

interface SessionStoppedProps {
  startSession: (lender: 'lenderA' | 'lenderB') => Promise<void>;
}

const SessionStopped: React.FC<SessionStoppedProps> = ({ startSession }) => {
  const { sessionState } = useAppStore();
  const isActivating = sessionState === 'connecting';
  const [selectedLender, setSelectedLender] = useState<'lenderA' | 'lenderB' | null>(null);

  const handleStartSession = async (lender: 'lenderA' | 'lenderB') => {
    if (isActivating) return;
    setSelectedLender(lender);
    await startSession(lender);
  };

  return (
    <div className="flex items-center justify-center w-full h-full space-x-4">
      <button
        onClick={() => handleStartSession('lenderA')}
        disabled={isActivating}
        className={`
          flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isActivating && selectedLender === 'lenderA'
            ? 'bg-secondary-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
          } text-white
        `}
      >
        <Phone size={18} />
        <span>{isActivating && selectedLender === 'lenderA' ? 'Calling...' : 'Start Live Assistant and Call Lender A'}</span>
      </button>

      <button
        onClick={() => handleStartSession('lenderB')}
        disabled={isActivating}
        className={`
          flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isActivating && selectedLender === 'lenderB'
            ? 'bg-secondary-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          } text-white
        `}
      >
        <Phone size={18} />
        <span>{isActivating && selectedLender === 'lenderB' ? 'Calling...' : 'Start Live Assistant and Call Lender B'}</span>
      </button>
    </div>
  );
};

interface SessionActiveProps {
  stopSession: () => void;
}

const SessionActive: React.FC<SessionActiveProps> = ({ 
  stopSession
}) => {
  const { currentLender } = useAppStore();
  
  const getLenderInfo = () => {
    if (currentLender === 'lenderA') {
      return {
        name: 'First National Bank',
        rate: '4.875%'
      };
    } else if (currentLender === 'lenderB') {
      return {
        name: 'Premier Lending', 
        rate: '4.750%'
      };
    }
    return { name: 'Unknown Lender', rate: '' };
  };
  
  const lenderInfo = getLenderInfo();
  
  return (
    <div className="flex items-center justify-center w-full h-full gap-3">
      <div className="flex items-center space-x-2 text-green-600">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-medium">
          On Call with Mike from {lenderInfo.name}
        </span>
        {lenderInfo.rate && (
          <span className="text-sm text-green-500">
            ({lenderInfo.rate} offer)
          </span>
        )}
      </div>
      <button
        onClick={stopSession}
        className="flex items-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
      >
        <PhoneOff size={18} />
        <span>End Call</span>
      </button>
    </div>
  );
};

const SessionControls: React.FC = () => {
  const {
    sessionState,
    webrtcConnection,
    setSessionState,
    setWebRTCConnection,
    clearWebRTCConnection,
    addRealtimeEvent,
    clearRealtimeEvents,
    setError,
    setCurrentLender,
  } = useAppStore();

  const isSessionActive = sessionState === 'connected';

  const startSession = async (lender: 'lenderA' | 'lenderB') => {
    try {
      setSessionState('connecting');
      setError(null);
      clearRealtimeEvents();

      console.log('Starting WebRTC session...');

      // 1. Fetch token
      const ephemeralKey = await webrtcService.fetchToken();
      console.log('Token acquired');

      // 2. Create peer connection
      const peerConnection = await webrtcService.createPeerConnection();
      console.log('Peer connection created');

      // 3. Setup audio
      const { audioElement, localStream } = await webrtcService.setupAudio(peerConnection);
      console.log('Audio setup complete');

      // 4. Create data channel
      const dataChannel = webrtcService.createDataChannel(peerConnection);
      console.log('Data channel created');

      // 5. Store connection details
      setWebRTCConnection({
        peerConnection,
        dataChannel,
        audioElement,
        localStream,
      });

      // 6. Setup event listeners
      webrtcService.setupDataChannelListeners(dataChannel, (event) => {
        addRealtimeEvent(event);
      });

      // 7. Handle data channel open
      dataChannel.addEventListener('open', () => {
        console.log('Data channel opened - session is active');
        setSessionState('connected');
        
        // Store which lender was selected
        setCurrentLender(lender);
        
        // Send lender context to backend for analysis
        fetch('http://localhost:3001/api/set-lender-context', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId: 'current', // Backend will use current session
            lender: lender,
            lenderData: {
              lenderA: {
                name: 'First National Bank',
                rate: '4.875%',
                points: 'No points',
                hasPoints: false
              },
              lenderB: {
                name: 'Premier Lending',
                rate: '4.750%',
                points: '1% points ($4,000)',
                hasPoints: true
              }
            }
          })
        }).catch(err => console.log('Failed to send lender context:', err));
        
        // Load loan data for the selected lender
        const loanData = {
          lenderA: {
            rate: "4.875%",
            points: "Not Found",
            pointsCost: "$0",
            loanAmount: "$500,000",
            bankName: "First National Bank",
            hasPoints: false
          },
          lenderB: {
            rate: "4.750%", 
            points: "1%",
            pointsCost: "$4,000",
            loanAmount: "$500,000",
            bankName: "Premier Lending",
            hasPoints: true
          }
        };

        const selectedLenderData = lender === 'lenderA' ? loanData.lenderA : loanData.lenderB;
        
        // Configure the AI as Mike from the selected lender
        const sessionUpdate = {
          type: 'session.update',
          session: {
            instructions: `You are Mike Johnson, a loan officer from ${selectedLenderData.bankName}. You sent a loan estimate to the customer yesterday and are now calling to follow up.

Your personality:
- Friendly and professional
- You already know the customer and have discussed their needs
- You're calling to check in about the loan estimate you sent
- Be natural, use phrases like "as we discussed" and "in the estimate I sent"
- Sound like you're on a real phone call with natural speech patterns

The loan estimate you sent them:
- Loan Amount: ${selectedLenderData.loanAmount}
- Interest Rate: ${selectedLenderData.rate}
- Points: ${selectedLenderData.points} ${selectedLenderData.hasPoints ? `(${selectedLenderData.pointsCost})` : ''}
- This is for a 30-year fixed mortgage

Your opening approach:
Start by greeting them warmly and mentioning you're following up on the loan estimate you sent. Ask what they thought about it and if they have any questions.

Your negotiation strategy:
1. Reference the specific numbers from the estimate you sent
2. Ask if they have any questions about the terms
3. Be prepared to explain why your offer is competitive
4. If they mention other lenders, defend your offer's value
5. Show some flexibility on fees but hold firm on the rate initially
6. If pushed hard, you might offer small concessions

${lender === 'lenderA' ? 
  'Your advantage: No points required, simpler deal with competitive rate' : 
  'Your advantage: Lower rate of 4.750%, better long-term savings despite the points'}

Remember: You've already built rapport with this customer. This is a follow-up call, not a cold call. You want to close this deal.`,
            voice: 'alloy',
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 500
            },
            temperature: 0.8,
            max_response_output_tokens: 4096
          }
        };
        
        dataChannel.send(JSON.stringify(sessionUpdate));
        console.log(`Configured AI as Mike from ${selectedLenderData.bankName}`);
        
        // Trigger Mike's follow-up greeting after a short delay
        setTimeout(() => {
          const initialPrompt = {
            type: 'conversation.item.create',
            item: {
              type: 'message',
              role: 'user',
              content: [{
                type: 'input_text',
                text: `[System: You are Mike from ${selectedLenderData.bankName}. Call the customer to follow up on the loan estimate you sent yesterday. Start with a warm greeting, mention you sent the ${selectedLenderData.rate} rate offer, and ask what they thought about it.]`
              }]
            }
          };
          dataChannel.send(JSON.stringify(initialPrompt));
          
          const triggerResponse = {
            type: 'response.create'
          };
          dataChannel.send(JSON.stringify(triggerResponse));
          
          console.log('Triggered Mike\'s initial greeting');
        }, 1000);
      });

      // 8. Handle data channel close
      dataChannel.addEventListener('close', () => {
        console.log('Data channel closed');
        if (sessionState === 'connected') {
          setSessionState('idle');
        }
      });

      // 9. Establish connection
      await webrtcService.establishConnection(peerConnection, ephemeralKey);
      console.log('Connection established');

    } catch (error) {
      console.error('Failed to start session:', error);
      setError(`Failed to start session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSessionState('error');
      
      // Cleanup on error
      const { peerConnection, dataChannel, localStream, audioElement } = webrtcConnection;
      webrtcService.cleanup(peerConnection, dataChannel, localStream, audioElement);
      clearWebRTCConnection();
    }
  };

  const stopSession = () => {
    try {
      console.log('Stopping WebRTC session...');
      setSessionState('disconnecting');

      const { peerConnection, dataChannel, localStream, audioElement } = webrtcConnection;
      
      // Cleanup WebRTC resources
      webrtcService.cleanup(peerConnection, dataChannel, localStream, audioElement);
      
      // Clear state
      clearWebRTCConnection();
      setSessionState('idle');
      
      console.log('Session stopped');
    } catch (error) {
      console.error('Error stopping session:', error);
      setError(`Error stopping session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSessionState('error');
    }
  };

  const sendTextMessage = (text: string) => {
    const { dataChannel } = webrtcConnection;
    
    if (dataChannel && isSessionActive) {
      // Add client event to log
      const clientEvent = {
        event_id: crypto.randomUUID(),
        type: 'conversation.item.create',
        timestamp: new Date().toISOString(),
        isClient: true,
        data: {
          item: {
            type: 'message',
            role: 'user',
            content: [{ type: 'input_text', text }]
          }
        }
      };
      
      addRealtimeEvent(clientEvent);
      
      // Send client event to backend for terminal logging
      webrtcService.sendEventToBackendLog(clientEvent);
      
      webrtcService.sendTextMessage(dataChannel, text);
    } else {
      console.warn('Cannot send message: session not active or data channel unavailable');
    }
  };

  if (sessionState === 'error') {
    return (
      <div className="flex items-center justify-center w-full h-full p-4">
        <div className="text-center">
          <div className="text-red-600 font-medium mb-2">Session Error</div>
          <button
            onClick={() => {
              setSessionState('idle');
              setError(null);
            }}
            className="btn-secondary"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4 border-t border-secondary-200 h-full p-4">
      {isSessionActive ? (
        <SessionActive
          stopSession={stopSession}
        />
      ) : (
        <SessionStopped startSession={startSession} />
      )}
    </div>
  );
};

export default SessionControls;