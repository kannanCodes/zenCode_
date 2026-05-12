import { AdminLoginInput } from '../../../dtos/admin/admin-auth.dto';

export interface IAdminAuthService {
  login(input: AdminLoginInput): Promise<{ accessToken: string; refreshToken: string }>;
  refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
  logout(refreshToken: string): Promise<void>;
}
