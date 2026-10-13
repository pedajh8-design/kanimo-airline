import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message || !message.trim()) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Support ticket not found' }, { status: 404 });
    }

    if (session.role === 'CUSTOMER' && ticket.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isStaff = session.role === 'STAFF' || session.role === 'ADMIN';

    const comment = await prisma.supportComment.create({
      data: {
        supportTicketId: ticket.id,
        userId: session.id,
        message: message.trim(),
        isStaffReply: isStaff,
      },
      include: {
        user: { select: { id: true, name: true, role: true } },
      },
    });

    // Update ticket updatedAt and reopen if customer replied to resolved ticket
    const newStatus = !isStaff && ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : ticket.status;
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        updatedAt: new Date(),
        status: newStatus,
      },
    });

    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
