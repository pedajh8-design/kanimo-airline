import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { tierId: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { price, capacity, benefits } = await req.json();

    const tier = await prisma.ticketTier.findUnique({
      where: { id: params.tierId },
    });

    if (!tier) {
      return NextResponse.json({ error: 'Ticket tier not found' }, { status: 404 });
    }

    const data: any = {};
    if (price !== undefined) data.price = parseFloat(price);
    if (capacity !== undefined) {
      const newCapacity = parseInt(capacity, 10);
      if (newCapacity < tier.soldCount) {
        return NextResponse.json(
          { error: `Capacity cannot be lower than already sold seats (${tier.soldCount})` },
          { status: 400 }
        );
      }
      data.capacity = newCapacity;
    }
    if (benefits !== undefined) data.benefits = benefits;

    const updated = await prisma.ticketTier.update({
      where: { id: params.tierId },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'INVENTORY_UPDATED',
        entityType: 'TICKET',
        entityId: updated.id,
        details: JSON.stringify(data),
      },
    });

    return NextResponse.json({ success: true, tier: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
