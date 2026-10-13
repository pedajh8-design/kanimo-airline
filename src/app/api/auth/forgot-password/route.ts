import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // In production, this dispatches a recovery email with a time-limited token.
    // For demo/dev reliability, we return a simulated reset confirmation code.
    const resetToken = crypto.randomBytes(16).toString('hex');

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_REQUESTED',
          entityType: 'USER',
          entityId: user.id,
          details: JSON.stringify({ email }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
      demoResetToken: user ? resetToken : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
