export interface AiHintResponseDto {
  hint: string;
  remainingProblemHints: number;
  remainingDailyHints: number;
}

export interface AiHintStatusDto {
  hints: string[];
  remainingProblemHints: number;
  remainingDailyHints: number;
  cooldownRemainingSeconds: number;
}

export interface AiHintUsageSnapshot {
  hintsUsed: number;
  lastHintAt: Date | null;
}
