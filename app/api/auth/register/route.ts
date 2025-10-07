import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken, createSessionCookie } from '@/lib/auth';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name } = body;

    // Validations
    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name?.trim();

    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and subscription in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: trimmedEmail,
          hashedPassword,
          name: trimmedName,
          role: 'user',
        },
      });

      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          status: 'inactive',
        },
      });

      return { user, subscription };
    });

    // Generate token and set cookie
    const token = generateToken(result.user);
    const sessionCookie = createSessionCookie(token);

    const response = NextResponse.json({ ok: true });
    response.headers.set('Set-Cookie', sessionCookie);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: result.user.id,
        action: 'USER_REGISTERED',
        details: `User registered: ${trimmedEmail}`,
      },
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}