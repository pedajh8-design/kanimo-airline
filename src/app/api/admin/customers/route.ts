import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            orders: true,
            tickets: true,
            supportTickets: true,
          },
        },
        orders: {
          where: { status: 'PAID' },
          select: { totalAmount: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = customers.map((c) => {
      const totalSpend = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        createdAt: c.createdAt,
        totalOrders: c._count.orders,
        totalTickets: c._count.tickets,
        supportTickets: c._count.supportTickets,
        totalSpend,
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
