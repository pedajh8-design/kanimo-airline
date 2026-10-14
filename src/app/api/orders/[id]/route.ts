import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    const referer = req.headers.get('referer') || '';
    const isAdminView = referer.includes('/admin');

    if (!session && !isAdminView) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        flight: {
          include: {
            tiers: true,
          },
        },
        items: {
          include: {
            ticketTier: true,
            ticket: true,
          },
        },
        payment: true,
        tickets: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Ownership check: Customer can only view their own order
    if (session && session.role === 'CUSTOMER' && !isAdminView && order.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden: You do not have permission to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    const referer = req.headers.get('referer') || '';
    const isAdminView = referer.includes('/admin') || (session && (session.role === 'ADMIN' || session.role === 'STAFF'));

    if (!session && !isAdminView) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      contactEmail,
      contactPhone,
      customerName,
      status,
      totalAmount,
      paymentMethod,
      passengers,
    } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        tickets: true,
        payment: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (session && session.role === 'CUSTOMER' && !isAdminView && existingOrder.userId !== session.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. If status is transitioning to REFUNDED/CANCELLED from PAID, return seats
      const oldStatus = existingOrder.status;
      const newStatus = status || oldStatus;

      if (oldStatus === 'PAID' && (newStatus === 'REFUNDED' || newStatus === 'CANCELLED')) {
        for (const item of existingOrder.items) {
          await tx.ticketTier.update({
            where: { id: item.ticketTierId },
            data: { soldCount: { decrement: 1 } },
          });
        }
        await tx.ticket.updateMany({
          where: { orderId: existingOrder.id },
          data: { status: 'CANCELLED' },
        });
      } else if ((oldStatus === 'REFUNDED' || oldStatus === 'CANCELLED') && newStatus === 'PAID') {
        for (const item of existingOrder.items) {
          await tx.ticketTier.update({
            where: { id: item.ticketTierId },
            data: { soldCount: { increment: 1 } },
          });
        }
        await tx.ticket.updateMany({
          where: { orderId: existingOrder.id },
          data: { status: 'ISSUED' },
        });
      }

      // 2. Update order basic details
      const updateData: any = {};
      if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
      if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
      if (newStatus !== undefined) updateData.status = newStatus;
      if (totalAmount !== undefined) updateData.totalAmount = parseFloat(totalAmount);
      if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;

      const updatedOrder = await tx.order.update({
        where: { id: existingOrder.id },
        data: updateData,
        include: {
          flight: true,
          items: true,
          tickets: true,
          user: true,
          payment: true,
        },
      });

      // 3. Update customer name if provided
      if (customerName && existingOrder.userId) {
        await tx.user.update({
          where: { id: existingOrder.userId },
          data: { name: customerName },
        });
      }

      // 4. Update passenger details (items and tickets) if provided
      if (passengers && Array.isArray(passengers)) {
        for (const p of passengers) {
          if (p.id) {
            // Update orderItem
            const updatedItem = await tx.orderItem.update({
              where: { id: p.id },
              data: {
                passengerName: p.passengerName || p.name,
                passengerEmail: p.passengerEmail || p.email,
                seatNumber: p.seatNumber || p.seat,
              },
            });

            // Update corresponding ticket
            await tx.ticket.updateMany({
              where: { orderItemId: p.id },
              data: {
                passengerName: p.passengerName || p.name,
                seatNumber: p.seatNumber || p.seat,
              },
            });
          }
        }
      }

      // 5. Update payment record if status changed
      if (existingOrder.payment) {
        await tx.payment.update({
          where: { id: existingOrder.payment.id },
          data: {
            status: newStatus === 'PAID' ? 'SUCCEEDED' : newStatus === 'REFUNDED' ? 'REFUNDED' : 'FAILED',
            amount: totalAmount !== undefined ? parseFloat(totalAmount) : existingOrder.payment.amount,
          },
        });
      }

      return updatedOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Order updated successfully',
      order: result,
    });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    const referer = req.headers.get('referer') || '';
    const isAdminView = referer.includes('/admin') || (session && (session.role === 'ADMIN' || session.role === 'STAFF'));

    if (!session && !isAdminView) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required to delete orders' }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        tickets: true,
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. If order was active/paid, return seat capacity to tier
      if (order.status === 'PAID') {
        for (const item of order.items) {
          await tx.ticketTier.update({
            where: { id: item.ticketTierId },
            data: { soldCount: { decrement: 1 } },
          });
        }
      }

      // 2. Delete tickets explicitly
      await tx.ticket.deleteMany({
        where: { orderId: order.id },
      });

      // 3. Delete order items explicitly
      await tx.orderItem.deleteMany({
        where: { orderId: order.id },
      });

      // 4. Delete payment record explicitly
      if (order.payment) {
        await tx.payment.deleteMany({
          where: { orderId: order.id },
        });
      }

      // 5. Delete the order
      await tx.order.delete({
        where: { id: order.id },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Order ${order.orderNumber} deleted successfully`,
    });
  } catch (error: any) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
