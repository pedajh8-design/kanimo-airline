import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.toLowerCase();
    const origin = searchParams.get('origin')?.toLowerCase();
    const destination = searchParams.get('destination')?.toLowerCase();
    const category = searchParams.get('category');
    const cabinClass = searchParams.get('cabinClass');
    const status = searchParams.get('status');

    const dateParam = searchParams.get('date');
    const qUpper = q?.toUpperCase();
    const originUpper = origin?.toUpperCase();
    const destUpper = destination?.toUpperCase();

    // Build Prisma where conditions cleanly using AND array
    const conditions: any[] = [];

    if (category && category !== 'ALL') {
      conditions.push({ category });
    }

    if (status && status !== 'ALL') {
      conditions.push({ status });
    }

    if (q) {
      conditions.push({
        OR: [
          { flightNumber: { contains: q } },
          { flightNumber: { contains: qUpper } },
          { origin: { contains: q } },
          { originCity: { contains: q } },
          { originCode: { contains: qUpper } },
          { destination: { contains: q } },
          { destinationCity: { contains: q } },
          { destinationCode: { contains: destUpper } },
          { aircraft: { contains: q } },
        ],
      });
    }

    if (origin) {
      conditions.push({
        OR: [
          { originCode: { contains: originUpper } },
          { originCode: { contains: origin } },
          { originCity: { contains: origin } },
          { origin: { contains: origin } },
        ],
      });
    }

    if (destination) {
      conditions.push({
        OR: [
          { destinationCode: { contains: destUpper } },
          { destinationCode: { contains: destination } },
          { destinationCity: { contains: destination } },
          { destination: { contains: destination } },
        ],
      });
    }

    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) {
        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);
        conditions.push({
          departureTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        });
      }
    }

    const where = conditions.length > 0 ? { AND: conditions } : {};

    const flights = await prisma.flight.findMany({
      where,
      include: {
        tiers: {
          orderBy: { price: 'asc' },
        },
      },
      orderBy: { departureTime: 'asc' },
    });

    // Format flights with calculated stats (minPrice, availableSeats, formatted date)
    const formatted = flights
      .map((f) => {
        let matchingTiers = f.tiers;
        if (cabinClass && cabinClass !== 'ALL') {
          matchingTiers = f.tiers.filter((t) => t.cabinClass === cabinClass);
        }

        const totalCapacity = f.tiers.reduce((acc, t) => acc + t.capacity, 0);
        const totalSold = f.tiers.reduce((acc, t) => acc + t.soldCount, 0);
        const totalReserved = f.tiers.reduce((acc, t) => acc + t.reservedCount, 0);
        const availableSeats = Math.max(0, totalCapacity - totalSold - totalReserved);
        const minPrice = f.tiers.length > 0 ? Math.min(...f.tiers.map((t) => t.price)) : 0;

        return {
          ...f,
          availableSeats,
          totalCapacity,
          minPrice,
          tiers: f.tiers.map((t) => ({
            ...t,
            remainingSeats: Math.max(0, t.capacity - t.soldCount - t.reservedCount),
          })),
        };
      })
      .filter((f) => {
        if (cabinClass && cabinClass !== 'ALL') {
          return f.tiers.some((t) => t.cabinClass === cabinClass && t.remainingSeats > 0);
        }
        return true;
      });

    return NextResponse.json({ flights: formatted, count: formatted.length });
  } catch (error: any) {
    console.error('Error fetching flights:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch flights' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session || (session.role !== 'ADMIN' && session.role !== 'STAFF')) {
      return NextResponse.json({ error: 'Forbidden: Admin or staff access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      flightNumber,
      airline = 'Kanimo Airline',
      aircraft = 'Boeing 787-9 Dreamliner',
      origin,
      originCode,
      originCity,
      destination,
      destinationCode,
      destinationCity,
      departureTime,
      arrivalTime,
      duration,
      category = 'International',
      terminal = 'Terminal 1',
      gate = 'G10',
      imageUrl,
      description,
      tiers = [],
    } = body;

    if (!flightNumber || !origin || !destination || !departureTime || !arrivalTime) {
      return NextResponse.json(
        { error: 'Flight number, origin, destination, and departure/arrival times are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.flight.findUnique({
      where: { flightNumber: flightNumber.toUpperCase().trim() },
    });
    if (existing) {
      return NextResponse.json({ error: 'Flight number already exists' }, { status: 409 });
    }

    const flight = await prisma.flight.create({
      data: {
        flightNumber: flightNumber.toUpperCase().trim(),
        airline,
        aircraft,
        origin,
        originCode: originCode || origin.substring(0, 3).toUpperCase(),
        originCity: originCity || origin,
        destination,
        destinationCode: destinationCode || destination.substring(0, 3).toUpperCase(),
        destinationCity: destinationCity || destination,
        departureTime: new Date(departureTime),
        arrivalTime: new Date(arrivalTime),
        duration: duration || '3h 00m',
        category,
        terminal,
        gate,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
        description,
        tiers: {
          create: tiers.map((t: any) => ({
            name: t.name || 'Economy Class',
            cabinClass: t.cabinClass || 'ECONOMY',
            price: parseFloat(t.price) || 299.0,
            capacity: parseInt(t.capacity, 10) || 150,
            benefits: t.benefits || 'In-flight entertainment, Standard seating',
            baggage: t.baggage || '1 Personal item + 1 Carry-on',
          })),
        },
      },
      include: {
        tiers: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: 'FLIGHT_CREATED',
        entityType: 'FLIGHT',
        entityId: flight.id,
        details: JSON.stringify({ flightNumber: flight.flightNumber }),
      },
    });

    return NextResponse.json({ success: true, flight }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating flight:', error);
    return NextResponse.json({ error: error.message || 'Failed to create flight' }, { status: 500 });
  }
}
