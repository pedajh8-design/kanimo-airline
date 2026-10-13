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

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: params.id },
        include: {
          items: true,
          tickets: true,
          payment: true,
        },
      });

      if (!order) {
        throw new Error('NOT_FOUND: Order not found');
      }

      // Customers can only refund their own orders
      if (session.role === 'CUSTOMER' && order.userId !== session.id) {
        throw new Error('FORBIDDEN: You do not have permission to refund this order');
      }

      if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
        throw new Error('INVALID_STATUS: Order is already cancelled or refunded');
      }

      // Check if any ticket has already been checked in or boarded
      const checkedInTicket = order.tickets.find((t) => t.status === 'CHECKED_IN' || t.status === 'BOARDED');
      if (checkedInTicket) {
        throw new Error('CANNOT_REFUND: Ticket has already been checked-in/boarded and cannot be refunded');
      }

      // 1. Mark order as REFUNDED
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: 'REFUNDED' },
      });

      // 2. Mark tickets as CANCELLED
      await tx.ticket.updateMany({
        where: { orderId: order.id },
        data: { status: 'CANCELLED' },
      });

      // 3. Mark payment as REFUNDED
      if (order.payment) {
        await tx.payment.update({
          where: { id: order.payment.id },
          data: { status: 'REFUNDED' },
        });
      }

      // 4. Return seat capacity back to tier
      for (const item of order.items) {
        await tx.ticketTier.update({
          where: { id: item.ticketTierId },
          data: {
            soldCount: { decrement: 1 },
          },
        });
      }

      // 5. Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'ORDER_REFUNDED',
          entityType: 'ORDER',
          entityId: order.id,
          details: JSON.stringify({
            orderNumber: order.orderNumber,
            refundedBy: session.role,
            amount: order.totalAmount,
          }),
        },
      });

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order refunded successfully and ticket capacity restored',
      order: result,
    });
  } catch (error: any) {
    const msg = error.message || '';
    if (msg.startsWith('NOT_FOUND')) return NextResponse.json({ error: msg.replace('NOT_FOUND: ', '') }, { status: 404 });
    if (msg.startsWith('FORBIDDEN')) return NextResponse.json({ error: msg.replace('FORBIDDEN: ', '') }, { status: 403 });
    if (msg.startsWith('INVALID_STATUS') || msg.startsWith('CANNOT_REFUND')) {
      return NextResponse.json({ error: msg.replace(/^[A-Z_]+: /, '') }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Refund processing failed' }, { status: 500 });
  }
}
