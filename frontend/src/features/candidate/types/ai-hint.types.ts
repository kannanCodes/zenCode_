export interface AiHintResponse {
  hint: string;
  remainingProblemHints: number;
  remainingDailyHints: number;
}

export interface AiHintStatusResponse {
  hints: string[];
  remainingProblemHints: number;
  remainingDailyHints: number;
  cooldownRemainingSeconds: number;
}

export interface AiHintPanelState {
  hints: string[];
  remainingProblemHints: number;
  remainingDailyHints: number;
  isLoading: boolean;
  error: string | null;
  isPremiumRequired: boolean;
  cooldownSeconds: number;
}
