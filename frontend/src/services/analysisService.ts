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
      console.log('✅ Analysis update:', data);
      const { setClaudeAnalysis, setAnalyzing, addNegotiationSuggestion } = useAppStore.getState();
      
      // Update Claude analysis state
      setClaudeAnalysis({
        negotiationPotential: data.analysis.negotiationPotential,
        opportunities: data.analysis.opportunities || [],
        strategies: data.analysis.strategies || [],
        warningFlags: data.analysis.warningFlags || [],
        nextSteps: data.analysis.nextSteps || '',
        isAnalyzing: false,
      });
      
      setAnalyzing(false);

      // Convert analysis to negotiation suggestions format
      this.convertAnalysisToSuggestions(data.analysis);
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

  private convertAnalysisToSuggestions(analysis: any) {
    const { addNegotiationSuggestion, clearNegotiationSuggestions } = useAppStore.getState();
    
    // Clear existing suggestions
    clearNegotiationSuggestions();

    // Convert opportunities to high-priority suggestions
    analysis.opportunities?.forEach((opp: any, index: number) => {
      const suggestion: Omit<NegotiationSuggestion, 'id' | 'timestamp'> = {
        type: 'opportunity',
        priority: 'high',
        text: `${opp.area}: ${opp.suggestion}${opp.leverage ? ` (Leverage: ${opp.leverage})` : ''}`,
      };
      
      setTimeout(() => addNegotiationSuggestion(suggestion), index * 200);
    });

    // Convert strategies to medium-priority suggestions
    analysis.strategies?.forEach((strategy: string, index: number) => {
      const suggestion: Omit<NegotiationSuggestion, 'id' | 'timestamp'> = {
        type: 'suggestion',
        priority: 'medium',
        text: strategy,
      };
      
      setTimeout(() => addNegotiationSuggestion(suggestion), (analysis.opportunities?.length || 0) * 200 + index * 200);
    });

    // Convert warning flags to high-priority warnings
    analysis.warningFlags?.forEach((warning: string, index: number) => {
      const suggestion: Omit<NegotiationSuggestion, 'id' | 'timestamp'> = {
        type: 'warning',
        priority: 'high',
        text: warning,
      };
      
      setTimeout(() => addNegotiationSuggestion(suggestion), 
        ((analysis.opportunities?.length || 0) + (analysis.strategies?.length || 0)) * 200 + index * 200);
    });
  }

  // Force analysis via API call
  async forceAnalysis(): Promise<void> {
    try {
      const response = await fetch('http://localhost:3001/api/analyze-force', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: 'manual'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to trigger analysis');
      }

      const result = await response.json();
      console.log('🔧 Manual analysis triggered:', result);
    } catch (error) {
      console.error('❌ Force analysis error:', error);
      const { setError } = useAppStore.getState();
      setError(error instanceof Error ? error.message : 'Failed to trigger analysis');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Create singleton instance
export const analysisService = new AnalysisService();