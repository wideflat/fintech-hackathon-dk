import io, { Socket } from 'socket.io-client';
import { useAppStore } from '../store/useAppStore';
import { NegotiationSuggestion } from '../types';

class AnalysisService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket) {
      return;
    }

    this.socket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔗 Connected to analysis service');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('📴 Disconnected from analysis service');
      this.isConnected = false;
    });

    // Listen for analysis events
    this.socket.on('analysis-started', (data) => {
      console.log('🔍 Analysis started:', data);
      const { setAnalyzing } = useAppStore.getState();
      setAnalyzing(true);
    });

    this.socket.on('analysis-update', (data) => {
      console.log('✅ Analysis update received:', data);
      console.log('📊 Analysis data:', data.analysis);
      const { setClaudeAnalysis, setAnalyzing } = useAppStore.getState();
      
      // Update Claude analysis state with simplified format
      setClaudeAnalysis({
        negotiationPotential: data.analysis.negotiationPotential,
        mainRecommendation: data.analysis.mainRecommendation || null,
        quickTip: data.analysis.quickTip || null,
        isAnalyzing: false,
      });
      
      setAnalyzing(false);
    });

    this.socket.on('analysis-error', (data) => {
      console.error('❌ Analysis error:', data);
      const { setAnalyzing, setError } = useAppStore.getState();
      setAnalyzing(false);
      setError(`Analysis failed: ${data.error}`);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }



  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
export const analysisService = new AnalysisService();