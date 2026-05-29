import { AiHintResponseDto, AiHintStatusDto } from '../../../dtos/ai-hint/ai-hint.dto';

export interface IAiHintService {
  generateHint(userId: string, problemId: string): Promise<AiHintResponseDto>;
  getStatus(userId: string, problemId: string): Promise<AiHintStatusDto>;
}
