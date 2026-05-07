import { LoginDTO } from '../../dtos/LoginDTO';
import { AuthTokensDTO } from '../../dtos/AuthResponseDTO';
import { RefreshTokenDTO } from '../../dtos/RefreshTokenDTO';


export interface ILoginService {
  login(input: LoginDTO): Promise<AuthTokensDTO>;
  refresh(input: RefreshTokenDTO): Promise<AuthTokensDTO>;
  logout(refreshToken: string): Promise<void>;
}


