import { TokenResponse, RealtimeEvent } from '../types';

export class WebRTCService {
  private baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
  private openaiBaseUrl = 'https://api.openai.com/v1/realtime';
  private model = 'gpt-4o-realtime-preview-2024-12-17';

  async fetchToken(): Promise<string> {
    try {
      const tokenResponse = await fetch(`${this.baseUrl}/api/token`);
      
      if (!tokenResponse.ok) {
        throw new Error(`Token fetch failed: ${tokenResponse.status}`);
      }
      
      const data: TokenResponse = await tokenResponse.json();
      return data.client_secret.value;
    } catch (error) {
      console.error('Failed to fetch token:', error);
      throw error;
    }
  }

  async createPeerConnection(): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection();
    
    // Log connection state changes
    pc.addEventListener('connectionstatechange', () => {
      console.log('Connection state:', pc.connectionState);
    });

    pc.addEventListener('iceconnectionstatechange', () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    });

    return pc;
  }

  async setupAudio(pc: RTCPeerConnection): Promise<{
    audioElement: HTMLAudioElement;
    localStream: MediaStream;
  }> {
    // Create audio element for playback
    const audioElement = document.createElement('audio');
    audioElement.autoplay = true;
    
    // Set up to play remote audio from the model
    pc.ontrack = (e) => {
      audioElement.srcObject = e.streams[0];
    };

    // Get user media for microphone input
    try {
      const localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      // Add local audio track to peer connection
      pc.addTrack(localStream.getTracks()[0]);
      
      return { audioElement, localStream };
    } catch (error) {
      console.error('Failed to get user media:', error);
      throw new Error('Microphone access is required for realtime chat');
    }
  }

  createDataChannel(pc: RTCPeerConnection): RTCDataChannel {
    const dataChannel = pc.createDataChannel('oai-events');
    
    dataChannel.addEventListener('open', () => {
      console.log('Data channel opened');
    });

    dataChannel.addEventListener('close', () => {
      console.log('Data channel closed');
    });

    dataChannel.addEventListener('error', (error) => {
      console.error('Data channel error:', error);
    });

    return dataChannel;
  }

  async establishConnection(pc: RTCPeerConnection, ephemeralKey: string): Promise<void> {
    // Create and set local description
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    // Send SDP offer to OpenAI
    const sdpResponse = await fetch(`${this.openaiBaseUrl}?model=${this.model}`, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        'Authorization': `Bearer ${ephemeralKey}`,
        'Content-Type': 'application/sdp',
      },
    });

    if (!sdpResponse.ok) {
      throw new Error(`SDP exchange failed: ${sdpResponse.status}`);
    }

    // Set remote description
    const answer = {
      type: 'answer' as RTCSdpType,
      sdp: await sdpResponse.text(),
    };
    
    await pc.setRemoteDescription(answer);
  }

  sendClientEvent(dataChannel: RTCDataChannel, message: any): void {
    if (dataChannel.readyState !== 'open') {
      console.warn('Data channel is not open, cannot send message');
      return;
    }

    try {
      // Add event ID if not present
      if (!message.event_id) {
        message.event_id = crypto.randomUUID();
      }

      const messageString = JSON.stringify(message);
      dataChannel.send(messageString);
      
      console.log('Sent client event:', message.type);
    } catch (error) {
      console.error('Failed to send client event:', error);
    }
  }

  sendTextMessage(dataChannel: RTCDataChannel, text: string): void {
    const conversationItemEvent = {
      type: 'conversation.item.create',
      item: {
        type: 'message',
        role: 'user',
        content: [{
          type: 'input_text',
          text: text,
        }],
      },
    };

    const responseCreateEvent = {
      type: 'response.create',
    };

    // Send both events
    this.sendClientEvent(dataChannel, conversationItemEvent);
    this.sendClientEvent(dataChannel, responseCreateEvent);
  }

  setupDataChannelListeners(
    dataChannel: RTCDataChannel,
    onEvent: (event: RealtimeEvent) => void
  ): void {
    dataChannel.addEventListener('message', (e) => {
      try {
        const event = JSON.parse(e.data);
        
        // Add timestamp if not present
        if (!event.timestamp) {
          event.timestamp = new Date().toISOString();
        }

        // Mark as server event
        event.isClient = false;

        onEvent(event);
        console.log('Received server event:', event.type);
        
        // Send to backend for terminal logging
        this.sendEventToBackendLog(event);
      } catch (error) {
        console.error('Failed to parse server event:', error);
      }
    });
  }

  sendEventToBackendLog(event: RealtimeEvent): void {
    try {
      fetch(`${this.baseUrl}/api/log-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event }),
      }).catch(error => {
        // Silently fail if backend logging is unavailable
        console.debug('Backend logging unavailable:', error);
      });
    } catch (error) {
      console.debug('Failed to send event to backend log:', error);
    }
  }

  cleanup(
    pc: RTCPeerConnection | null,
    dataChannel: RTCDataChannel | null,
    localStream: MediaStream | null,
    audioElement: HTMLAudioElement | null
  ): void {
    try {
      // Close data channel
      if (dataChannel) {
        dataChannel.close();
      }

      // Stop local stream tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }

      // Close peer connection
      if (pc) {
        pc.close();
      }

      // Clean up audio element
      if (audioElement) {
        audioElement.srcObject = null;
        audioElement.remove();
      }

      console.log('WebRTC cleanup completed');
    } catch (error) {
      console.error('Error during WebRTC cleanup:', error);
    }
  }
}

export const webrtcService = new WebRTCService();