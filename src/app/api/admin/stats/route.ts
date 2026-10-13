import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [
      totalOrders,
      paidOrders,
      totalFlights,
      totalTickets,
      checkedInTickets,
      openSupportCount,
      recentAuditLogs,
      ticketTiers,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: 'PAID' },
        select: { totalAmount: true },
      }),
      prisma.flight.count(),
      prisma.ticket.count(),
      prisma.ticket.count({ where: { status: 'CHECKED_IN' } }),
      prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.ticketTier.findMany({
        select: {
          cabinClass: true,
          soldCount: true,
          price: true,
        },
      }),
    ]);

    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const checkInRate = totalTickets > 0 ? Math.round((checkedInTickets / totalTickets) * 100) : 0;

    // Revenue by cabin class
    const cabinRevenue: Record<string, number> = {
      ECONOMY: 0,
      PREMIUM_ECONOMY: 0,
      BUSINESS: 0,
      FIRST: 0,
    };
    for (const t of ticketTiers) {
      if (cabinRevenue[t.cabinClass] !== undefined) {
        cabinRevenue[t.cabinClass] += t.soldCount * t.price;
      }
    }

    return NextResponse.json({
      stats: {
        totalRevenue,
        totalOrders,
        totalFlights,
        totalTickets,
        checkedInTickets,
        checkInRate,
        openSupportCount,
        cabinRevenue,
      },
      recentAuditLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
