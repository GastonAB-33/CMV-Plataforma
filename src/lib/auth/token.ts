import { isAllowedRole, type AllowedRole } from '@/lib/auth/constants';
import type { AuthSession } from '@/lib/auth/types';

export interface SessionTokenPayload {
  email: string;
  nombre: string;
  rol: AllowedRole;
  iat: number;
  exp: number;
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret) {
    throw new Error('Falta AUTH_SESSION_SECRET para firmar/verificar sesión.');
  }

  return secret;
}

function toBase64Url(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(input: string): string {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
  return atob(padded);
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function sign(value: string): Promise<string> {
  const key = await importHmacKey(getAuthSecret());
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  );

  const binary = Array.from(new Uint8Array(signature))
    .map((byte) => String.fromCharCode(byte))
    .join('');

  return toBase64Url(binary);
}

export async function createSignedSessionToken(
  payload: Omit<SessionTokenPayload, 'iat' | 'exp'>,
  maxAgeSeconds: number,
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);

  const tokenPayload: SessionTokenPayload = {
    ...payload,
    iat: now,
    exp: now + maxAgeSeconds,
  };

  const encodedPayload = toBase64Url(JSON.stringify(tokenPayload));
  const signature = await sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export async function verifySignedSessionToken(
  token: string,
): Promise<SessionTokenPayload | null> {
  const [encodedPayload, encodedSignature] = token.split('.');

  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const key = await importHmacKey(getAuthSecret());
  let signatureBytes: number[];

  try {
    signatureBytes = Array.from(fromBase64Url(encodedSignature), (c) =>
      c.charCodeAt(0),
    );
  } catch {
    return null;
  }

  const valid = await crypto.subtle.verify(
    'HMAC',
    key,
    new Uint8Array(signatureBytes),
    new TextEncoder().encode(encodedPayload),
  );

  if (!valid) {
    return null;
  }

  let payload: SessionTokenPayload;

  try {
    payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionTokenPayload;
  } catch {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);

  if (
    !payload.email ||
    !payload.nombre ||
    !isAllowedRole(payload.rol) ||
    payload.exp <= now
  ) {
    return null;
  }

  return payload;
}

export async function parseSessionToken(token: string): Promise<AuthSession | null> {
  const payload = await verifySignedSessionToken(token);

  if (!payload) {
    return null;
  }

  return {
    email: payload.email,
    nombre: payload.nombre,
    rol: payload.rol,
  };
}
