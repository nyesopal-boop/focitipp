import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken, createSessionCookie } from '@/lib/auth';

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface EmailLoginRequest {
  email: string;
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailLoginRequest = await request.json();
    const { email } = body;

    if (!email?.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      include: { subscription: true },
    });

    if (!user) {
      // Create new user if doesn't exist
      const result = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            email: trimmedEmail,
            hashedPassword: '', // Not needed for email-only auth
            name: trimmedEmail.split('@')[0], // Use email prefix as name
            role: 'user',
          },
        });

        const subscription = await tx.subscription.create({
          data: {
            userId: newUser.id,
            status: 'inactive',
          },
        });

        return { ...newUser, subscription };
      });

      user = result;

      // Audit log for new user
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'USER_REGISTERED',
          details: `User auto-registered via email: ${trimmedEmail}`,
        },
      });
    }

    // Generate token and set cookie
    const token = generateToken(user);
    const sessionCookie = createSessionCookie(token);

    const response = NextResponse.json({ ok: true });
    response.headers.set('Set-Cookie', sessionCookie);

    // Audit log for login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: `User logged in via email: ${trimmedEmail}`,
      },
    });

    return response;
  } catch (error) {
    console.error('Email login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}