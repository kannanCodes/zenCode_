import { StartRegistrationDTO, VerifyRegistrationDTO } from '../../../dtos/auth/register.dto';

export interface IRegistrationService {
  startRegistration(input: StartRegistrationDTO): Promise<void>;
  verifyRegistration(input: VerifyRegistrationDTO): Promise<void>;
}