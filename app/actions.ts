'use server'

import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';

export async function loginWithTelegramToken(token: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET is missing on server');
    return { error: 'Server configuration error' };
  }

  try {
    // 1. Verify the short-term token
    const decoded = jwt.verify(token, secret) as any;

    if (!decoded.id || !decoded.role) {
      return { error: 'Invalid token structure' };
    }

    // 2. Create a long-term session token (30 days)
    const sessionPayload = {
      id: decoded.id,
      role: decoded.role,
      telegramId: decoded.telegramId
    };

    const sessionToken = jwt.sign(sessionPayload, secret, { expiresIn: '30d' });

    // 3. Set cookie
    const cookieStore = await cookies();
    cookieStore.set('session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
      sameSite: 'lax'
    });

  } catch (err) {
    console.error('Token verification failed:', err);
    return { error: 'Invalid or expired token' };
  }
  
  redirect('/dashboard');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('session');
  redirect('/');
}
