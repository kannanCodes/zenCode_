import { AuthTokensDTO } from '../../dtos/AuthResponseDTO';

export interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos?: Array<{ value: string }>;
}

export interface IGoogleAuthService {
  authenticateGoogleUser(profile: GoogleProfile): Promise<AuthTokensDTO>;
}

