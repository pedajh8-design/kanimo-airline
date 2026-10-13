import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { generateTicketPayload } from '@/lib/ticket-crypto';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    const status = searchParams.get('status');

    const where: any = {};
    if (session.role === 'CUSTOMER') {
      where.userId = session.id;
    } else {
      // Admin/Staff can filter by userId if requested
      const filterUserId = searchParams.get('userId');
      if (filterUserId) where.userId = filterUserId;
    }

    if (orderId) where.id = orderId;
    if (status && status !== 'ALL') where.status = status;

    const orders = await prisma.order.findMany({
      where,
      include: {
        flight: true,
        items: {
          include: {
            ticketTier: true,
            ticket: true,
          },
        },
        payment: true,
        tickets: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Please sign in to book tickets' }, { status: 401 });
    }

    const body = await req.json();
    const {
      flightId,
      ticketTierId,
      passengers,
      contactEmail,
      contactPhone,
      paymentMethod = 'DEMO_PAYMENT',
      cardDetails,
    } = body;

    if (!flightId || !ticketTierId || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return NextResponse.json(
        { error: 'Flight, ticket tier, and at least one passenger are required' },
        { status: 400 }
      );
    }

    const passengerCount = passengers.length;
    const resolvedContactEmail = contactEmail || session.email;

    // Concurrency-safe atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch flight & tier with current counts
      const flight = await tx.flight.findUnique({
        where: { id: flightId },
      });
      if (!flight) {
        throw new Error('NOT_FOUND: Flight not found');
      }

      if (flight.status === 'CANCELLED' || flight.status === 'DEPARTED') {
        throw new Error(`INVALID_STATUS: Flight is currently ${flight.status} and cannot be booked`);
      }

      const tier = await tx.ticketTier.findUnique({
        where: { id: ticketTierId },
      });
      if (!tier || tier.flightId !== flightId) {
        throw new Error('NOT_FOUND: Ticket tier not found for this flight');
      }

      // Check remaining seat availability
      const availableSeats = tier.capacity - (tier.soldCount + tier.reservedCount);
      if (availableSeats < passengerCount) {
        throw new Error(
          `INSUFFICIENT_INVENTORY: Only ${availableSeats} seat(s) available for ${tier.name}. You requested ${passengerCount}.`
        );
      }

      const totalAmount = tier.price * passengerCount;
      const orderNumber = `ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

      const isDemoPayment = paymentMethod === 'DEMO_PAYMENT' || process.env.DEMO_PAYMENT_MODE === 'true';

      // 2. Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.id,
          flightId: flight.id,
          totalAmount,
          status: isDemoPayment ? 'PAID' : 'PENDING',
          paymentMethod: isDemoPayment ? 'DEMO_PAYMENT' : 'STRIPE',
          passengerCount,
          contactEmail: resolvedContactEmail,
          contactPhone: contactPhone || null,
        },
      });

      // 3. Update tier inventory atomically
      if (isDemoPayment) {
        await tx.ticketTier.update({
          where: { id: tier.id },
          data: {
            soldCount: { increment: passengerCount },
          },
        });
      } else {
        // Reserve inventory pending external Stripe webhook
        await tx.ticketTier.update({
          where: { id: tier.id },
          data: {
            reservedCount: { increment: passengerCount },
          },
        });
      }

      // 4. Generate seats and Order Items
      const createdItems = [];
      const createdTickets = [];
      const baseRow = 10 + (tier.soldCount % 20);
      const seatLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

      for (let i = 0; i < passengers.length; i++) {
        const p = passengers[i];
        const assignedSeat = `${baseRow + Math.floor(i / 6)}${seatLetters[(tier.soldCount + i) % 6]}`;

        const item = await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            ticketTierId: tier.id,
            passengerName: p.name || `Passenger ${i + 1}`,
            passengerEmail: p.email || resolvedContactEmail,
            passportNumber: p.passport || null,
            seatNumber: assignedSeat,
            seatPreference: p.seatPreference || 'Window',
            unitPrice: tier.price,
          },
        });
        createdItems.push(item);

        // If payment is completed (Demo mode), issue digital boarding passes immediately
        if (isDemoPayment) {
          const ticketId = crypto.randomUUID();
          const ticketNumber = `TKT-KN-${Math.floor(10000000 + Math.random() * 90000000)}`;

          const security = generateTicketPayload({
            ticketId,
            ticketNumber,
            flightId: flight.id,
            flightNumber: flight.flightNumber,
            passengerName: item.passengerName,
            seatNumber: assignedSeat,
          });

          const ticket = await tx.ticket.create({
            data: {
              id: ticketId,
              ticketNumber,
              orderId: newOrder.id,
              orderItemId: item.id,
              flightId: flight.id,
              ticketTierId: tier.id,
              userId: session.id,
              passengerName: item.passengerName,
              seatNumber: assignedSeat,
              boardingGroup: tier.cabinClass === 'FIRST' ? 'Group 1' : tier.cabinClass === 'BUSINESS' ? 'Group 2' : 'Group 3',
              qrSecurityPayload: security.payload,
              securityHash: security.securityHash,
              status: 'ISSUED',
            },
          });
          createdTickets.push(ticket);
        }
      }

      // 5. If Demo payment, create payment transaction record
      let paymentRecord = null;
      if (isDemoPayment) {
        paymentRecord = await tx.payment.create({
          data: {
            orderId: newOrder.id,
            amount: totalAmount,
            currency: 'USD',
            provider: 'DEMO',
            providerPaymentId: `demo_txn_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
            status: 'SUCCEEDED',
            cardLast4: cardDetails?.last4 || '4242',
            cardBrand: cardDetails?.brand || 'Visa',
            receiptUrl: `/orders/${newOrder.id}`,
            metadata: JSON.stringify({ mode: 'DEVELOPMENT_SIMULATION_CHECKOUT', note: 'Demo payment mode active' }),
          },
        });
      }

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: 'ORDER_CREATED',
          entityType: 'ORDER',
          entityId: newOrder.id,
          details: JSON.stringify({
            orderNumber: newOrder.orderNumber,
            totalAmount,
            passengerCount,
            flightNumber: flight.flightNumber,
            paymentMethod: isDemoPayment ? 'DEMO' : 'STRIPE',
          }),
        },
      });

      return {
        order: newOrder,
        items: createdItems,
        tickets: createdTickets,
        payment: paymentRecord,
        flight,
        tier,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Order created and tickets issued successfully',
        ...result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Order creation error:', error);
    const msg = error.message || '';
    if (msg.startsWith('INSUFFICIENT_INVENTORY')) {
      return NextResponse.json({ error: msg.replace('INSUFFICIENT_INVENTORY: ', '') }, { status: 409 });
    }
    if (msg.startsWith('NOT_FOUND')) {
      return NextResponse.json({ error: msg.replace('NOT_FOUND: ', '') }, { status: 404 });
    }
    if (msg.startsWith('INVALID_STATUS')) {
      return NextResponse.json({ error: msg.replace('INVALID_STATUS: ', '') }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to place order' }, { status: 500 });
  }
}
