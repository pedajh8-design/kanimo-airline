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
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    const tickets = await prisma.supportTicket.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ supportTickets: tickets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { subject, category = 'GENERAL', priority = 'MEDIUM', orderId, initialMessage } = body;

    if (!subject || !initialMessage) {
      return NextResponse.json(
        { error: 'Subject and initial message are required' },
        { status: 400 }
      );
    }

    const ticketCode = `SUP-${Math.floor(10000 + Math.random() * 90000)}`;

    const supportTicket = await prisma.supportTicket.create({
      data: {
        ticketCode,
        userId: session.id,
        orderId: orderId || null,
        subject: subject.trim(),
        category,
        priority,
        status: 'OPEN',
        comments: {
          create: {
            userId: session.id,
            message: initialMessage.trim(),
            isStaffReply: session.role !== 'CUSTOMER',
          },
        },
      },
      include: {
        comments: {
          include: { user: { select: { name: true, role: true } } },
        },
      },
    });

    return NextResponse.json({ success: true, supportTicket }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
