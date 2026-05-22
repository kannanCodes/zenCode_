import { Request } from 'express';
import { UserRole } from '../constants/roles';

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    role: UserRole;
  };
}
