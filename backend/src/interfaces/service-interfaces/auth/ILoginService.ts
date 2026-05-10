import { LoginDTO } from '../../../dtos/auth/login.dto';
import { AuthTokensDTO } from '../../../dtos/auth/auth-response.dto';
import { RefreshTokenDTO } from '../../../dtos/auth/refresh-token.dto';


export interface ILoginService {
  login(input: LoginDTO): Promise<AuthTokensDTO>;
  refresh(input: RefreshTokenDTO): Promise<AuthTokensDTO>;
  logout(refreshToken: string): Promise<void>;
}


