import { StartRegistrationDTO, VerifyRegistrationDTO } from '../../dtos/AuthDTO';

export interface IRegistrationService {
  startRegistration(input: StartRegistrationDTO): Promise<void>;
  verifyRegistration(input: VerifyRegistrationDTO): Promise<void>;
}