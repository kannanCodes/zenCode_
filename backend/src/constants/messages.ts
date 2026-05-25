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
  RATE_LIMIT_SLOW_DOWN: 'Too many requests. Please slow down.',
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
  PROFILE_FETCHED: 'Mentor profile fetched successfully',
  PROFILE_UPDATED: 'Mentor profile updated successfully',
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

export const COMPILER_MESSAGES = {
  EXECUTION_STARTED: 'Execution started',
  EXECUTION_RESULT: 'Execution result',
  RESULT_NOT_FOUND_OR_EXPIRED: 'Execution result not found or expired',
  FUNCTION_NOT_FOUND: (functionName: string) =>
    `Function '${functionName}' not found in Solution class or global scope.`,
  UNSUPPORTED_LANGUAGE: (language: string) =>
    `Unsupported language for native execution: ${language}`,
  INTERNAL_TEST_MARKERS_NOT_FOUND: 'Internal Error: Test case markers not found',
};

export const PLAN_MESSAGES = {
  CREATED: 'Plan created successfully',
  UPDATED: 'Plan updated successfully',
  FETCHED: 'Plans fetched successfully',
  NOT_FOUND: 'Plan not found',
  ALREADY_EXISTS: 'Plan with this name already exists',
  STATUS_UPDATED: 'Plan status updated successfully',
};

export const GLOBAL_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Internal Server Error',
  UNKNOWN_ERROR: 'Unknown error',
  UNKNOWN_ERROR_OCCURRED: 'Unknown error occurred',
};

export const PAYMENT_MESSAGES = {
  CHECKOUT_CREATED: 'Checkout session created',
  SESSION_VERIFIED_WEBHOOK: 'Session verified successfully (processed by webhook)',
  SESSION_VERIFIED_SYNC: 'Session verified and subscription created synchronously',
  SESSION_REQUIRED: 'Session ID is required',
  UNAUTHORIZED_SESSION: 'Unauthorized session',
  PAYMENT_NOT_COMPLETED: 'Payment not completed',
  NO_SUBSCRIPTION_IN_SESSION: 'No subscription ID found in session',
  FAILED_TO_RETRIEVE_SUBSCRIPTION: 'Failed to retrieve subscription details from Stripe',
  PLAN_NOT_FOUND_FOR_SUBSCRIPTION: 'Plan associated with this subscription not found',
  MISSING_SIGNATURE: 'Missing stripe-signature header',
  INVALID_SIGNATURE: 'Invalid signature',
  WEBHOOK_FAILED: 'Webhook handler failed',
  STRIPE_SECRET_KEY_NOT_CONFIGURED: 'STRIPE_SECRET_KEY is not configured',
  STRIPE_WEBHOOK_SECRET_NOT_CONFIGURED: 'STRIPE_WEBHOOK_SECRET is not configured',
  STRIPE_PRODUCT_CREATION_FAILED: 'Stripe product creation failed',
  STRIPE_CHECKOUT_SESSION_CREATION_FAILED: 'Stripe checkout session creation failed',
  WEBHOOK_SIGNATURE_VERIFICATION_FAILED: 'Webhook signature verification failed',
  CHECKOUT_SESSION_RETRIEVAL_FAILED: 'Failed to retrieve checkout session',
  SUBSCRIPTION_CANCEL_FAILED: 'Failed to cancel subscription',
  SUBSCRIPTION_RESUME_FAILED: 'Failed to resume subscription',
  SUBSCRIPTION_UPGRADE_FAILED: 'Failed to upgrade subscription',
};

export const SUBSCRIPTION_MESSAGES = {
  FETCHED: 'Subscription fetched',
  NOT_FOUND: 'No subscription found',
  WILL_CANCEL: 'Subscription will be cancelled at the end of the current billing period',
  RESUMED: 'Subscription auto-renewal resumed',
  PLAN_CHANGED: 'Plan changed successfully',
  ACTIVE_EXISTS: 'You already have an active subscription. Use plan change to switch plans.',
  ACTIVE_NOT_FOUND: 'No active subscription found',
  CHANGE_CANCELLED_DENIED: 'Auto-renew is disabled. Renew subscription before changing plans.',
  SAME_PLAN: 'You are already on this plan',
  PLAN_NOT_CONFIGURED: 'Plan not found or not configured on Stripe',
  REQUIRED: 'You need an active subscription to access this feature',
  EXPIRED: 'Your subscription has expired. Please renew to continue.',
  FEATURE_DENIED: 'Your current plan does not include access to this feature',
  WEBHOOK_HANDLED: 'Webhook handled',
  WEBHOOK_ERROR: 'Webhook error',
};

