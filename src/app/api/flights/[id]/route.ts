import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flight = await prisma.flight.findUnique({
      where: { id: params.id },
      include: {
        tiers: {
          orderBy: { price: 'asc' },
        },
      },
    });

    if (!flight) {
      return NextResponse.json({ error: 'Flight not found' }, { status: 404 });
    }

    const totalCapacity = flight.tiers.reduce((acc, t) => acc + t.capacity, 0);
    const totalSold = flight.tiers.reduce((acc, t) => acc + t.soldCount, 0);
    const totalReserved = flight.tiers.reduce((acc, t) => acc + t.reservedCount, 0);
    const availableSeats = Math.max(0, totalCapacity - totalSold - totalReserved);

    const formattedTiers = flight.tiers.map((t) => ({
      ...t,
      remainingSeats: Math.max(0, t.capacity - t.soldCount - t.reservedCount),
    }));

    return NextResponse.json({
      flight: {
        ...flight,
        availableSeats,
        totalCapacity,
        tiers: formattedTiers,
      },
    });
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
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Forbidden: Admin or staff access required' }, { status: 403 });
    }

    const body = await req.json();
    const { status, terminal, gate, departureTime, arrivalTime, aircraft, description } = body;

    const data: any = {};
    if (status !== undefined) data.status = status;
    if (terminal !== undefined) data.terminal = terminal;
    if (gate !== undefined) data.gate = gate;
    if (departureTime !== undefined) data.departureTime = new Date(departureTime);
    if (arrivalTime !== undefined) data.arrivalTime = new Date(arrivalTime);
    if (aircraft !== undefined) data.aircraft = aircraft;
    if (description !== undefined) data.description = description;

    const updated = await prisma.flight.update({
      where: { id: params.id },
      data,
      include: { tiers: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'FLIGHT_UPDATED',
        entityType: 'FLIGHT',
        entityId: updated.id,
        details: JSON.stringify(data),
      },
    });

    return NextResponse.json({ success: true, flight: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update flight' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await prisma.flight.delete({
      where: { id: params.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'FLIGHT_DELETED',
        entityType: 'FLIGHT',
        entityId: params.id,
      },
    });

    return NextResponse.json({ success: true, message: 'Flight deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete flight' }, { status: 500 });
  }
}
