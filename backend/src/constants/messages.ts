import { OTP_LIMITS } from './otp.constants';

export const AUTH_MESSAGES = {
  // Success
  OTP_SENT: 'OTP sent to your email',
  REGISTER_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET_LINK_SENT: 'Password reset link sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',

  // Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  USER_NOT_FOUND: 'User not found',
  USER_BLOCKED: 'Your account has been blocked. Contact support.',
  INVALID_OTP: 'Invalid or expired OTP',
  OTP_EXPIRED: 'OTP has expired. Request a new one.',
  EMAIL_ALREADY_EXISTS: 'Email already registered',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  PASSWORDS_DO_NOT_MATCH: 'Passwords do not match',
  REGISTRATION_NOT_FOUND: 'No pending registration found',
  OTP_COOLDOWN_ACTIVE: `Please wait ${OTP_LIMITS.RESEND_COOLDOWN_SECONDS} seconds before requesting another code`,
  OTP_RESEND_LIMIT_EXCEEDED: `Maximum retry attempts reached. Please try again in ${Math.ceil((OTP_LIMITS.RESEND_COOLDOWN_SECONDS * 10) / 60)} minutes.`,
  REGISTRATION_DATA_EXPIRED: 'Registration data expired',
  EMAIL_SEND_FAILED: 'Failed to send email',
  TOO_MANY_ATTEMPTS: 'Too many attempts. Please try again later.',
  RATE_LIMIT_EXCEEDED: 'Too many requests. Please try again later.',
  ACCESS_DENIED: 'Access denied. You do not have permission to perform this action.',
  TOKEN_REQUIRED: 'Authentication token is required',
};

export const USER_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  PROFILE_NOT_FOUND: 'Profile not found',
};

export const MENTOR_MESSAGES = {
  CREATED_SUCCESS: 'Mentor account created. Temporary password sent to email.',
  PASSWORD_CHANGED: 'Password changed successfully. Please login.',
  TEMP_PASSWORD_SENT: 'Temporary password sent to email',
  ACTIVATED: 'Mentor account activated successfully',
  LOGIN_SUCCESS: 'Mentor login successful',
  NOT_ACTIVATED: 'Mentor account not activated',
  ACCOUNT_DISABLED: 'Account disabled. Contact admin.',
  PASSWORDS_MIN_LENGTH: 'Password must be at least 8 characters',
  INVALID_STATE: 'Invalid mentor state',
  NOT_FOUND: 'Mentor not found',
  INVALID_OPERATION: 'Invalid mentor operation',
  DISABLED_BY_ADMIN: 'Mentor disabled by admin',
  INVALID_INVITE: 'Invalid or Expired Invite Link',
  ACCOUNT_NOT_FOUND: 'Mentor Account not Found',
};

export const ADMIN_MESSAGES = {
  USER_BLOCKED: 'User blocked successfully',
  USER_UNBLOCKED: 'User unblocked successfully',
  MENTOR_DELETED: 'Mentor account deleted',
  LOGIN_SUCCESS: 'Admin login successful',
  MENTOR_INVITE_SENT: 'Mentor invite sent successfully',
  MENTOR_STATUS_UPDATED: 'Mentor status updated',
  MENTOR_INVITE_RESENT: 'Mentor invite resent successfully',
  CANDIDATE_NOT_FOUND: 'Candidate not found',
  USER_ALREADY_EXISTS: 'User Already Exists',
  MENTOR_NOT_FOUND: 'Mentor not found',
  MENTOR_INVALID_OPERATION: 'Invalid mentor operation',
  INVALID_STATUS_VALUE: 'Invalid status value',
  CANNOT_DISABLE_INVITED: 'Cannot disable invited mentor',
  CANNOT_RESEND_ACTIVE: 'Cannot resend invite for active mentor',
  MENTOR_DISABLED_CANNOT_RESEND: 'Mentor disabled by admin',
};

export const PROBLEM_MESSAGES = {
  TITLE_EXISTS: 'Problem with this title already exists',
  NOT_FOUND: 'Problem not found',
  CREATED: 'Problem created successfully',
  UPDATED: 'Problem updated successfully',
  DELETED: 'Problem deleted successfully',
  FETCHED: 'Problems fetched successfully',
  TAGS_FETCHED: 'Tags fetched successfully',
  COMPANY_TAGS_FETCHED: 'Company tags fetched successfully',
};

export const GLOBAL_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
};
