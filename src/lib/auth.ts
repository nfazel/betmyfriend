import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const COOKIE_NAME = 'session';
const SECRET_KEY = process.env.SESSION_SECRET || 'default-fallback-secret-key-change-in-prod';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function sign(value: string): string {
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(value).digest('hex');
  return `${value}.${signature}`;
}

function unsign(signedValue: string): string | null {
  const parts = signedValue.split('.');
  if (parts.length !== 2) return null;
  const [value, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(value).digest('hex');
  const left = Buffer.from(signature);
  const right = Buffer.from(expectedSignature);
  if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null;
  return value;
}

export async function setSessionCookie(userId: string): Promise<void> {
  const signed = sign(userId);
  cookies().set(COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 1 week
  });
}

export function getSessionUserId(): string | null {
  const cookieStore = cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;
  return unsign(cookie.value);
}

export async function clearSessionCookie(): Promise<void> {
  cookies().set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
