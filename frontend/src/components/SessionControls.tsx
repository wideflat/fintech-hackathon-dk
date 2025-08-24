import React from 'react';
import { Zap, ZapOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { webrtcService } from '../services/webrtcService';

interface SessionStoppedProps {
  startSession: () => Promise<void>;
}

const SessionStopped: React.FC<SessionStoppedProps> = ({ startSession }) => {
  const { sessionState } = useAppStore();
  const isActivating = sessionState === 'connecting';

  const handleStartSession = async () => {
    if (isActivating) return;
    await startSession();
  };

  return (
    <div className="flex items-center justify-center w-full h-full">
      <button
        onClick={handleStartSession}
        disabled={isActivating}
        className={`
          flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all duration-200
          ${isActivating 
            ? 'bg-secondary-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 active:bg-green-800'
          } text-white
        `}
      >
        <Zap size={18} />
        <span>{isActivating ? 'Starting Live Assistant...' : 'Start Live Assistant'}</span>
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
  return (
    <div className="flex items-center justify-center w-full h-full gap-3">
      <div className="flex items-center space-x-2 text-green-600">
        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
        <span className="font-medium">Live Assistant Active - Listening...</span>
      </div>
      <button
        onClick={stopSession}
        className="flex items-center space-x-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
      >
        <ZapOff size={18} />
        <span>Disconnect</span>
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
  } = useAppStore();

  const isSessionActive = sessionState === 'connected';

  const startSession = async () => {
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