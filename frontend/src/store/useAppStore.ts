import { create } from "zustand";
import {
  AppState,
  AppMode,
  LoanEstimate,
  ComparisonResult,
  ChatMessage,
  TranscriptionMessage,
  NegotiationSuggestion,
  RealtimeEvent,
  SessionState,
  WebRTCConnection,
  ClaudeAnalysis,
} from "../types";

interface AppStore extends AppState {
  // Actions
  setMode: (mode: AppMode) => void;
  setLoanEstimate: (
    lender: "lenderA" | "lenderB",
    estimate: LoanEstimate
  ) => void;
  clearLoanEstimates: () => void;
  setComparisonResult: (result: ComparisonResult) => void;
  addChatMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  addTranscriptionMessage: (
    message: Omit<TranscriptionMessage, "id" | "timestamp">
  ) => void;
  addNegotiationSuggestion: (
    suggestion: Omit<NegotiationSuggestion, "id" | "timestamp">
  ) => void;
  addRealtimeEvent: (event: RealtimeEvent) => void;
  clearChatMessages: () => void;
  clearTranscriptionMessages: () => void;
  clearNegotiationSuggestions: () => void;
  clearRealtimeEvents: () => void;
  setRecording: (isRecording: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  // WebRTC Actions
  setSessionState: (state: SessionState) => void;
  setWebRTCConnection: (connection: Partial<WebRTCConnection>) => void;
  clearWebRTCConnection: () => void;
  // Claude Analysis Actions
  setClaudeAnalysis: (analysis: Partial<ClaudeAnalysis>) => void;
  setAnalyzing: (isAnalyzing: boolean) => void;
  clearAnalysis: () => void;
  reset: () => void;
}

const initialWebRTCConnection: WebRTCConnection = {
  peerConnection: null,
  dataChannel: null,
  audioElement: null,
  localStream: null,
};

const initialClaudeAnalysis: ClaudeAnalysis = {
  negotiationPotential: null,
  opportunities: [],
  strategies: [],
  warningFlags: [],
  nextSteps: "",
  lastUpdated: null,
  isAnalyzing: false,
};

const initialState: AppState = {
  mode: "comparison",
  loanEstimates: {
    lenderA: null,
    lenderB: null,
  },
  comparisonResult: null,
  chatMessages: [],
  transcriptionMessages: [],
  negotiationSuggestions: [],
  realtimeEvents: [],
  isRecording: false,
  isLoading: false,
  error: null,
  sessionState: "idle",
  webrtcConnection: initialWebRTCConnection,
  claudeAnalysis: initialClaudeAnalysis,
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setMode: (mode) => set({ mode }),

  setLoanEstimate: (lender, estimate) =>
    set((state) => ({
      loanEstimates: {
        ...state.loanEstimates,
        [lender]: estimate,
      },
    })),

  clearLoanEstimates: () =>
    set((state) => ({
      loanEstimates: {
        lenderA: null,
        lenderB: null,
      },
      comparisonResult: null,
    })),

  setComparisonResult: (result) => set({ comparisonResult: result }),

  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
      ],
    })),

  addTranscriptionMessage: (message) =>
    set((state) => ({
      transcriptionMessages: [
        ...state.transcriptionMessages,
        {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
      ],
    })),

  addNegotiationSuggestion: (suggestion) =>
    set((state) => ({
      negotiationSuggestions: [
        ...state.negotiationSuggestions,
        {
          ...suggestion,
          id: Date.now().toString(),
          timestamp: new Date(),
        },
      ],
    })),

  addRealtimeEvent: (event) =>
    set((state) => ({
      realtimeEvents: [event, ...state.realtimeEvents],
    })),

  clearChatMessages: () => set({ chatMessages: [] }),

  clearTranscriptionMessages: () => set({ transcriptionMessages: [] }),

  clearNegotiationSuggestions: () => set({ negotiationSuggestions: [] }),

  clearRealtimeEvents: () => set({ realtimeEvents: [] }),

  setRecording: (isRecording) => set({ isRecording }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  // WebRTC Actions
  setSessionState: (sessionState) => set({ sessionState }),

  setWebRTCConnection: (connection) =>
    set((state) => ({
      webrtcConnection: {
        ...state.webrtcConnection,
        ...connection,
      },
    })),

  clearWebRTCConnection: () => set({ webrtcConnection: initialWebRTCConnection }),

  // Claude Analysis Actions
  setClaudeAnalysis: (analysis) =>
    set((state) => ({
      claudeAnalysis: {
        ...state.claudeAnalysis,
        ...analysis,
        lastUpdated: new Date(),
      },
    })),

  setAnalyzing: (isAnalyzing) =>
    set((state) => ({
      claudeAnalysis: {
        ...state.claudeAnalysis,
        isAnalyzing,
      },
    })),

  clearAnalysis: () => set({ claudeAnalysis: initialClaudeAnalysis }),

  reset: () => set(initialState),
}));
