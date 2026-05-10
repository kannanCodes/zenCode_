import { UserRole } from "../shared/constants/roles";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: UserRole;
      displayName?: string;
      emails?: Array<{ value: string; verified: boolean }>;
      photos?: Array<{ value: string }>;
    }

    interface Request {
      validatedQuery?: unknown;
    }

  }
}
