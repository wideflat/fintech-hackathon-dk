export interface LoanEstimate {
  lenderName: string;
  interestRate: number;
  points: number;
  pointsCost: number;
  originationFee: number;
  applicationFee: number;
  processingFee: number;
  underwritingFee: number;
  appraisalFee: number;
  titleInsurance: number;
  escrowDeposit: number;
  otherFees: number;
  totalClosingCosts: number;
  monthlyPayment: number;
  loanAmount: number;
  term: number;
}

export interface ComparisonResult {
  recommendation: "lenderA" | "lenderB" | "similar";
  reasoning: string;
  savings: {
    monthly: number;
    total: number;
  };
  breakdown: {
    interestRateComparison: string;
    pointsComparison: string;
    feesComparison: string;
    overallValue: string;
  };
  analysis: {
    lenderAScore: number;
    lenderBScore: number;
    criteria: string[];
    weights: number[];
  };
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "officer";
  timestamp: Date;
}

export interface TranscriptionMessage {
  id: string;
  text: string;
  speaker: "user" | "officer";
  timestamp: Date;
  confidence: number;
}

export interface NegotiationSuggestion {
  id: string;
  type: "suggestion" | "clarification" | "warning" | "opportunity";
  text: string;
  timestamp: Date;
  priority: "low" | "medium" | "high";
}

export interface ClaudeAnalysis {
  negotiationPotential: "Low" | "Medium" | "High" | null;
  mainRecommendation: string | null;
  quickTip: string | null;
  lastUpdated: Date | null;
  isAnalyzing: boolean;
}

export interface RealtimeEvent {
  event_id: string;
  type: string;
  timestamp: string;
  isClient?: boolean;
  data?: any;
}

export type SessionState = 'idle' | 'connecting' | 'connected' | 'error' | 'disconnecting';

export interface WebRTCConnection {
  peerConnection: RTCPeerConnection | null;
  dataChannel: RTCDataChannel | null;
  audioElement: HTMLAudioElement | null;
  localStream: MediaStream | null;
}

export interface TokenResponse {
  client_secret: {
    value: string;
  };
  expires_at: string;
}

export type AppMode = "comparison" | "live-assistant";

export interface AppState {
  mode: AppMode;
  loanEstimates: {
    lenderA: LoanEstimate | null;
    lenderB: LoanEstimate | null;
  };
  comparisonResult: ComparisonResult | null;
  chatMessages: ChatMessage[];
  transcriptionMessages: TranscriptionMessage[];
  negotiationSuggestions: NegotiationSuggestion[];
  realtimeEvents: RealtimeEvent[];
  isRecording: boolean;
  isLoading: boolean;
  error: string | null;
  // WebRTC Session State
  sessionState: SessionState;
  webrtcConnection: WebRTCConnection;
  // Claude Analysis State
  claudeAnalysis: ClaudeAnalysis;
  // Current Lender State
  currentLender: "lenderA" | "lenderB" | null;
}
