import { create } from "zustand";
import {
  AppState,
  AppMode,
  LoanEstimate,
  ComparisonResult,
  ChatMessage,
  TranscriptionMessage,
  NegotiationSuggestion,
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
  clearChatMessages: () => void;
  clearTranscriptionMessages: () => void;
  clearNegotiationSuggestions: () => void;
  setRecording: (isRecording: boolean) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

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
  isRecording: false,
  isLoading: false,
  error: null,
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

  clearChatMessages: () => set({ chatMessages: [] }),

  clearTranscriptionMessages: () => set({ transcriptionMessages: [] }),

  clearNegotiationSuggestions: () => set({ negotiationSuggestions: [] }),

  setRecording: (isRecording) => set({ isRecording }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));