export const STORAGE_MESSAGES = {
  S3_CONFIG_MISSING: 'S3 storage configuration is missing',
  AVATAR_UPLOAD_URL_GENERATED: 'Avatar upload URL generated successfully',
  AVATAR_CONTENT_TYPE_INVALID: 'Invalid avatar file type',
  AVATAR_FILE_TOO_LARGE: 'Avatar file is too large',
  AVATAR_FILE_NAME_REQUIRED: 'Avatar file name is required',
  AVATAR_CONTENT_TYPE_REQUIRED: 'Avatar content type is required',
};

export const SUBMISSION_MESSAGES = {
  EXECUTED: 'Submission executed successfully',
  FETCHED: 'Submission fetched successfully',
  NOT_FOUND: 'Submission not found',
  TIMEOUT: 'Execution timeout',
};

export const AVAILABILITY_MESSAGES = {
  NOT_FOUND: 'Mentor availability not found',
  NOT_CONFIGURED: 'Mentor availability not configured',
  INVALID_START_TIME: 'Invalid start time',
  INVALID_END_TIME: 'Invalid end time',
  START_LESS_THAN_END: 'startTime must be less than endTime',
  OVERLAPPING_SLOTS: 'overlapping slots detected',
  UPDATED: 'Availability updated successfully',
  FETCHED: 'Availability fetched successfully',
};

export const SLOT_MESSAGES = {
  FETCHED: 'Mentor slots fetched successfully',
  START_DATE_REQUIRED: 'Start date is required',
  END_DATE_REQUIRED: 'End date is required',
};

export const BOOKING_MESSAGES = {
  PAST_SLOT: 'Cannot book past slots',
  INVALID_SLOT: 'Invalid slot selected',
  ALREADY_BOOKED: 'This slot is already booked',
  NOT_FOUND: 'Booking not found',
  ALREADY_CANCELLED: 'Booking already cancelled',
  CANCELLATION_WINDOW_CLOSED: 'Cannot cancel within 2 hours of session',
  CREATED: 'Booking created successfully',
  FETCHED: 'Bookings fetched successfully',
  MENTOR_FETCHED: 'Mentor bookings fetched successfully',
  CANCELLED: 'Booking cancelled successfully',
};

export const REVIEW_MESSAGES = {
  SUBMITTED: 'Review submitted successfully',
  FETCHED: 'Mentor reviews fetched successfully',
  UNAUTHORIZED_BOOKING: 'Unauthorized to review this booking',
  CANNOT_REVIEW_CANCELLED_OR_NO_SHOW: 'Cannot review a cancelled or no-show session',
  CANNOT_REVIEW_BEFORE_END: 'Cannot review a session before it ends',
  ALREADY_REVIEWED: 'You have already reviewed this session',
};

export const SESSION_MESSAGES = {
  NOT_FOUND: 'Session not found',
  ACCESS_DENIED: 'Access denied',
  UNAVAILABLE: 'Session unavailable',
  CREATED: 'Session created successfully',
  VALIDATED: 'Session access validated',
  PARTICIPANT_ONLINE: 'Participant marked online',
  PARTICIPANT_OFFLINE: 'Participant marked offline',
  ENDED: 'Session ended successfully',
  UNAUTHORIZED_PEER: 'Unauthorized peer signaling',
};

export const CHAT_MESSAGES = {
  MESSAGES_FETCHED: 'Messages fetched successfully',
};

export const VALIDATION_MESSAGES = {
  VALID_EMAIL_REQUIRED: 'Please provide a valid email',
  INVALID_EMAIL: 'Invalid email address',
  PASSWORD_MIN_6: 'Password must be at least 6 characters long',
  FULL_NAME_MIN: 'Name must be at least 2 characters long',
  OTP_LENGTH: 'OTP must be 6 digits',
  OTP_NUMERIC: 'OTP must contain only numbers',
  TOKEN_REQUIRED: 'Token is required',
  CONFIRM_PASSWORD_REQUIRED: 'Confirm password is required',
  PASSWORD_REQUIRED: 'Password is required',
  INVALID_LANGUAGE: 'Invalid language',
  SOURCE_CODE_REQUIRED: 'Source code is required',
  CODE_TOO_LARGE: 'Code too large',
  INPUT_TOO_LARGE: 'Input too large',
  FEATURE_NAME_REQUIRED: 'Feature name is required',
  PLAN_NAME_MIN: 'Plan name must be at least 3 characters',
  PRICE_NON_NEGATIVE: 'Price must be non-negative',
  BILLING_CYCLE_INVALID: 'Billing cycle must be monthly or yearly',
  PLAN_DESCRIPTION_MIN: 'Description must be at least 10 characters',
  FEATURE_REQUIRED: 'At least one feature is required',
  PROBLEM_TAG_REQUIRED: 'At least one problem tag is required',
  PROBLEM_ID_REQUIRED: 'Problem ID is required',
};
