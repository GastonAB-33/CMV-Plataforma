export const AUTH_COOKIE_NAME = 'cmv_auth_session';

export const ALLOWED_ROLES = ['apostol', 'lider', 'pastor'] as const;

export type AllowedRole = (typeof ALLOWED_ROLES)[number];

export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export function isAllowedRole(role: string): role is AllowedRole {
  return ALLOWED_ROLES.includes(role as AllowedRole);
}
