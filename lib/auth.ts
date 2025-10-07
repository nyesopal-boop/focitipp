import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';
import { User } from '@prisma/client';
import { env } from './env';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: User): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '30d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  
  // If no Authorization header, try to get token from cookies
  if (!token) {
    const cookieHeader = request.headers.get('cookie') || '';
    const sessionMatch = cookieHeader.match(/session=([^;]+)/);
    token = sessionMatch ? sessionMatch[1] : undefined;
  }
  
  if (!token) return null;
  
  const payload = verifyToken(token);
  if (!payload) return null;
  
  return prisma.user.findUnique({
    where: { id: payload.userId },
    include: { subscription: true },
  });
}

export function createSessionCookie(token: string): string {
  const maxAge = 30 * 24 * 60 * 60; // 30 days
  const secure = env.NODE_ENV === 'production';
  return `session=${token}; HttpOnly; ${secure ? 'Secure;' : ''} SameSite=Lax; Max-Age=${maxAge}; Path=/`;
}

export function clearSessionCookie(): string {
  return 'session=; HttpOnly; SameSite=Lax; Max-Age=0; Path=/';
}