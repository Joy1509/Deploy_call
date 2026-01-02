export const USER_ROLES = {
  HOST: 'HOST',
  ADMIN: 'ADMIN',
  ENGINEER: 'ENGINEER'
} as const;

export const CALL_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  COMPLETED: 'COMPLETED'
} as const;

export const CARRY_IN_SERVICE_STATUS = {
  PENDING: 'PENDING',
  COMPLETED_NOT_COLLECTED: 'COMPLETED_NOT_COLLECTED',
  COMPLETED_AND_COLLECTED: 'COMPLETED_AND_COLLECTED'
} as const;

export const NOTIFICATION_TYPES = {
  DUPLICATE_CALL: 'DUPLICATE_CALL',
  CALL_ASSIGNED: 'CALL_ASSIGNED',
  CALL_COMPLETED: 'CALL_COMPLETED',
  USER_CREATED: 'USER_CREATED',
  USER_UPDATED: 'USER_UPDATED',
  USER_DELETED: 'USER_DELETED'
} as const;

export const API_ROUTES = {
  V1: '/api/v1'
} as const;

export const RATE_LIMIT = {
  LOGIN_ATTEMPTS: parseInt(process.env.MAX_LOGIN_ATTEMPTS || '5'),
  LOGIN_WINDOW: parseInt(process.env.LOGIN_WINDOW_MS || '900000'), // 15 minutes
  API_REQUESTS: parseInt(process.env.MAX_API_REQUESTS || '100'),
  API_WINDOW: parseInt(process.env.API_WINDOW_MS || '900000') // 15 minutes
} as const;

export const EMAIL_CONFIG = {
  HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  PORT: parseInt(process.env.EMAIL_PORT || '587'),
  USER: process.env.EMAIL_USER || '',
  PASS: process.env.EMAIL_PASS || ''
} as const;

export const SECURITY = {
  ACCOUNT_LOCKOUT_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION: 30 * 60 * 1000, // 30 minutes
  OTP_EXPIRY: 10 * 60 * 1000, // 10 minutes
  NOTIFICATION_CLEANUP_HOURS: 24
} as const;