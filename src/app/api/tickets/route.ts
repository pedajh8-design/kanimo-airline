import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (session.role === 'CUSTOMER') {
      where.userId = session.id;
    } else {
      const filterUserId = searchParams.get('userId');
      if (filterUserId) where.userId = filterUserId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        flight: true,
        ticketTier: true,
        order: {
          select: { orderNumber: true, totalAmount: true, createdAt: true },
        },
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ tickets, count: tickets.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
